const { openBrowser, setConfig, screenshot, closeBrowser } = require('../lib/playdrums');
const headless = false;

beforeScenario(async () => {
  await openBrowser({
    headless: headless,
    url: 'https://github.com/sarut0bi/playDrums/',
    //setDebugEvents: true,
  });
  setConfig({ navigationTimeout: 60000 });
});

gauge.screenshotFn = async function() {
  return await screenshot({ encoding: 'base64' });
};

afterScenario(async () => await closeBrowser());
