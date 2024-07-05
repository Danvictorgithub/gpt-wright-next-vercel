import { NextApiRequest, NextApiResponse } from 'next';
import { getConversation, updateConversation } from '../../lib/conversations';
import { scrapeAndAutomateChat } from '../../lib/helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { chatId, prompt } = req.body;
    if (!chatId || !prompt) {
        return res.status(400).json({ message: 'Chat ID and prompt are required' });
    }

    const chatSession = getConversation(chatId);
    if (!chatSession) {
        return res.status(404).json({ message: 'Chat session not found' });
    }

    chatSession.lastActivity = Date.now();
    clearTimeout(chatSession.timeout);
    chatSession.timeout = setTimeout(() => {
        // Implement closeChatSession logic here
    }, 300000); // 5 minutes

    try {
        const response = await scrapeAndAutomateChat(chatId, prompt);
        res.send(response);
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
