let browser,
  context,
  page = false;

const { chromium, firefox, webkit } = require('playwright');
const uuid = require('uuid');

const defaultConfig = {
  browser: chromium,
  device: { 'viewport': null },
  userOptions: {
    navigationTimeout: 30000,
    timeout: 10000,
    observeTime: 3000,
    observe: false,
    headless: false,
    implicitWait: true,
    url: 'about:blank',
  },
}

let userOptions = { ...defaultConfig.userOptions };
let browserHistory = [];

const validate = () => {
  if (!(browser && context && page))
    throw new Error('Browser or page not initialized. Call `openBrowser()` before using this API');
}

const _setDebugEvents = () => {
  eventsPage = ['popup', 'page', 'close', 'console', 'dialog', 'domcontentloaded', 'download', 'filechooser', 'frameattached', 'framedetached', 'framenavigated', 'load', 'pageerror', 'popup', 'request', 'requestfailed', 'requestfinished', 'response', 'worker'];
  eventsPage.forEach((event) => page.on(event, () => console.log('page event ' + event + ' raised')));
  eventsContext = ['close', 'page']
  eventsPage.forEach((event) => context.on(event, () => console.log('context event ' + event + ' raised')));
}

/**
 * Launches a browser with a tab. The browser will be closed when the parent node.js process is closed.<br>
 * Note : `openBrowser` launches the browser in headful mode by default.
 * @example
 * await openBrowser({headless: false})
 * await openBrowser()
 * await openBrowser({browserType:'webkit'})
 *
 * @param {boolean} [options.ignoreCertificateErrors=false] - Option to ignore certificate errors.
 * @param {boolean} [options.observe=false] - Option to run each command after a delay. Useful to observe what is happening in the browser.
 * @param {number} [options.observeTime=3000] - Option to modify delay time for observe mode. Accepts value in milliseconds.
 * @param {boolean} [options.setDebugEvents=false] - Turn on debug event in console
 * @param {Object} options extra options. See [Extra Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions) for a list of available options
 * @param {string} [options.browserType='chromium'] - Option to choose browser.
 * @param {Object} options.contextName - Name context as specified
 * @param {Object} options.device - Emulate given device. 
 * @param {Object} options.extraHTTPHeaders - Map with extra HTTP headers.
 * @param {boolean} [options.headless=false] - Option to open browser in headless/headful mode.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=10000] - Default timeout for all action.
 * @param {string} options.url - URL to navigate page to.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 * 
 * @returns {Promise}
 */
module.exports.openBrowser = async (options = {}) => {
  options = { ...userOptions, ...options };

  const browsers = {
    chromium: chromium,
    firefox: firefox,
    webkit: webkit
  }

  if (browser)
    throw new Error(`Browser already opened`);

  browser = (options.browserType && typeof options.browserType == 'string' && (options.browserType == 'chromium' || options.browserType == 'firefox' || options.browserType == 'webkit')) ? browsers[options.browserType] : defaultConfig.browser;

  if (!browser)
    throw new Error(`Unknown browser, Please set one of the given browser\nchromium\nfirefox\nwebkit`);

  if (options.observe)
    options.slowMo = options.observeTime;

  let headless = options.headless;
  if (options.headless && typeof options.headless == 'string')
    headless = options.headless.toLowerCase() === 'true'

  browser = await browser.launch({ headless: headless, args: options.extraArgs });
  if (options.url)
    await this.openContext(options);
};

/**
 * Opens the specified URL in the browser's window. Adds `http` protocol to the URL if not present.
 * @example
 * await openContext('https://google.com', { name: 'windowName' }) - Opens a Incognito window
 * @param {Object} options extra options. See [Extra Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions) for a list of available options
 * @param {Object} options.contextName - Name context as specified
 * @param {Object} options.device - Emulate given device
 * @param {Object} options.extraHTTPHeaders - Map with extra HTTP headers.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=10000] - Default timeout for all action.
 * @param {string} options.url - URL to navigate page to.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 *
 * @returns {Promise}
 */

module.exports.openContext = async (options = {}) => {
  options = { ...userOptions, ...options };
  if (!browser)
    throw new Error(`Browser not opened`);
  let deviceContext = options.device || defaultConfig.device;
  context = await browser.newContext({ ...options, ...deviceContext });
  context.name = options.contextName || 'defaultContext-' + Date.now();
  context.on('page', async page => _onNewPage(page));
  if (options.url)
    await this.openPage(options);
};

const _onNewPage = async (newPage) => {
  page = newPage;
  context = newPage.context();
  page.uuid = uuid.v4().toString();
  browserHistory.push({ event: 'newPage', context: context, page: page });
}

/**
 * Launches a new ¨Page. If url is provided, the new tab is opened with the url loaded.
 * @example
 * await openPage('https://duckduckgo.com/')
 * await openPage() # opens a blank tab.
 *
 * @param {Object} options extra options. See [Extra Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewpageoptions) for a list of available options
 * @param {Object} [options.extraHTTPHeaders] - Map with extra HTTP headers.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=10000] - Default timeout for all action.
 * @param {string} options.url - URL to navigate page to.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 *
 * @returns {Promise}
 */

