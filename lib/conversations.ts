interface Conversation {
    page: any;
    conversation: number;
    ready: boolean;
    lastActivity: number;
    timeout: NodeJS.Timeout;
}

interface Conversations {
    [key: string]: Conversation;
}

const conversations: Conversations = {};

export function getConversation(chatId: string): Conversation | null {
    return conversations[chatId] || null;
}

export function createConversation(chatId: string, conversation: Conversation): void {
    conversations[chatId] = conversation;
}

export function deleteConversation(chatId: string): void {
    delete conversations[chatId];
}

export function updateConversation(chatId: string, updatedFields: Partial<Conversation>): void {
    if (conversations[chatId]) {
        conversations[chatId] = { ...conversations[chatId], ...updatedFields };
    }
}
