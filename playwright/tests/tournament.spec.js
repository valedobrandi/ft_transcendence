import { test } from '@playwright/test';

test.describe.parallel('Simulate 8 players joining tournament', () => {
  for (let i = 0; i < 8; i++) {
    test(`Player ${i + 1} joins`, async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(`http://pong-frontend:5173/intra`);
      await page.click('id=tournament-btn');
      await page.waitForSelector('text=PLAY', { timeout: 5000 });
      await page.click('id=match-btn');
      // Wait for console.log { status: 200, message: "TOURNAMENT_ROOM" }
      await Promise.race([
        new Promise(resolve => {
          page.on('console', msg => {
            if (msg.text().includes('GAME_OVER')) resolve();
          });
        }),
        new Promise(resolve => setTimeout(resolve, 60000)) // fallback after 15s
      ]);
      
      
    });
  }
});