module.exports.openPage = async (options = {}) => {
  options = { ...userOptions, ...options };

  if (!(browser && context))
    throw new Error('Context not initialized. Call `openContext()` before using this API');
  page = await context.newPage(options);
  if (options.setDebugEvents)
    _setDebugEvents();

  if (options.url)
    await this.goto((new URL(options.url)).toString(), options);
};

/**
 * Opens the specified URL in the browser's tab. Adds `http` protocol to the URL if not present.
 * @example
 * await goto('https://duckduckgo.com')
 * await goto({ navigationTimeout:10000, headers:{'Authorization':'Basic cG9zdG1hbjpwYXNzd29y2A=='}})
 *
 * @param {string} url - URL to navigate page to.
 * @param {Object} options
 * @param {Object} options.extraHTTPHeaders - Map with extra HTTP headers.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=10000] - Default timeout for all action.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 * 
 * @returns {Promise}
 */
module.exports.goto = async (url, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  if (options.extraHTTPHeaders)
    await page.setExtraHTTPHeaders(headers);

  let optionsWithoutUrl = options;
  delete optionsWithoutUrl.url;
  await _navigationFunction(page.goto(url, optionsWithoutUrl), optionsWithoutUrl);
};

/**
 * Allows switching between pages using URL or page title in current Context. Will switch to the first matching tab.
 *
 * @example
 * # switch using URL
 * await switchTo('https://duckduckgo.com/')
 * # switch using Title
 * await switchTo('DuckDuckGo — Privacy, simplified.')
 * # switch using regex URL
 * await switchTo(/http(s?):\/\/(www?).google.(com|co.in|co.uk)/)
 * # switch using regex Title
 * await switchTo(/Go*gle/)
 *
 * @param {string} arg - URL/Page title of the tab to switch.
 *
 * @returns {Promise}
 */
