export type MessageContent = string | {
  type: 'image';
  url: string;
  alt?: string;
} | {
  type: 'code';
  language: string;
  code: string;
} | {
  type: 'file';
  name: string;
  size: string;
  url: string;
};

export interface Message {
  id: string;
  content: MessageContent;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}