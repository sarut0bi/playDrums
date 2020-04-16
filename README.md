# playDrums

## What is playdrums?

Playdrums is a *WIP* free and open source Node.js library with a clear and concise API mainly inspired by [Taiko](https://taiko.dev/) written by the team behind Gauge from ThoughtWorks.

It interracts with [Playwright](https://github.com/microsoft/playwright/), the new multiBrowser framework by the former puppeteer team now at Microsoft.

It tries to combine best of both world:
* High readability of tests
* Automate the Chromium, WebKit and Firefox browsers with a single API. (with headless support for all)
* Enable cross-browser web automation that is ever-green, capable, reliable and fast.
* Headless is supported for all the browsers on all platforms.
* Allows mobile emulation with webkit based browser (to simulate iDevices)

## Usage
See [API](https://github.com/sarut0bi/playDrums/blob/master/api.md)

## Installation
`npm install playdrums`

## Main Features

### XHR request interception

XHR Requests can be:

* Blocked
* Redirected
* Modified before sending
* Stubbed

See [Details](https://github.com/sarut0bi/playDrums/blob/master/api.md#intercept)

### Smart navigation handling

Every action that could invoke a navigation:

* [goto](https://github.com/sarut0bi/playDrums/blob/master/api.md#goto)
* [reload](https://github.com/sarut0bi/playDrums/blob/master/api.md#reload)
* [goBack](https://github.com/sarut0bi/playDrums/blob/master/api.md#goBack)
* [goforward](https://github.com/sarut0bi/playDrums/blob/master/api.md#goforward)
* [click](https://github.com/sarut0bi/playDrums/blob/master/api.md#click)
* [write](https://github.com/sarut0bi/playDrums/blob/master/api.md#write)
* [clear](https://github.com/sarut0bi/playDrums/blob/master/api.md#clear)
* [press](https://github.com/sarut0bi/playDrums/blob/master/api.md#press)
* [evaluate](https://github.com/sarut0bi/playDrums/blob/master/api.md#evaluate)

can easily wait for:

* Specific event raised
* Request to be sent
* Response of request to be received

before executing next Step

## What is the difference between taiko and playdrums

:white_check_mark: Context and page are now clearly indentified.

:white_check_mark: Intercept are now clearly set to a context which can of course handle several pages(tabs in taiko) and better for parallelized tests.

:white_check_mark: Switch tab between concept is allowed.

:white_check_mark: All interracation are made through xpath,csspath or text using `$` function (See [details](https://github.com/sarut0bi/playDrums/blob/master/api.md))

:white_check_mark: All playwright options have been kept.

:x: Proximity Selectors and element selectors have been removed.

:x: cli have also been removed.

:x: still some work in progress... :hourglass:


## Integration with Jest

```javascript
const { openBrowser,write, closeBrowser, goto, press, screenshot,  focus, $, waitFor } = require('playdrums');

describe('Getting Started with Jest and Taiko', () => {

    beforeAll(async () => {
        await openBrowser({ headless: false, url:'about:blank' });
    });

    describe('Search Taiko Repository', () => {

        test('Goto getgauge github page', async () => {
            await goto('https://github.com');
        });

        test('Search for playdrums', async () => {
			await focus($('[name=q]'))
			await write('playdrums');
			await press('Enter');
        });

        test('Page contains playdrums', async () => {
            await waitFor(10000,$('//*[@href="/sarut0bi/playDrums"]'))
        });

    });

    afterAll(async () => {
        await closeBrowser();
    });

});
```

## Integration with Mocha

```javascript
"use strict";
const {openBrowser,write, closeBrowser, goto, press, screenshot,  focus, $, waitFor} = require('playdrums');
const assert = require("assert");
const headless = false;

describe('Getting Started with Mocha and Taiko', () => {

    before(async () => {
        await openBrowser({ headless: headless });
    });

    describe('Search Taiko Repository', () => {

        it('Goto github page', async () => {
            await goto('https://github.com');
        });

        it('Search for playdrums', async () => {
			await focus($('[name=q]'))
			await write('playdrums');
			await press('Enter');
        });

        it('Page contains "getgauge/taiko"', async () => {
            await waitFor(10000,$('//*[@href="/sarut0bi/playDrums"]'));
        });

    });

    after(async () => {
        await closeBrowser();
    });

});

```

## Integration with Gauge

```javascript
/* globals gauge*/
"use strict";
const { openBrowser,write, closeBrowser, goto, press, screenshot,  focus, $, waitFor } = require('playdrums');
const assert = require("assert");

beforeSuite(async () => {
    await openBrowser({ headless: false })
});

afterSuite(async () => {
    await closeBrowser();
});

gauge.screenshotFn = async function() {
    return await screenshot({ encoding: 'base64' });
};

step("Goto github page", async () => {
    await goto('https://github.com');
});

step("Search for playdrums", async () => {
    await focus($('[name=q]'))
    await write('playdrums');
    await press('Enter');
});

step("Page contains playdrums", async () => {
    assert.ok(await waitFor(10000,$('//*[@href="/sarut0bi/playDrums"]')));
});
```