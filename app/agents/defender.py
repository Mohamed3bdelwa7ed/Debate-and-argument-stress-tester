from pathlib import Path

from app.schemas.debate import DefenderOutput, DefenderRebuttal
from app.services.llm_service import LLMService


class DefenderAgent:
    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm or LLMService()
        self.system_prompt = Path(__file__).parent.parent.joinpath("prompts", "defender.txt").read_text()

    def _build_prompt(
        self, thesis: str, challenger_arguments: list[dict], previous_rounds: list[dict]
    ) -> str:
        prompt = f"Thesis: {thesis}\n\n"
        prompt += "Challenger arguments to rebut:\n"
        for arg in challenger_arguments:
            prompt += f"- '{arg.get('title')}': {arg.get('argument')}\n"

        if previous_rounds:
            prompt += "\nPrevious rounds:\n"
            for r in previous_rounds:
                prompt += f"\n--- Round {r.get('round_number')} ---\n"
                args = r.get("challenger_arguments") or []
                for arg in args:
                    prompt += f"Challenger argument '{arg.get('title')}': {arg.get('argument')}\n"
                rebs = r.get("defender_rebuttals") or []
                for reb in rebs:
                    prompt += f"Defender rebuttal to '{reb.get('argument_title')}': {reb.get('response')}\n"
                prompt += f"Judge winner: {r.get('winner')}\n"
                prompt += f"Strongest argument: {r.get('strongest_argument')}\n"
                prompt += f"Weakest rebuttal: {r.get('weakest_rebuttal')}\n"

        prompt += "\nRespond with JSON containing a 'rebuttals' array. Each item must have 'argument_title' and 'response'. Provide one rebuttal for each Challenger argument title.\n"
        return prompt

    async def run(
        self, thesis: str, challenger_arguments: list[dict], previous_rounds: list[dict]
    ) -> list[DefenderRebuttal]:
        user_prompt = self._build_prompt(thesis, challenger_arguments, previous_rounds)
        output = await self.llm.generate_structured(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            output_schema=DefenderOutput,
        )
        return output.rebuttals
