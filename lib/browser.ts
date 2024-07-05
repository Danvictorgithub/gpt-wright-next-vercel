import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

let browser: any = null;

export async function getBrowser(): Promise<any> {
    if (!browser) {
        console.log("Launching Chromium");
        browser = await chromium.launch();
    }
    return browser;
}
