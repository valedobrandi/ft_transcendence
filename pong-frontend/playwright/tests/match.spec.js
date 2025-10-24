import { test, expect } from '@playwright/test';

test.describe.parallel('Simulate 2 players in a match', () => {
	for (let i = 0; i < 2; i++) {
		test(`Player ${i + 1} joins`, async ({ browser }) => {
			const context = await browser.newContext();
			const page = await context.newPage();

			await page.goto(`http://localhost:5173/intra`);
			console.log(await page.content());
			/* await page.waitForSelector('#match-btn', { timeout: 5000 });
			await page.click('id=match-btn');
			await page.waitForNavigation({
				waitUntil: 'load',
				timeout: 2000
			});
			await page.waitForSelector('#quit-btn', { timeout: 30000 });
			await page.click('id=quit-btn'); */


		});
	}
});
