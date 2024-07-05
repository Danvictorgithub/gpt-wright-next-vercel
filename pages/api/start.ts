import { NextApiRequest, NextApiResponse } from 'next';
import { getBrowser } from '../../lib/browser';
import { createConversation } from '../../lib/conversations';
import { generateUniqueChatId, stayLoggedOut } from '../../lib/helpers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const chatId = generateUniqueChatId();
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.goto('https://www.chatgpt.com');
        await stayLoggedOut(page);

        createConversation(chatId, {
            page,
            conversation: 1,
            ready: true,
            lastActivity: Date.now(),
            timeout: setTimeout(() => {
                // Implement closeChatSession logic here
            }, 300000) // 5 minutes
        });

        res.json({ chatId });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
