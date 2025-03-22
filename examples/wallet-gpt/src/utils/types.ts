export interface Message {
  id?: number;
  content: string;
  role: "user" | "system";
}
