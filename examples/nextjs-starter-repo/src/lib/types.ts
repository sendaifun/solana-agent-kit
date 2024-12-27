export interface ChatResponse {
  message: string;
  solanaAction?: {
    type: string;
    data: any;
  };
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string;
}
