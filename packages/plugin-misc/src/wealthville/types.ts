export interface WealthvilleScoreRow {
  pool_address: string;
  pool_name: string;
  protocol: string;
  chain: string;
  verdict:
    | "ENTER"
    | "INCREASE"
    | "HOLD"
    | "REDUCE"
    | "EXIT"
    | "AVOID"
    | "INSUFFICIENT_DATA";
  confidence: string;
  enter_score: number | null;
  hold_score: number | null;
  exit_score: number | null;
  wealthville_score: number | null;
  computed_at: string;
  reasons: string[];
  data_tier?: number | null;
}

export interface WealthvilleTopPoolsResponse {
  as_of: string;
  methodology: string;
  scores: WealthvilleScoreRow[];
}

export interface WealthvilleTrackRecordResponse {
  as_of: string;
  window_days: number;
  methodology: string;
  label_semantics: Record<string, string>;
  by_action: Array<{
    final_action: string;
    signals: number;
    resolved: number;
    hit_rate: string | null;
    avg_pnl_7d: string | null;
    avg_il_7d: string | null;
  }>;
  weekly_enter_hit_rate: Array<{
    week: string;
    signals: number;
    hit_rate: string;
  }>;
  recent_resolved: Array<Record<string, unknown>>;
}
