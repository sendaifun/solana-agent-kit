export const CREWPAY_API_URL = "https://api.crewpay.dev";

export type CrewpaySolanaPlatform = "pumpfun" | "bags";

export interface CrewpayCrewMember {
  handle: string;
  wallet: string;
  share: number;
  hireRole?: "caller" | "chart" | "raid" | "kol" | "dev";
}

export interface CrewpayLaunchOptions {
  name: string;
  ticker: string;
  description?: string;
  imageUrl: string;
  platform?: CrewpaySolanaPlatform;
  /** Explicit crew (shares must total 100). Omit to let CrewPay Autohire pick. */
  crew?: CrewpayCrewMember[];
  /** Autohire seat count when no explicit crew is given (default 5). */
  autoHireSeats?: number;
  initialBuySol?: number;
  twitter?: string;
  website?: string;
}

export interface CrewpayUnsignedStep {
  kind: string;
  messageBase64: string;
  transactionBase64?: string;
  requiredSigners: string[];
  encoding?: string;
}

export interface CrewpayUnsignedPlan {
  ok: boolean;
  mint: string;
  steps: CrewpayUnsignedStep[];
  pumpUrl?: string;
  coinUrl?: string;
  warnings?: string[];
  error?: string;
}