module.exports.switchPage = async arg => {
  validate();

  if (typeof arg != 'string' && !Object.prototype.toString.call(arg).includes('RegExp')) {
    throw new TypeError(
      'The "targetUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }
  page = false;

  let pages = await context.pages();
  await Promise.all(pages.map(async page => { page.currentTitle = await page.title(); return page; }));
  pages = Object.prototype.toString.call(arg).includes('RegExp') ?
    pages.filter(page => page.url().match(new RegExp(arg)) || page.currentTitle.match(new RegExp(arg))) :
    pages.filter(page => page.url() === arg || page.currentTitle === arg);

  if (pages.length > 0) {
    page = pages[0];
    browserHistory.push({ event: 'switch', context: context, page: page });
  }

  if (!page)
    throw new Error(`Cannot find title or URL matching ` + arg);
}

/**
 * Allows switching between tabs using URL or page title in all opened Window. Will switch to the first matching tab.
 *
 * @example
 * # switch using URL on default window
 * await switchContext('https://duckduckgo.com/','default')
 * # switch using Title on all opened window will return first match
 * await switchContext('Taiko')
 * # switch using regex URL on window named 'Thirdwindow' 
 * await switchContext(/http(s?):\/\/(www?).google.(com|co.in|co.uk)/,'ThirdContext')
 *
 * @param {string} arg - URL/Page title of the tab to switch.
 * @param {string} name - Window name containing tab. Optional parameter
 *
 * @returns {Promise}
 */
module.exports.switchContext = async (arg, name) => {
  validate();

  if (typeof arg != 'string' && !Object.prototype.toString.call(arg).includes('RegExp')) {
    throw new TypeError(
      'The "targetUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }
  page = false;

  let contexts = await browser.contexts();

  if (name) {
    contexts = contexts.filter((context) => context.name === name)
    if (contexts.length != 1)
      throw new Error('Found ' + contexts.length + ' matching ' + name);
  }

  for (let currentContext of contexts) {
    let pages = await currentContext.pages();
    await Promise.all(pages.map(async page => { page.currentTitle = await page.title(); return page; }));

    pages = Object.prototype.toString.call(arg).includes('RegExp') ?
      pages.filter(page => page.url().match(new RegExp(arg)) || page.currentTitle.match(new RegExp(arg))) :
      pages.filter(page => page.url() === arg || page.currentTitle === arg);

    if (pages.length > 0) {
      page = pages[0];
      context = await page.context();
      browserHistory.push({ event: 'switch', context: context, page: page });
      break;
    }
  }

  if (!page)
    throw new Error(`Cannot find title or URL matching ` + arg);

}

/**
 * Allows switch to previous position
 *
 * @example
 * # switch using URL on default window
 * await switchback()
 *
 *
 * @returns {Promise}
 */
module.exports.switchBack = async () => {
  validate();

  if (browserHistory.length < 2) {
    throw new Error('Not enough history to switch back');
  }

  let [contextAndPage] = browserHistory.slice(-2, -1);
  page = contextAndPage.page;
  context = contextAndPage.context;
  browserHistory.push({ event: 'switch', context: context, page: page });
}

/**
 * Closes the browser and along with all of its tabs.
 *
 * @example
 * await closeBrowser()
 *
 * @returns {Promise}
 */
module.exports.closeBrowser = async () => {
  if (browser) {
    await browser.close();
    browser = false;
  }
};

/**
 * Closes the specified browser context.
 * @example
 * await closeContext('windowName') - Closes a window with given arg or current if not provided
 */

module.exports.closeContext = async (name) => {
  validate();
  let contexts = await browser.contexts();
  const contextToClose = name || context.name;

  contexts = contexts.filter(context => context.name === contextToClose);
  if (contexts.length != 1)
    throw new Error('Found ' + contexts.length + ' matching ' + contextToClose);

  let closedContext = context;

  browserHistory = browserHistory.filter((acp) => acp.context.name !== contextToClose)
  let [contextAndPage] = browserHistory.slice(-1);
  context = contextAndPage.context;
  page = contextAndPage.page;

  await closedContext.close();
};

/**
 * Closes the given tab with given URL or closes current tab in current or given context.
 *
 * @example
 * # Closes the current tab.
 * await closePage()
 * # Closes all the tabs with Title 'Open Source Test Automation Framework | Gauge' in currentWindow
 * await closePage('Open Source Test Automation Framework | Gauge')
 * # Closes all the tabs with URL 'https://gauge.org'. in 'default' named context. 
 * await closePage('https://gauge.org','default')

 *
 * @param {string} [arg=undefined] - URL/Page title of the tab to close. Optionnal
 * @param {string} [contextName=undefined] - context to close page in. Optionnal
 *
 * @returns {Promise}
 */

module.exports.closePage = async (arg, contextName) => {
  validate();

  let targetContext;
  let currentPageClosed = false;

  if (!arg && !contextName) {
    await page.close();
    browserHistory.pop();
    currentPageClosed = true;
  }

  if (!contextName || contextName === context.name) {
    targetContext = context
  } else {
    let contexts = await browser.contexts();
    contexts = contexts.filter((context) => context.name === contextName)
    if (contexts.length != 1)
      throw new Error('Found ' + contexts.length + ' matching ' + name);
    [targetContext] = contexts;
  }

  if (typeof arg == 'string' || Object.prototype.toString.call(arg).includes('RegExp')) {

    let pages = await targetContext.pages();
    await Promise.all(pages.map(async page => { page.currentTitle = await page.title(); return page; }));

    pages = Object.prototype.toString.call(arg).includes('RegExp') ?
      pages.filter(page => page.url().match(new RegExp(arg)) || page.currentTitle.match(new RegExp(arg))) :
      pages.filter(page => page.url() === arg || page.currentTitle === arg);

    if (pages.length == 0)
      throw new Error(`Unable to find tab matching ` + arg)

    pages.forEach(async targetPage => {
      browserHistory = browserHistory.filter(acp => acp.context.name !== targetPage.context && acp.page.uuid !== targetPage.uuid);
      if (targetPage == page)
        currentPageClosed = true;
      await targetPage.close();
    });
  }

  if (currentPageClosed) {
    let [contextAndPage] = browserHistory.slice(-1)
    context = contextAndPage.context;
    page = contextAndPage.page;
  }
}

/**
 * Add spy on a network call. Helps in asserting request or response content
 *
 * @example
 * # case 1: block URL :
 * await spy(url)
 *
 * @param {string} requestUrl request URL to intercept
 * @param {string} onEvent event to spy on
 * @param {function} option action to be done after interception. 
 *
 * @returns {Promise}
 */
module.exports.spy = async (requestUrl, onEvent, option) => {
  if (typeof requestUrl != 'string' && !Object.prototype.toString.call(requestUrl).includes('RegExp')) {
    throw new TypeError(
      'The "requestUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }

  if (!context.spies)
    context.spies = [];

  context.spies.push({ "requestUrl": requestUrl, "option": option });
  page.on(onEvent, (request) => {
    let [matchRequest] = context.spies.filter(r => request.url().match(r.requestUrl));
    if (matchRequest)
      matchRequest.option(...[request]);
  });

}

/**
 * Add interceptor for the network call. Helps in overriding request or to mock response of a network call in currentContext.
 *
 * @example
 * # case 1: block URL :
 * await intercept(url)
 * # case 2: mockResponse :
 * await intercept(url, {mockObject})
 * # case 3: override request :
 * await intercept(url, (request) => {request.continue({overrideObject})})
 * # case 4: redirect always :
 * await intercept(url, redirectUrl)
 * # case 5: mockResponse based on request :
 * await intercept(url, (request) => { request.respond({mockResponseObject}) })
 * # case 6: block URL twice:
 * await intercept(url, undefined, 2)
 * # case 7: mockResponse only 3 times :
 * await intercept(url, {mockObject}, 3)
 *
 * @param {string} requestUrl request URL to intercept
 * @param {function|Object} option action to be done after interception. 
 * @param {number} count number of times the request has to be intercepted . Optional parameter
 *
 * @returns {Promise}
 */
module.exports.intercept = async (requestUrl, option, count) => {
  if (!context.interceptedRequests)
    context.interceptedRequests = [];

  if (typeof requestUrl != 'string' && !Object.prototype.toString.call(requestUrl).includes('RegExp')) {
    throw new TypeError(
      'The "requestUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }

  if (!count)
    count = -1;

  context.interceptedRequests.push({
    requestUrl: requestUrl,
    option: option,
    count: count,
  });

  await context.route(new RegExp(requestUrl), (request) => {
    let matchRequest;

    request.respond = request.fulfill;

    // typeof requestUrl == 'string' ?
    //   [matchRequest] = context.interceptedRequests.filter(r => request._request.url() === r.requestUrl) :
    [matchRequest] = context.interceptedRequests.filter(r => request.request().url().match(r.requestUrl));

    if (matchRequest) {

      if (!matchRequest.option)
        request.abort();
      if (typeof matchRequest.option == 'object') {

        if (typeof matchRequest.option.body == 'object') {
          matchRequest.option.contentType = 'application/json';
          matchRequest.option.body = JSON.stringify(matchRequest.option.body);
        }
        request.fulfill(matchRequest.option);
      }
      if (typeof matchRequest.option == 'string') {
        request.fulfill({
          status: request.method() === 'GET' ? 301 : 308,
          headers: { Location: matchRequest.option }
        });
      }
      if (typeof matchRequest.option == 'function') {
        matchRequest.option.call(this, request);
      }
      matchRequest.count--;
    } else {
      request.continue();
    }
    context.interceptedRequests = context.interceptedRequests.filter(r => r.count != 0);
  });
}

/**
 * Removes interceptor for the provided URL or all interceptors if no URL is specified
 *
 * @example
 * # case 1: Remove intercept for a single  URL :
 * await clearIntercept(requestUrl)
 * # case 2: Reset intercept for all URL :
 * await clearIntercept()
 *
 * @param {Object} options
 * @param {string} options.requestUrl request URL to intercept. Optional parameters
 * @param {string} options.windowName request URL to intercept. Optional parameters
 */

module.exports.clearIntercept = async (requestUrl) => {
  validate();
  context.interceptedRequests = requestUrl ? context.interceptedRequests.filter(r => r.requestUrl !== requestUrl) : [];
};

/**
 * Overrides the values of device screen dimensions
 *
 * @example
 * await setViewPort({width:600, height:800})
 *
 * @param {Object} options - See [chrome devtools setDeviceMetricsOverride](https://chromedevtools.github.io/devtools-protocol/tot/Emulation#method-setDeviceMetricsOverride) for a list of options
 *
 * @returns {Promise}
 */

module.exports.setViewPort = async options => {
  validate();
  await page.setViewportSize(options);
};

/**
 * Get the values of device screen dimensions according to a predefined list of devices. To provide custom device dimensions, use setViewPort API.
 *
 * @example
 * await openBrowser({device:getDevice('iPhone 6')});
 * await openContext({device:getDevice('iPhone 6')});
 *
 * @param {string} deviceModel - See [device model](https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts) for a list of all device models.
 *
 * @returns {object}
 */
module.exports.getDevice = deviceModel => {
  const devices = require('playwright');
  let matchDevice = devices.devices[deviceModel];

  if (matchDevice == undefined)
    throw new Error(`Please set one of the given device models \n${Object.keys(devices.devices).join('\n')}`);

  return matchDevice;
};

/**
 * Override specific permissions to the given origin
 *
 * @example
 * await overridePermissions('http://maps.google.com',['geolocation']);
 *
 * @param {string} origin - url origin to override permissions
 * @param {Array<string>} permissions - See [Permission types](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsercontextgrantpermissionspermissions-options) for a list of permission types.
 *
 * @returns {Promise}
 */
module.exports.overridePermissions = async (origin, permissions) => {
  validate();
  await context.grantPermissions(permissions, origin);
};

/**
 * Clears all permission overrides for all origins.
 *
 * @example
 * await clearPermissionOverrides()
 *
 * @returns {Promise}
 */
module.exports.clearPermissionOverrides = async () => {
  validate();
  await context.clearPermissions();
};

/**
 * Sets a cookie with the given cookie data. It may overwrite equivalent cookie if it already exists.
 *
 * @example
 * await setCookie("CSRFToken","csrfToken", {url: "http://the-internet.herokuapp.com"})
 * await setCookie("CSRFToken","csrfToken", {domain: "herokuapp.com"})
 *
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {Object} options
 * @param {string} [options.url=undefined] - sets cookie with the URL.
 * @param {string} [options.domain=undefined] - sets cookie with the exact domain.
 * @param {string} [options.path=undefined] - sets cookie with the exact path.
 * @param {boolean} [options.secure=undefined] - True if cookie to be set is secure.
 * @param {boolean} [options.httpOnly=undefined] - True if cookie to be set is http-only.
 * @param {string} [options.sameSite=undefined] - Represents the cookie's 'SameSite' status: Refer https://tools.ietf.org/html/draft-west-first-party-cookies.
 * @param {number} [options.expires=undefined] - UTC time in seconds, counted from January 1, 1970. eg: 2019-02-16T16:55:45.529Z
 *
 * @returns {Promise}
 */

module.exports.setCookie = async (name, value, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  if (!options.url && !options.domain) {
    throw new Error('At least URL or domain needs to be specified for setting cookies');
  }
  options.name = name;
  options.value = value;
  await context.addCookies([options]);
};

/**
 * Deletes browser cookies with matching name and URL or domain/path pair. If cookie name is not given or empty, all browser cookies are deleted.
 *
 * @example
 * await deleteCookies() # clears all browser cookies
 * await deleteCookies("CSRFToken", {url: "http://the-internet.herokuapp.com"})
 * await deleteCookies("CSRFToken", {domain: "herokuapp.com"})
 *
 * @param {string} [cookieName=undefined] - Cookie name.
 * @param {Object} options
 * @param {string} [options.url=undefined] - deletes all the cookies with the given name where domain and path match provided URL. eg: https://google.com
 * @param {string} [options.domain=undefined] - deletes only cookies with the exact domain. eg: google.com
 * @param {string} [options.path=undefined] - deletes only cookies with the exact path. eg: Google/Chrome/Default/Cookies/..
 *
 * @returns {Promise}
 */

module.exports.deleteCookies = async (name) => {
  validate();
  if (name) {
    if (typeof name == 'string')
      name = { name: name };
    let cookies = await context.cookies();
    let filteredCookies = cookies.filter(cookie => JSON.stringify(cookie) !== JSON.stringify({ ...cookie, ...name }));
    if (cookies.length == filteredCookies.length)
      throw new Error('Found no cookie(s) matching name ' + name);
    await context.clearCookies();
    await context.addCookies(filteredCookies);
  } else {
    await context.clearCookies();
  }
};

/**
 * Get browser cookies
 *
 * @example
 * await getCookies()
 *
 * @param {Object} options
 * @param {string[]} [options.url=undefined] - get all the cookies with the given name where domain and path match provided URL. eg: https://google.com
 *
 * @returns {Promise<Object[]>} - Array of cookie objects
 */
module.exports.getCookies = async (options = {}) => {
  validate();
  let cookies = await context.cookies();

  if (options.urls) {
    options.urls = options.urls.map(url => { return (new URL(url)).hostname })
    cookies = cookies.filter(cookie => options.urls.includes(cookie.domain));
  }
  return cookies;
};

/**
 * Overrides the Geolocation Position
 *
 * @example
 * await setLocation({ latitude: 27.1752868, longitude: 78.040009, accuracy:20 })
 *
 * @param {Object} options Latitue, logitude and accuracy to set the location. see [Detailed options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsercontextsetgeolocationgeolocation)
 *
 * @returns {Promise}
 */
module.exports.setLocation = async (options) => {
  validate();
  await context.setGeolocation(options);
};

_navigationFunction = async (func, options = {}) => {
  options = { ...userOptions, ...options };

  if ((options.waitForEvent && !Array.isArray(options.waitForEvent))
    || (options.waitForRequest && !Array.isArray(options.waitForRequest))
    || (options.waitForResponse && !Array.isArray(options.waitForResponse)))
    throw new Error('options.waitForXX must be arrays');

  let promises = [func, this.waitFor(500)];
  if (options.waitForEvent)
    options.waitForEvent.forEach(e => promises.push(page.waitForEvent(e)));
  if (options.waitForRequest)
    options.waitForRequest.forEach(e => promises.push(page.waitForRequest(e)));
  if (options.waitForResponse)
    options.waitForResponse.forEach(e => promises.push(page.waitForResponse(e)));
  if (options.waitForNavigation)
    promises.push(page.waitForNavigation());
  const [response] = await Promise.all(promises)
  return response;
}

/**
 * Reloads the page.
 * @example
 * await reload()
 * await reload({ navigationTimeout: 10000 })
 *
 * @param {Object} options
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Events available to wait for ['DOMContentLoaded', 'loadEventFired', 'networkAlmostIdle', 'networkIdle', 'firstPaint', 'firstContentfulPaint', 'firstMeaningfulPaint']
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 *
 * @returns {Promise}
 */
module.exports.reload = async (options) => {
  await _navigationFunction(page.reload(options));
};

/**
 * Mimics browser back button click functionality.
 * @example
 * await goBack()
 *
 * @param {Object} options
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Events available to wait for ['DOMContentLoaded', 'loadEventFired', 'networkAlmostIdle', 'networkIdle', 'firstPaint', 'firstContentfulPaint', 'firstMeaningfulPaint']
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 *
 * @returns {Promise}
 */
module.exports.goBack = async (options) => {
  validate();
  await _navigationFunction(page.goBack());
};

/**
 * Mimics browser forward button click functionality.
 * @example
 * await goForward()
 *
 * @param {Object} options
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Events available to wait for ['DOMContentLoaded', 'loadEventFired', 'networkAlmostIdle', 'networkIdle', 'firstPaint', 'firstContentfulPaint', 'firstMeaningfulPaint']
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 *
 * @returns {Promise}
 */
module.exports.goForward = async (options) => {
  validate();
  await _navigationFunction(page.goForward())
};

/**
 * Returns window's current URL.
 * @example
 * await openBrowser();
 * await goto("www.google.com");
 * await currentURL(); # returns "https://www.google.com/?gws_rd=ssl"
 *
 * @returns {Promise<string>} - The URL of the current window.
 */
module.exports.currentURL = () => {
  return page.url();
};

/**
 * Returns page's title.
 * @example
 * await openBrowser();
 * await goto("www.google.com");
 * await title(); # returns "Google"
 *
 * @returns {Promise<string>} - The title of the current page.
 */

module.exports.title = async () => {
  validate();
  return await page.title();
};

/**
 * Fetches an element with the given selector, scrolls it into view if needed, and then clicks in the center of the element. If there's no element matching selector, the method throws an error.
 * @example
 * await click($('[id = btnK]'))
 * await click($('//[@id = "btnK"]'))
 * await click($('text=button text'))
 *
 * @param {selector} selector - A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
 * @param {Object} options see [Detailed Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#pageclickselector-options)
 *
 * @returns {Promise}
 */
module.exports.click = async (selector, options = {}) => {
  options = { ...userOptions, ...options };
  validate();

  let elementHandle = await selector.getElementHandle();
  await _navigationFunction(elementHandle.click(options), options);
};

/**
 * Scroll to an element with the given selector. If there's no element matching selector, the method throws an error.
 * @example
 * await scrollTo($('[id = btnK]'))
 *
 * @param {selector} selector - A selector to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked.
 * @param {Object} options see [Detailed Options](https://github.com/microsoft/playwright/blob/v1.2.0/docs/api.md#elementhandlescrollintoviewifneededoptions)
 *
 * @returns {Promise}
 */
module.exports.scrollTo = async (selector, options = {}) => {
  options = { ...userOptions, ...options };
  validate();

  let elementHandle = await selector.getElementHandle();

  await elementHandle.scrollIntoViewIfNeeded(options);
};

/**
 * Fetches an element with the given selector, scrolls it into view if needed, and then hovers over the center of the element. If there's no element matching selector, the method throws an error.
 *
 * @example
 * await hover('text=Get Started')
 * await hover($('[id="btnK"]'))
 *
 * @param {selector|string} selector - A selector to search for element to right click. If there are multiple elements satisfying the selector, the first will be hovered.
 * @param {Object} options - see [Detailed Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagehoverselector-options)
 */
module.exports.hover = async (selector, options) => {
  validate();
  let elementHandle = await selector.getElementHandle();
  await elementHandle.hover(options);
};

/**
 * Fetches an element with the given selector and focuses it. If there's no element matching selector, the method throws an error.
 *
 * @example
 * await focus($('text=Username:'))
 *
 * @param {selector|string} selector - A selector of an element to focus. If there are multiple elements satisfying the selector, the first will be focused.
 * @param {Object} options - see [Detailed Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#pagefocusselector-options)
 */
module.exports.focus = async (selector) => {
  validate();
  let elementHandle = await selector.getElementHandle();
  await elementHandle.focus();
};

/**
 * Types the given text into the focused or given element.
 * @example
 * await write('admin', $('[id=text]'))
 * await write('admin')
 *
 * @param {string} text - Text to type into the element.
 * @param {Object} options
 *
 * @returns {Promise}
 */

module.exports.write = async (text, selector, options) => {
  if (selector) {
    let elementHandle = await selector.getElementHandle();
    await _navigationFunction(elementHandle.fill(text, options), options)
  } else {
    await page.keyboard.type(text);
  }
};

/**
 * Clears the value of given selector. If no selector is given clears the current active element.
 *
 * @example
 * await clear()
 * await clear($([placeholder:'Email']))
 *
 * @param {selector} selector - A selector to search for element to clear. If there are multiple elements satisfying the selector, the first will be cleared.
 * @param {Object} options - Click options.
 *
 * @returns {Promise}
 */
module.exports.clear = async (selector, options) => {
  if (selector) {
    let elementHandle = await selector.getElementHandle();
    await _navigationFunction(elementHandle.fill('', options), options);
  } else {
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Delete');
  };
};

/**
 * Attaches a file to a file input element.
 *
 * @example
 * await attach('c:/abc.txt', $('Please select a file:'))
 *
 * @param {string} filepath - The path of the file to be attached.
 * @param {selector|string} to - The file input element to which to attach the file.
 *
 * @returns {Promise}
 */
module.exports.attach = async (filePath, to) => {
  page.once('filechooser', async (fileChooser) => {
    await fileChooser.setFiles(filePath);
  });
  await this.click(to);
  await this.waitFor(500);
};

/**
 * Presses the given keys.
 *
 * @example
 * await press('Enter')
 * await press('a')
 * await press(['Shift', 'ArrowLeft', 'ArrowLeft'])
 *
 * @param {string | Array<string> } keys - Name of keys to press. See [USKeyboardLayout](https://github.com/getgauge/taiko/blob/master/lib/data/USKeyboardLayout.js) for a list of all key names.
 * @param {Object} options
 *
 * @returns {Promise}
 */
module.exports.press = async (keys, options) => {
  !Array.isArray(keys) ?
    await _navigationFunction(page.keyboard.press(keys, options), options) :
    keys.forEach(async key => await _navigationFunction(page.keyboard.press(key, options), options));
};

/**
 * Highlights the given element on the page by drawing a red rectangle around it. This is useful for debugging purposes.
 *
 * @example
 * await highlight('text=Get Started')
 * await highlight($('//*[@id="button"]'))
 *
 * @param {selector} selector - A selector of an element to highlight. If there are multiple elements satisfying the selector, the first will be highlighted.
 *
 * @returns {Promise}
 */
module.exports.highlight = async (selector) => {
  const highlight = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.parentElement.style.outline = '0.2em solid red';
      return;
    }
    node.style.outline = '0.2em solid red';
  };

  let elementHandle = await selector.getElementHandle();
  await elementHandle.evaluate(highlight);

};

/**
 * Performs the given mouse action on the given coordinates. This is useful in performing actions on canvas.
 *
 * @example
 * await mouseAction('down', {x:0,y:0})
 * await mouseAction('move', {x:9,y:9})
 * await mouseAction('release', {x:9,y:9})
 * await mouseAction('down',$("#elementID"), {x:0,y:0})
 * await mouseAction('click',$("#elementID"))
 * await mouseAction('move',$(".elementClass"), {x:9,y:9})
 * await mouseAction('up',$("//*[@id='plop']"), {x:9,y:9})
 * @param {string} selector - Element to be selected on the canvas
 * @param {string} action - Action to be performed on the canvas/selector
 * @param {Object} coordinates - Coordinates of a point on canvas/selector to perform the action.
 * @param {Object} options
 */

module.exports.mouseAction = async (action, selector, coordinates, options = {}) => {
  options = { ...userOptions, ...options }

  if (selector) {
    let elementHandle = await selector.getElementHandle();
    let boundingBox = await elementHandle.boundingBox();
    coordinates = coordinates ?
      { x: boundingBox.x + coordinates.x, y: boundingBox.y + coordinates.y } :
      { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
  }

  let targetAction = page.mouse[action];
  if (targetAction) {
    if (action === 'down' || action === 'up') {
      await page.mouse.move(coordinates.x, coordinates.y);
      this.waitFor(500)
      await page.mouse[action]();
    } else {
      await page.mouse[action](coordinates.x, coordinates.y);
    }
  } else
    throw new Error(`Unknown action, Please set one of the given press\nmove\nrelease`);
};



/**
 * Scrolls the page to the given element.
 *
 * @example
 * await scrollTo($('text=Get Started'))
 *
 * @param {selector} selector - A selector of an element to scroll to.
 * @param {Object} options
 *
 * @returns {Promise}
 */

module.exports.scrollTo = async (selector, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  let elementHandle = await selector.getElementHandle();
  await _navigationFunction(elementHandle.scrollIntoViewIfNeeded());
}

/**
 * Captures a screenshot of the page. Appends timeStamp to filename if no filepath given.
 *
 * @example
 * await screenshot()
 * await screenshot({path : 'screenshot.png'})
 *
 * @param {selector|string} selector
 * @param {Object} options
 *
 * @returns {Promise<Buffer>} - Promise which resolves to buffer with captured screenshot if {encoding:'base64'} given.
 */

module.exports.screenshot = async (selector, options = {}) => {
  options = { ...userOptions, ...options };
  validate();

  let elementHandle = await selector.getElementHandle();
  options.clip = await elementHandle.boundingBox();

  options.path = options.path || `Screenshot-${Date.now()}.png`;
  let screenShot = await page.screenshot(options);
  if (options.encoding)
    return Buffer.from(screenShot).toString(options.encoding);
}

/**
 * This {@link selector} lets you identify elements on the web page via XPath, CSS selector or text.
 * @example
 * await highlight($(`//*[text()='text']`))
 * await $(`[class='className']`).exists()
 * await $(`text=lorem ipsum`)
 * 
 *
 * @param {string} selector - XPath or CSS selector.
 * @returns {Selector}
 */


module.exports.$ = (selector, options = {}) => {
  options = { ...userOptions, ...options }
  validate();
  return new Selector(selector, options);
};

function Selector(selector, options) {
  this.options = options;

  typeof selector == 'string' ?
    this.selector = selector :
    this.elementHandle = selector;

  this.getElementHandle = async (options) => {
    return this.elementHandle || await this._updateElementHandle(options);
  };

  this.exists = async (options = {}) => {
    options = { ...{ implicitWait: false }, ...options }
    return await this.getElementHandle() != undefined;
  }

  this.text = async () => {
    const element = await this.getElementHandle()
    const text = await element.getProperty('textContent');
    return await text.jsonValue();
  }

  this.select = async (value, options) => {
    const element = await this.getElementHandle()
    return await element.selectOption(value, options);
  }

  this.check = async (options) => {
    const element = await this.getElementHandle()
    return await element.check(options);
  }

  this.uncheck = async (options) => {
    const element = await this.getElementHandle()
    return await element.uncheck(options);
  }
  //checkbox & radioButton
  this.isChecked = async () => {
    const element = await this.getElementHandle()
    const checked = await element.getProperty('checked');
    return await checked.jsonValue();
  }

  this.$ = async (selector) => {
    const element = await this.getElementHandle()
    return new Selector(await element.$(selector),options);
  }

  this.pwElementHandle = async () => {
    const element = await this.getElementHandle();
    return element;
  }

  this.value = async () => {
    const element = await this.getElementHandle()
    const value = await element.getProperty('value');
    return await value.jsonValue();
  }

  this._updateElementHandle = async (options = {}) => {
    options = { ...this.options, ...options };
    var timer = false;

    do {
      timer ? await new Promise((resolve) => setTimeout(resolve, 1000)) : timer = true;
      try {
        let frames = await page.frames();
        if (options.implicitWait) {
          return await Promise.race(frames.map(async frame =>
            await frame.waitForSelector(selector, options)
          ));
        } else {
          let elementHandles = await Promise.all(frames.map(async frame => await frame.$(selector)));
          [elementHandles] = elementHandles.filter(elementHandle => elementHandle != null);
          return elementHandles;
        }
      } catch (e) {
      }

    } while (true)
  }

  this.elements = async (options = {}) => {
    options = { ...this.options, ...options };
    let ret = [];
    let frames = await page.frames();
    let elementHandles = await Promise.all(frames.map(async frame => await frame.$$(selector)));
    elementHandles.filter(elementHandle => elementHandle.length != 0).flat().forEach(e => { ret.push(new Selector(e,options))});
    return ret;
  }
}


/**
 * Lets you configure global configurations.
 *
 * @example
 * setConfig( { observeTime: 3000});
 *
 * @param {Object} options
 * @param {number} [options.observeTime = 3000 ] - Option to modify delay time in milliseconds for observe mode.
 * @param {number} [options.navigationTimeout = 30000 ] Navigation timeout value in milliseconds for navigation after performing
 * <a href="#openPage">openPage</a>, <a href="#goto">goto</a>, <a href="#reload">reload</a>, <a href="#goback">goBack</a>,
 * <a href="#goforward">goForward</a>, <a href="#click">click</a>, <a href="#write">write</a>, <a href="#clear">clear</a>,
 * <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 * @param {boolean} [options.waitForNavigation = true ] Wait for navigation after performing <a href="#goto">goto</a>, <a href="#click">click</a>,
 * <a href="#doubleclick">doubleClick</a>, <a href="#rightclick">rightClick</a>, <a href="#write">write</a>, <a href="#clear">clear</a>,
 * <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 */

module.exports.setConfig = (config) => {
  userOptions = { ...userOptions, ...config };
};

/**
 * Lets you read the global configurations.
 *
 * @example
 * getConfig("retryInterval");
 *
 * @param {String} optionName - Specifies the name of the configuration option/paramter you want to get (optional). If not specified, returns a shallow copy of the full global configuration.
 * @param {String} ["navigationTimeout"] Navigation timeout value in milliseconds for navigation after performing
 * @param {String} ["observeTime"] Option to modify delay time in milliseconds for observe mode.
 * @param {String} ["timeout"] Option to modify delay time in milliseconds for all actions.
 * @param {String} ["observe"] Option to run each command after a delay. Useful to observe what is happening in the browser.
 * @param {String} ["waitForNavigation"] Wait for navigation after performing <a href="#goto">goto</a>, <a href="#click">click</a>,
 * <a href="#write">write</a>, <a href="#clear">clear</a>, <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 * @param {String} ["ignoreSSLErrors"] Option to ignore SSL errors encountered by the browser.
 * @param {String} ["headless"] Option to open browser in headless/headful mode.
 
 */

module.exports.getConfig = async (config) => {
  if (config)
    return userOptions[config];
};

/**
 * This function is used to wait for number of milliseconds given or a given Selector or a given condition.
 *
 * @example
 * # case 1: wait for time :
 * await waitFor(5000)
 * # case 2: wait for Selector :
 * await waitFor($("text=1 item in cart"))
 * await waitFor($("text=Order Created"),'hidden')
 * # case 3: wait for function :
 * let f = () => {return window.innerWidth < 500;}
 * await waitFor(f)
 * # case 4: wait for function with single or multiple args in an array :
 * await waitFor(([element,color]) => 
 * { return element.style.background == color;}
 * ,[$('//*[@class="content-info__item"][1]'),'green']);
 * 
 * @return {promise}
 */

module.exports.waitFor = async (elementOrFunc, args, options = {}) => {
  options = { ...userOptions, ...options }
  validate();

  if ((typeof elementOrFunc == 'string' && !isNaN(parseInt(elementOrFunc))) || typeof elementOrFunc == 'number') {
    let time = (typeof elementOrFunc == 'string') ? parseInt(elementOrFunc) : elementOrFunc;
    return await page.waitForTimeout(time);
  }
  if (elementOrFunc instanceof Selector) {
    options.waitFor = args || 'visible';
    return await elementOrFunc.getElementHandle({ implicitWait: true });
  }

  if (typeof elementOrFunc == "function" && Array.isArray(args)) {
    args = await Promise.all(args.map(async arg => { return (arg instanceof Selector) ? await arg.getElementHandle() : arg; }));
    return await page.waitForFunction(elementOrFunc, args, options);
  }
  throw new Error('waitFor badly invoked');
};

/**
 * Evaluates script on element matching the given selector.
 *
 * @example
 *
 * await evaluate(() => {
 *   // Callback function have access to all DOM APIs available in the developer console.
 *   return document.title;
 * } )
 *
 * await evaluate((element) => element.style.backgroundColor),$("[button]"));
 *
 * await evaluate(([element,color]) => 
 * { element.style.background = color;}
 * ,[$('//*[@class="content-info__item"][1]'),'green']);
 * 
 *
 * @param {function} callback - callback method to execute on the element or root HTML element when selector is not provided.<br>
 * @param {any} args - single or multiple callback args embedded in an array.<br>
 * @param {Object} options - options.
 * NOTE : In callback, we can access only inline css not the one which are define in css files.
 * @returns {Promise<Object>} Object with return value of callback given
 */

module.exports.evaluate = async (callback, args, options) => {
  validate();
  options = { ...userOptions, ...options };

  if (Array.isArray(args))
    args = await Promise.all(args.map(async arg => { return (arg instanceof Selector) ? await arg.getElementHandle() : arg; }));
  return await _navigationFunction(page.evaluate(callback, args), options);
};
