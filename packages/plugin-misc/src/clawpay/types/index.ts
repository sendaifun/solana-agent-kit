export interface ClawPayEscrowResponse {
  status: string;
  escrowAddress: string;
  signature: string;
}

export interface ClawPayEscrowStatus {
  status: string;
  escrowAddress: string;
  buyer: string;
  seller: string;
  amount: number;
  state: string;
  deadline: number;
}
