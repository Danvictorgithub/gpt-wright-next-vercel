import { Page } from 'playwright';
import { getConversation, updateConversation } from './conversations';

export async function stayLoggedOut(page: Page): Promise<void> {
    const button = await page.locator('text=Stay logged out');
    if (await button.isVisible()) {
        await button.click();
    }
}

export async function lazyLoadingFix(page: Page, conversation: number): Promise<string> {
    let text = await page.locator(`[data-testid="conversation-turn-${conversation}"]`).innerText();
    const textCheck = text.split(' ');
    if (textCheck[0] === 'ChatGPT\nChatGPT' && textCheck.length <= 1) {
        return lazyLoadingFix(page, conversation);
    }
    return text;
}

export function generateUniqueChatId(): string {
    return 'chat_' + Math.random().toString(36).substr(2, 9);
}

export async function scrapeAndAutomateChat(chatId: string, prompt: string): Promise<string> {
    console.log(`Processing prompt for chat ${chatId}: \n`, prompt);
    const chatSession = getConversation(chatId);
    if (!chatSession) {
        throw new Error(`Chat session ${chatId} not found`);
    }
    const { page, conversation } = chatSession;
    await stayLoggedOut(page);

    if (process.env.DEBUG === 'true') {
        await page.screenshot({ path: `screenshots/1before-writing-${chatId}.png` });
        console.log(`screenshots/1before-writing-${chatId}.png`);
    }

    await page.type('#prompt-textarea', prompt, { timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });

    if (process.env.DEBUG === 'true') {
        await page.screenshot({ path: `screenshots/2writing-before-clicking-${chatId}.png` });
        console.log(`screenshots/2writing-before-clicking-${chatId}.png`);
    }

    await page.waitForSelector('.result-streaming', { state: 'hidden', timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });
    await page.waitForSelector('[data-testid="send-button"]:not([disabled])', { timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });
    await page.click('[data-testid="send-button"]', { timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });

    if (process.env.DEBUG === 'true') {
        await page.screenshot({ path: `screenshots/3after-clicking-${chatId}.png` });
        console.log(`screenshots/3after-clicking-${chatId}.png`);
    }

    await page.waitForSelector('[aria-label="Stop generating"]', { timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });
    await page.waitForSelector('[data-testid="send-button"]', { timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });
    await page.waitForSelector('button > div > svg', { state: 'hidden', timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });
    await page.waitForSelector('.result-streaming', { state: 'hidden', timeout: process.env.WAIT_TIMEOUT ? parseInt(process.env.WAIT_TIMEOUT) : 300000 });

    chatSession.conversation += 2;
    let text = await page.locator(`[data-testid="conversation-turn-${chatSession.conversation}"]`).innerText();
    const textCheck = text.split(' ');
    if (textCheck[0] === 'ChatGPT\nChatGPT' && textCheck.length <= 1) {
        text = await lazyLoadingFix(page, chatSession.conversation);
    }
    const parsedText = text.replace('ChatGPT\nChatGPT', '').trim();

    console.log(`Prompt response for chat ${chatId}: \n`, parsedText);
    await stayLoggedOut(page);

    return parsedText;
}
