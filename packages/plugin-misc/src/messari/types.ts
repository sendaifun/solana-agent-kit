export interface MessariMessage {
    content: string;
    role: string;
}

export interface MessariAPIResponse {
    data: {
        messages: MessariMessage[];
    };
}