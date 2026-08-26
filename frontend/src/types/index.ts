export interface User {
  id: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
}

export type DebateStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AgentRole = 'challenger' | 'defender' | 'judge' | null;
export type Winner = 'challenger' | 'defender' | 'tie' | null;

export interface DebateResponse {
  id: string;
  thesis: string;
  rounds_count: number;
  status: DebateStatus;
  current_round: number;
  current_agent: AgentRole;
  created_at: string;
}

export interface DebateListItem extends DebateResponse {
  final_winner: Winner;
  final_challenger_score: number | null;
  final_defender_score: number | null;
}

export interface DebateListResponse {
  items: DebateListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ChallengerArgument {
  title: string;
  argument: string;
}

export interface DefenderRebuttal {
  argument_title: string;
  response: string;
}

export interface RoundResponse {
  id: string;
  round_number: number;
  challenger_arguments: ChallengerArgument[] | null;
  defender_rebuttals: DefenderRebuttal[] | null;
  challenger_score: number | null;
  defender_score: number | null;
  winner: Winner;
  judge_reason: string | null;
  strongest_argument: string | null;
  weakest_rebuttal: string | null;
  created_at: string;
}

export interface DebateDetailResponse extends DebateResponse {
  final_winner: Winner;
  final_challenger_score: number | null;
  final_defender_score: number | null;
  final_verdict: string | null;
  completed_at: string | null;
  rounds: RoundResponse[];
}

export interface DebateStatusResponse {
  id: string;
  status: DebateStatus;
  current_round: number;
  total_rounds: number;
  current_agent: AgentRole;
}

export interface DebateCreateRequest {
  thesis: string;
  rounds: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
