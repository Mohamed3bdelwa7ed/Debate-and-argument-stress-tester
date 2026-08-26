from pathlib import Path

from app.schemas.debate import ChallengerArgument, ChallengerOutput
from app.services.llm_service import LLMService


class ChallengerAgent:
    def __init__(self, llm: LLMService | None = None) -> None:
        self.llm = llm or LLMService()
        self.system_prompt = Path(__file__).parent.parent.joinpath("prompts", "challenger.txt").read_text()

    def _build_prompt(
        self, thesis: str, current_round: int, previous_rounds: list[dict]
    ) -> str:
        prompt = f"Thesis: {thesis}\n\n"
        prompt += f"Current round: {current_round}\n\n"

        if previous_rounds:
            prompt += "Previous rounds:\n"
            for r in previous_rounds:
                prompt += f"\n--- Round {r.get('round_number')} ---\n"
                args = r.get("challenger_arguments") or []
                for arg in args:
                    prompt += f"Challenger argument '{arg.get('title')}': {arg.get('argument')}\n"
                rebs = r.get("defender_rebuttals") or []
                for reb in rebs:
                    prompt += f"Defender rebuttal to '{reb.get('argument_title')}': {reb.get('response')}\n"
                prompt += f"Judge winner: {r.get('winner')}\n"
                prompt += f"Judge reason: {r.get('judge_reason')}\n"
                prompt += f"Strongest argument: {r.get('strongest_argument')}\n"
                prompt += f"Weakest rebuttal: {r.get('weakest_rebuttal')}\n"
            prompt += "\nIn this round, focus on attacking unresolved weaknesses from previous rounds.\n"
        else:
            prompt += "This is the first round. Generate the strongest initial counterarguments.\n"

        prompt += "\nRespond with JSON containing an 'arguments' array. Each item must have 'title' and 'argument'.\n"
        return prompt

    async def run(
        self, thesis: str, current_round: int, previous_rounds: list[dict]
    ) -> list[ChallengerArgument]:
        user_prompt = self._build_prompt(thesis, current_round, previous_rounds)
        output = await self.llm.generate_structured(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            output_schema=ChallengerOutput,
        )
        return output.arguments
