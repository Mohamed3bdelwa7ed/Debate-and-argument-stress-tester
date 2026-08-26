import json
import re
from typing import TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from app.core.config import settings

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


def _extract_json(content: str) -> str:
    content = content.strip()
    # Strip markdown code fences if present.
    if content.startswith("```"):
        lines = content.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        content = "\n".join(lines).strip()

    # If the response starts with some non-JSON text, try to find the first JSON object/array.
    if not content.startswith(("{", "[")):
        match = re.search(r"(\{|\[)", content)
        if match:
            content = content[match.start():]
        # Try to find matching end brace/bracket.
        match = re.search(r"[}\]]\s*$", content)
        if match:
            content = content[: match.end()]
    return content.strip()


class LLMService:
    def __init__(self) -> None:
        self.base_url = settings.llm_base_url.rstrip("/")
        self.api_key = settings.llm_api_key
        self.model = settings.llm_model

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[T],
        max_retries: int = 2,
    ) -> T:
        schema = output_schema.model_json_schema()

        messages = [
            {
                "role": "system",
                "content": (
                    f"{system_prompt}\n\n"
                    "You must respond with valid JSON only. Do not include markdown code fences, explanations, or any text outside the JSON object. "
                    f"The JSON must conform to this schema: {json.dumps(schema)}"
                ),
            },
            {"role": "user", "content": user_prompt},
        ]

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": messages,
        }

        # Only use response_format if the provider advertises support via env; otherwise rely on prompt engineering.
        # For OpenAI-compatible APIs, requesting JSON mode improves reliability.
        if self.base_url:
            payload["response_format"] = {"type": "json_object"}

        last_error: Exception | None = None
        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(max_retries + 1):
                try:
                    response = await client.post(
                        f"{self.base_url}/chat/completions", headers=headers, json=payload
                    )
                    response.raise_for_status()
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    cleaned = _extract_json(content)
                    parsed = json.loads(cleaned)
                    return output_schema.model_validate(parsed)
                except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                    last_error = exc
                    if attempt < max_retries:
                        continue
                    raise LLMError("AI_PROVIDER_ERROR", f"LLM provider error: {exc}") from exc
                except (json.JSONDecodeError, ValidationError, KeyError) as exc:
                    last_error = exc
                    if attempt < max_retries:
                        continue
                    raise LLMError("AI_GENERATION_ERROR", f"Invalid structured output: {exc}") from exc

        raise LLMError("AI_GENERATION_ERROR", f"Failed after retries: {last_error}")


llm_service = LLMService()
