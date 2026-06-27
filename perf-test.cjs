const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Register early PerformanceObserver and render stats
  await context.addInitScript(() => {
    window.__renderCounts = {
      BasicCommands: 0,
      SunoCommands: 0,
      PresetsTab: 0,
      CommandButton: 0
    };
    window.__longTasks = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
          name: entry.name
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  });

  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:4999 ...');
  await page.goto('http://localhost:4999');
  
  // Wait for the textarea
  console.log('Waiting for textarea...');
  const textarea = await page.waitForSelector('textarea');
  
  // Wait 1.5 seconds to ensure everything has loaded and settled
  await page.waitForTimeout(1500);
  
  // Reset render counts and long tasks to exclude page load noise
  await page.evaluate(() => {
    window.__renderCounts = {
      BasicCommands: 0,
      SunoCommands: 0,
      PresetsTab: 0,
      CommandButton: 0
    };
    window.__longTasks = [];
  });
  
  console.log('\n--- Phase 1: Typing 1050 characters ---');
  const longText = 'a'.repeat(1050);
  
  const startTimeTyping = Date.now();
  await textarea.focus();
  // Pressing character-by-character
  await page.keyboard.type(longText);
  const durationTyping = Date.now() - startTimeTyping;
  console.log(`Finished typing in ${durationTyping}ms`);

  const afterTypingRenders = await page.evaluate(() => ({ ...window.__renderCounts }));
  const afterTypingLongTasks = await page.evaluate(() => {
    const tasks = [...window.__longTasks];
    window.__longTasks = []; // reset for next phase
    return tasks;
  });
  
  console.log('Renders during typing:', afterTypingRenders);
  console.log('Long Tasks during typing:', afterTypingLongTasks);

  console.log('\n--- Phase 2: Switching Tabs ---');
  const clickTab = async (label) => {
    console.log(`Clicking tab: ${label}`);
    await page.click(`button:has-text("${label}")`);
    await page.waitForTimeout(300); // short wait for rendering
  };
  
  await clickTab('Suno');
  await clickTab('Пресеты');
  await clickTab('Избранное');
  await clickTab('Команды');
  
  const afterTabsRenders = await page.evaluate(() => ({ ...window.__renderCounts }));
  const afterTabsLongTasks = await page.evaluate(() => {
    const tasks = [...window.__longTasks];
    window.__longTasks = []; // reset
    return tasks;
  });
  console.log('Cumulative Renders after tab switching:', afterTabsRenders);
  console.log('Long Tasks during tab switching:', afterTabsLongTasks);

  console.log('\n--- Phase 3: Applying Commands ---');
  console.log('Clicking "ВЕРХНИЙ" command button...');
  await page.click('button:has-text("ВЕРХНИЙ")');
  await page.waitForTimeout(600);
  
  const textValue = await page.inputValue('textarea');
  console.log('Text value after UPPERCASE command:', textValue.substring(0, 10) + '... (length: ' + textValue.length + ')');
  
  const afterCommandRenders = await page.evaluate(() => ({ ...window.__renderCounts }));
  const afterCommandLongTasks = await page.evaluate(() => {
    const tasks = [...window.__longTasks];
    window.__longTasks = []; // reset
    return tasks;
  });
  console.log('Cumulative Renders after command:', afterCommandRenders);
  console.log('Long Tasks during command execution:', afterCommandLongTasks);

  console.log('\n--- Phase 4: Undo/Redo ---');
  console.log('Focusing textarea and pressing Ctrl+Z (Undo)...');
  await textarea.focus();
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(600);
  const textValueAfterUndo = await page.inputValue('textarea');
  console.log('Text value after Undo:', textValueAfterUndo.substring(0, 10) + '... (length: ' + textValueAfterUndo.length + ')');
  
  console.log('Focusing textarea and pressing Ctrl+Y (Redo)...');
  await textarea.focus();
  await page.keyboard.press('Control+y');
  await page.waitForTimeout(600);
  const textValueAfterRedo = await page.inputValue('textarea');
  console.log('Text value after Redo:', textValueAfterRedo.substring(0, 10) + '... (length: ' + textValueAfterRedo.length + ')');
  
  const finalRenders = await page.evaluate(() => ({ ...window.__renderCounts }));
  const finalLongTasks = await page.evaluate(() => [...window.__longTasks]);
  console.log('Final Cumulative Renders:', finalRenders);
  console.log('Long Tasks during Undo/Redo:', finalLongTasks);

  await browser.close();
}

run().catch(console.error);
