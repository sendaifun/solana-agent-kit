export interface BountyRadarOpportunity {
  source: string;
  id: string;
  title: string;
  reward: string | null;
  deadline: string;
  url: string;
  agent_access: "AGENT_ALLOWED";
  observed_at: string;
  provenance: string;
  skills?: unknown[];
  eligibility?: unknown[];
  region?: string | null;
  requirements?: string | null;
  description_text?: string;
}
