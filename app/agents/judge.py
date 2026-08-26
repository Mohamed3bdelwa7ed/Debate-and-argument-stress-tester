from pathlib import Path

from app.schemas.debate import JudgeOutput
from app.services.llm_service import LLMService


class JudgeAgent:
    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm or LLMService()
        self.system_prompt = Path(__file__).parent.parent.joinpath("prompts", "judge.txt").read_text()

    def _build_prompt(
        self,
        thesis: str,
        challenger_arguments: list[dict],
        defender_rebuttals: list[dict],
        previous_rounds: list[dict],
    ) -> str:
        prompt = f"Thesis: {thesis}\n\n"

        prompt += "Challenger arguments:\n"
        for arg in challenger_arguments:
            prompt += f"- '{arg.get('title')}': {arg.get('argument')}\n"

        prompt += "\nDefender rebuttals:\n"
        for reb in defender_rebuttals:
            prompt += f"- to '{reb.get('argument_title')}': {reb.get('response')}\n"

        if previous_rounds:
            prompt += "\nPrevious rounds (for context):\n"
            for r in previous_rounds:
                prompt += f"\n--- Round {r.get('round_number')} ---\n"
                prompt += f"Challenger score: {r.get('challenger_score')}\n"
                prompt += f"Defender score: {r.get('defender_score')}\n"
                prompt += f"Winner: {r.get('winner')}\n"
                prompt += f"Reason: {r.get('judge_reason')}\n"

        prompt += "\nEvaluate this round and respond with JSON containing: challenger_score (0-10), defender_score (0-10), winner ('challenger', 'defender', or 'tie'), reason, strongest_argument, weakest_rebuttal.\n"
        return prompt

    async def run(
        self,
        thesis: str,
        challenger_arguments: list[dict],
        defender_rebuttals: list[dict],
        previous_rounds: list[dict],
    ) -> JudgeOutput:
        user_prompt = self._build_prompt(
            thesis, challenger_arguments, defender_rebuttals, previous_rounds
        )
        return await self.llm.generate_structured(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            output_schema=JudgeOutput,
        )
