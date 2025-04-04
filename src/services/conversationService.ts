export interface Conversation {
    userMessage: string;
    aiResponse: string;
    timestamp: Date;
}

export const conversationService = {
    // Save a new conversation entry
    async saveConversation(userMessage: string, aiResponse: string): Promise<void> {
        try {
            const newConversation = {
                userMessage,
                aiResponse,
                timestamp: new Date(),
                id: Date.now().toString()
            };
            
            // Get existing conversations from localStorage
            const existingConversationsStr = localStorage.getItem('conversations') || '[]';
            const existingConversations = JSON.parse(existingConversationsStr);
            
            // Add new conversation and save back to localStorage
            existingConversations.push(newConversation);
            localStorage.setItem('conversations', JSON.stringify(existingConversations));
        } catch (error) {
            console.error('Error saving conversation:', error);
            throw error;
        }
    },

    // Get conversation history
    async getConversationHistory(): Promise<Conversation[]> {
        try {
            const conversationsStr = localStorage.getItem('conversations') || '[]';
            const conversations = JSON.parse(conversationsStr);
            
            return conversations.map((conv: any) => ({
                userMessage: conv.userMessage,
                aiResponse: conv.aiResponse,
                timestamp: new Date(conv.timestamp),
            }));
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            throw error;
        }
    },
}; 