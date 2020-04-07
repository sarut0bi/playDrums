
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
    incognito: false,
  },
}

const userOptions = { ...defaultConfig.userOptions };

const browserHistory = [];

const validate = () => {
  if (!(browser && context && page))
    throw new Error('Browser or page not initialized. Call `openBrowser()` before using this API');
}

const _setDebugEvent = () => {
  userOptions.debugEvents.forEach((event) => page.on(event, () => console.log('!event ' + event + ' raised')));
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
 * @param {boolean} [options.setDebugEvent=false] - Turn on debug event in console
 * @param {Object} options extra options. See [Extra Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewcontextoptions) for a list of available options
 * @param {string} [options.browserType='chromium'] - Option to choose browser.
 * @param {Object} options.contextName - Name context as specified
 * @param {Object} options.device - Emulate given device. 
 * @param {Object} options.extraHTTPHeaders - Map with extra HTTP headers.
 * @param {boolean} [options.headless=false] - Option to open browser in headless/headful mode.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {string} options.url - URL to navigate page to.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 * 
 * @returns {Promise}
 */
module.exports.openBrowser = async (options = {}) => {
  options = { ...userOptions, ...options };
  if (browser)
    throw new Error(`Browser already opened`);

  if (options.browserType && typeof options.browserType == 'string')
    switch (options.browserType) {
      case "chromium":
        browser = chromium;
        break;
      case "firefox":
        browser = firefox;
        break;
      case "webkit":
        browser = webkit;
        break;
      default:
        throw new Error(`Unknown browser, Please set one of the given browser\nchromium\nfirefox\nwebkit`);
    }
  else
    browser = defaultConfig.browser;

  let headless = options.headless;
  if (options.headless && typeof options.headless == 'string')
    headless = options.headless.toLowerCase() === 'true'

  browser = await browser.launch({ headless: headless });
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
 * @param {number} [options.timeout=30000] - Navigation timeout value in milliseconds for navigation after click.
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
  context.name = options.contextName || 'defaultContext-' + Date.now;
  if (options.url)
    await this.openPage(options);
};

/**
 * Launches a new ¨Page. If url is provided, the new tab is opened with the url loaded.
 * @example
 * await openPage('https://duckduckgo.com/')
 * await openPage() # opens a blank tab.
 *
 * @param {Object} options extra options. See [Extra Options](https://github.com/microsoft/playwright/blob/master/docs/api.md#browsernewpageoptions) for a list of available options
 * @param {Object} [options.extraHTTPHeaders] - Map with extra HTTP headers.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=30000] - Navigation timeout value in milliseconds for navigation after click.
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
  page.uuid = uuid.v4().toString();
  browserHistory.push({ event: 'new', context: context, page: page });

  if (options.url)
    await this.goto((new URL(options.url)).toString(), options);
};

/**
 * Opens the specified URL in the browser's tab. Adds `http` protocol to the URL if not present.
 * @example
 * await goto('https://google.com')
 * await goto('google.com')
 * await goto({ navigationTimeout:10000, headers:{'Authorization':'Basic cG9zdG1hbjpwYXNzd29y2A=='}})
 *
 * @param {string} url - URL to navigate page to.
 * @param {Object} options
 * @param {Object} options.extraHTTPHeaders - Map with extra HTTP headers.
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {number} [options.timeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {string} [options.waitUntil = 'load'] - Events available to wait for "load"|"domcontentloaded"|"networkidle0"|"networkidle2"
 * 
 * @returns {Promise}
 */
module.exports.goto = async (url, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  if (options.extraHTTPHeaders)
    await page.setExtraHTTPHeaders(headers);
  await _navigationFunction(page.goto(url), options);
};

/**
 * Allows switching between pages using URL or page title in current Context.
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

  var pages = await context.pages();

  for (let page of pages)
    page.title = await page.title();

  Object.prototype.toString.call(arg).includes('RegExp') ?
    pages = pages.filter(page => page.url().match(new RegExp(arg)) || page.title.match(new RegExp(arg))) :
    pages = pages.filter(page => page.url() === arg || page.title === arg);

  if (pages.length > 0) {
    page = pages[0];
    browserHistory.push({ event: 'switch', context: context, page: page });
  }

  if (!page)
    throw new Error(`Cannot find title or URL matching ` + arg);
}

/**
 * Allows switching between tabs using URL or page title in all opened Window. Will return the first matching tab.
 *
 * @example
 * # switch using URL on default window
 * await switchContext('https://duckduckgo.com/','default')
 * # switch using Title on all opened window will return first match
 * await switchContext('Taiko')
 * # switch using regex URL on window named 'Thirdwindow' 
 * await switchContext(/http(s?):\/\/(www?).google.(com|co.in|co.uk)/,'ThirdWindow')
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

  var contexts = await browser.contexts();

  if (name) {
    contexts = contexts.filter((context) => context.name === name)
    if (contexts.length != 1)
      throw new Error('Found ' + contexts.length + ' matching ' + name);
  }

  for (let currentContext of contexts) {

    var pages = await currentContext.pages();

    for (let page of pages)
      page.title = await page.title();

    Object.prototype.toString.call(arg).includes('RegExp') ?
      pages = pages.filter(page => page.url().match(new RegExp(arg)) || page.title.match(new RegExp(arg))) :
      pages = pages.filter(page => page.url() === arg || page.title === arg);

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
 * Closes the browser and along with all of its tabs.
 *
 * @example
 * await closeBrowser()
 *
 * @returns {Promise}
 */
module.exports.closeBrowser = async () => {
  if (page) {
    await page.close();
    page = false;
  }
  if (context) {
    await context.close();
    context = false;
  }
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
  var contexts = await browser.contexts();
  if (!name)
    name = context.name;

  contexts = contexts.filter((context) => context.name === name)
  if (contexts.length != 1)
    throw new Error('Found ' + contexts.length + ' matching ' + name);

  let closedContext = context;

  browserHistory = browserHistory.filter((acp) => acp.context.name !== name)
  context = browserHistory.slice(-1).context;
  page = browserHistory.slice(-1).page;

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
    var contexts = await browser.contexts();
    contexts = contexts.filter((context) => context.name === contextName)
    if (contexts.length != 1)
      throw new Error('Found ' + contexts.length + ' matching ' + name);
    [targetContext] = contexts;
  }

  if (typeof arg == 'string' || Object.prototype.toString.call(arg).includes('RegExp')) {

    var pages = await targetContext.pages();

    for (let page of pages)
      page.title = await page.title();

    Object.prototype.toString.call(arg).includes('RegExp') ?
      pages = pages.filter(page => page.url().match(new RegExp(arg)) || page.title.match(new RegExp(arg))) :
      pages = pages.filter(page => page.url() === arg || page.title === arg);

    if (pages.length == 0)
      throw new Error(`Unable to find tab matching ` + arg)

    for (let targetPage of pages) {
      browserHistory = browserHistory.filter((acp) => acp.context.name !== targetContext.name && acp.page.uuid !== targetPage.uuid);
      if (targetPage == page)
        currentPageClosed = true;
      await targetPage.close();
    }
  }

  if (currentPageClosed) {
    context = browserHistory.slice(-1).context;
    page = browserHistory.slice(-1).page;
  }
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
  if (Object.prototype.toString.call(requestUrl).includes('RegExp'))
    requestUrl = new RegExp(requestUrl);

  if (!count)
    count = 0;

  context.interceptedRequests.push({
    requestUrl: requestUrl,
    option: option,
    count: count,
  });

  await context.route(requestUrl, (request) => {
    var matchRequest;

    request.respond = request.fulfill;

    typeof requestUrl == 'string' ?
      matchRequest = context.interceptedRequests.filter(r => request.url() === r.requestUrl)[0] :
      matchRequest = context.interceptedRequests.filter(r => request.url().match(r.requestUrl))[0];

    if (matchRequest) {

      if (!matchRequest.option)
        request.abort();
      if (typeof matchRequest.option == 'object') {
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

module.exports.clearIntercept = async () => {
  validate();
  context.interceptedRequests = [];
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
module.exports.getDevice = async deviceModel => {
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
  validate();
  if (!options.url && !options.domain) {
    throw new Error('At least URL or domain needs to be specified for setting cookies');
  }
  options.name = name;
  options.value = value;
  await context.setCookies([options]);
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
  if (!name) {
    await context.clearCookies();
  } else {
    if (typeof name == 'string')
      name = { name: name };
    let cookies = await context.cookies();
    let filteredCookies = cookies.filter(cookie => JSON.stringify(cookie) !== JSON.stringify({ ...cookie, ...name }));
    if (cookies.length == filteredCookies.length)
      throw new Error('Found no cookie(s) matching name ' + name);
    await context.clearCookies();
    await context.setCookies(filteredCookies);
  }
};

/**
 * Get browser cookies
 *
 * @example
 * await getCookies()
 *
 * @param {Object} options
 *
 * @returns {Promise<Object[]>} - Array of cookie objects
 */
module.exports.getCookies = async (name) => {
  validate();
  let cookies = await context.cookies();
  if (name)
    if (typeof name == 'string')
      name = { name: name };
  cookies = cookies.filter(cookie => JSON.stringify(cookie) === JSON.stringify({ ...cookie, ...name }));
  return cookies;
};

_navigationFunction = async (func, options = {}) => {
  options = { ...userOptions, ...options };
  var promises = [func];
  if (options.waitForEvent)
    Array.isArray(options.waitForEvent) ? promises.push(...page.waitForEvent(options.waitForEvent)) : promises.push(page.waitForEvent(options.waitForEvent));
  if (options.waitForRequest)
    Array.isArray(options.waitForRequest) ? promises.push(...page.waitForRequest(options.waitForRequest)) : promises.push(page.waitForRequest(options.waitForRequest));
  if (options.waitForResponse)
    Array.isArray(options.waitForResponse) ? promises.push(...page.waitForResponse(options.waitForResponse)) : promises.push(page.waitForResponse(options.waitForRequest));

  const [response] = await Promise.all(promises)
  return response;
}
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

  if (!elementHandle)
    throw new Error(selector.selector + ' not found');

  await _navigationFunction(elementHandle.click(options), options);
};

/**
 * Fetches an element with the given selector, scrolls it into view if needed, and then hovers over the center of the element. If there's no element matching selector, the method throws an error.
 *
 * @example
 * await hover('Get Started')
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
 * await focus(textBox('Username:'))
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
    await elementHandle.fill(text, options)
  } else {
    await page.keyboard.type(text);
  }
};

/**
 * Clears the value of given selector. If no selector is given clears the current active element.
 *
 * @example
 * await clear()
 * await clear(textBox({placeholder:'Email'}))
 *
 * @param {selector} selector - A selector to search for element to clear. If there are multiple elements satisfying the selector, the first will be cleared.
 * @param {Object} options - Click options.
 *
 * @returns {Promise}
 */
module.exports.clear = async (selector, options) => {
  if (selector) {
    let elementHandle = await selector.getElementHandle();
    await elementHandle.fill('', options);
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
 * await attach('c:/abc.txt', to('Please select a file:'))
 * await attach('c:/abc.txt', 'Please select a file:')
 *
 * @param {string} filepath - The path of the file to be attached.
 * @param {selector|string} to - The file input element to which to attach the file.
 *
 * @returns {Promise}
 */
module.exports.attach = async (filePath, to) => {
  await this.click(to);
  page.on('filechooser', async ({ element, multiple }) => {
    await element.setInputFiles(filePath);
  });
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
  if (!Array.isArray(keys))
    await page.keyboard.press(keys);
  else
    for (let key of keys)
      await page.keyboard.press(key);
};

/**
 * Highlights the given element on the page by drawing a red rectangle around it. This is useful for debugging purposes.
 *
 * @example
 * await highlight('Get Started')
 * await highlight(link('Get Started'))
 *
 * @param {selector} selector - A selector of an element to highlight. If there are multiple elements satisfying the selector, the first will be highlighted.
 *
 * @returns {Promise}
 */
module.exports.highlight = async (selector) => {
  /*
  const test = {
    prop: 42,
  };
  
  var testFunc = (plop) => {
      return plop.prop;
    }
  
  console.log(testFunc.call(this,test));
  // expected output: 42
  
  */
  var highlight = (node) => {
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
 * await mouseAction('press', {x:0,y:0})
 * await mouseAction('move', {x:9,y:9})
 * await mouseAction('release', {x:9,y:9})
 * await mouseAction($("#elementID"),'press', {x:0,y:0})
 * await mouseAction($(".elementClass"),'move', {x:9,y:9})
 * await mouseAction($("testxpath"),'release', {x:9,y:9})
 * @param {string} selector - Element to be selected on the canvas
 * @param {string} action - Action to be performed on the canvas/selector
 * @param {Object} coordinates - Coordinates of a point on canvas/selector to perform the action.
 * @param {Object} options
 */

module.exports.mouseAction = async (selector, action, coordinates, options = {}) => {
  options = { ...userOptions, ...options }
  if (selector) {
    let elementHandle = await selector.getElementHandle();
    let boundingBox = await elementHandle.boundingBox();
    coordinates = { x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height / 2 };
  }

  if (typeof action == 'string' && action == 'press' || 'move' || 'release')
    switch (action) {
      case "press":
        await page.mouse.down(coordinates);
        break;
      case "move":
        await page.mouse.move(coordinates);
        break;
      case "release":
        await page.mouse.up(coordinates);
        break;
      default:
        throw new Error(`Unknown action, Please set one of the given press\nmove\nrelease`);
    }
};

/**
 * Scrolls the page to the given element.
 *
 * @example
 * await scrollTo(link('Get Started'))
 *
 * @param {selector} selector - A selector of an element to scroll to.
 * @param {Object} options
 *
 * @returns {Promise}
 */

module.exports.scrollTo = async (selector, options = {}) => {
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
  validate();

  let elementHandle = await selector.getElementHandle();
  options.clip = await elementHandle.boundingBox();

  options.path = options.path || `Screenshot-${Date.now()}.png`;
  let screenShot = await page.screenshot(options);
  if (options.encoding)
    return Buffer.from(screenShot).toString(options.encoding);
}

function Selector(selector, options) {
  this.options = options;
  this.selector = selector;

  this.getElementHandle = async () => {
    let tempSelector = selector;
    let elementHandle = page.$(selector);
    if (elementHandle)
      return elementHandle;

    tempSelector = '//*[text()="' + selector + '"]';
    elementHandle = page.$(tempSelector)
    if (elementHandle) {
      this.selector = tempSelector;
      return elementHandle;
    }

    tempSelector = '//*[@*="' + selector + '"]';
    elementHandle = page.$(tempSelector)
    if (elementHandle) {
      this.selector = tempSelector;
      return elementHandle;
    }

    throw new Error(`Unable to find ${selector}`)
  }

  this.isVisible = async (timeout) => {
    return await _checkBuiltinElementState(timeout, 'visible') != undefined;
  }

  this.isAttached = async (timeout) => {
    return TODO;
  }

  this.isDetached = async (timeout) => {
    return TODO;
  }

  this.isHidden = async (timeout) => {
    return TODO;
  }

  this.HaveElementAbove = async (timeout) => {
    return await _checkEvaluatedElementState(timeout, __elementsAbove);
  }


  _checkEvaluatedElementState = async (timeout, evaluateFunc) => {
    timeout = timeout || options.timeout;
    var elementHandle = await this.getElementHandle();
    return await elementHandle.evaluate(evaluateFunc);
  }

  __elementsAbove = async (element) => {
    let boundingRect = element.getBoundingClientRect()

    // adjust coordinates to get more accurate results
    const left = boundingRect.left + 1
    const right = boundingRect.right - 1
    const top = boundingRect.top + 1
    const bottom = boundingRect.bottom - 1

    if (document.elementFromPoint(left, top) !== element) return true
    if (document.elementFromPoint(right, top) !== element) return true
    if (document.elementFromPoint(left, bottom) !== element) return true
    if (document.elementFromPoint(right, bottom) !== element) return true

    return false

  }
}


/**
 * Evaluates script on element matching the given selector.
 *
 * @example
 *
 * await evaluate($("[button]"), (element) => element.style.backgroundColor)
 *
 * await evaluate((element) => {
 *      element.style.backgroundColor = 'red';
 * })
 *
 * await evaluate(() => {
 *   // Callback function have access to all DOM APIs available in the developer console.
 *   return document.title;
 * } )
 *
 * let options = { args: [ '.main-content', {backgroundColor:'red'}]}
 *
 * await evaluate(link("something"), (element, args) => {
 *      element.style.backgroundColor = args[1].backgroundColor;
 *      element.querySelector(args[0]).innerText = 'Some thing';
 * }, options)
 *
 * @param {selector|string} selector - Web element selector.
 * @param {function} callback - callback method to execute on the element or root HTML element when selector is not provided.<br>
 * NOTE : In callback, we can access only inline css not the one which are define in css files.
 * @param {Object} options - options.
 * @returns {Promise<Object>} Object with return value of callback given
 */

module.exports.evaluate = async (selector, callback, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  let elementHandle;
  selector ? elementHandle = await selector.getElementHandle() : elementHandle = page;
  return await elementHandle.evaluate(callback);
};

/**
 * Lets you configure global configurations.
 *
 * @example
 * setConfig( { observeTime: 3000});
 *
 * @param {Object} options
 * @param {number} [options.observeTime = 3000 ] - Option to modify delay time in milliseconds for observe mode.
 * @param {number} [options.navigationTimeout = 30000 ] Navigation timeout value in milliseconds for navigation after performing
 * <a href="#opentab">openTab</a>, <a href="#goto">goto</a>, <a href="#reload">reload</a>, <a href="#goback">goBack</a>,
 * <a href="#goforward">goForward</a>, <a href="#click">click</a>, <a href="#write">write</a>, <a href="#clear">clear</a>,
 * <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 * @param {number} [options.retryInterval = 100 ] Option to modify delay time in milliseconds to retry the search of element existence.
 * @param {number} [options.retryTimeout = 10000 ] Option to modify timeout in milliseconds while retrying the search of element existence.
 * @param {boolean} [options.waitForNavigation = true ] Wait for navigation after performing <a href="#goto">goto</a>, <a href="#click">click</a>,
 * <a href="#doubleclick">doubleClick</a>, <a href="#rightclick">rightClick</a>, <a href="#write">write</a>, <a href="#clear">clear</a>,
 * <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 */

module.exports.setConfig = async (config) => {
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
 * <a href="#doubleclick">doubleClick</a>, <a href="#rightclick">rightClick</a>, <a href="#write">write</a>, <a href="#clear">clear</a>,
 * <a href="#press">press</a> and <a href="#evaluate">evaluate</a>.
 * @param {String} ["ignoreSSLErrors"] Option to ignore SSL errors encountered by the browser.
 * @param {String} ["headless"] Option to open browser in headless/headful mode.

 */

module.exports.getConfig = async (config) => {
  if (config)
    return userOptions[config];
};

/**
 * This {@link selector} lets you identify elements on the web page via XPath or CSS selector and proximity selectors.
 * @example
 * await highlight($(`//*[text()='text']`))
 * await $(`//*[text()='text']`).exists()
 *
 * @param {string} selector - XPath or CSS selector.
 * @returns {Selector}
 */


module.exports.$ = (selector, options = {}) => {
  options = { ...userOptions, ...options }
  validate();
  return new Selector(selector, options);
};

/**
 * This function is used to wait for number of milliseconds given or a given Selector or a given condition.
 *
 * @example
 * # case 1: wait for time :
 * waitFor(5000)
 * # case 2: wait for Selector :
 * waitFor(3000,$("1 item in cart"))
 * waitFor(10000,$("Order Created"),'hidden')
 * # case 3: wait for function :
 * var f = () => {return window.innerWidth < 500;}
 * waitFor(10000,f)
 * # case 4: wait for function with args :
 * var f = (element,width) => {return element.innerWidth < width;}
 * waitFor(10000,f,window,500)
 * 
 * @return {promise}
 */
module.exports.waitFor = async (time, elementOrFunc, args, options = {}) => {
  options = { ...userOptions, ...options }
  validate();
  time = time || options.timeout;
  if (!elementOrFunc)
    return await page.waitFor(time);
  if (typeof elementOrFunc == "object") {
    options.waitFor = args || 'visible';
    options.timeout = time || options.timeout;
    return await page.waitForSelector(elementOrFunc.selector, options);
  }
  if (typeof elementOrFunc == "function") {
    options.polling = 1000;
    options.timeout = time || options.timeout;
    args = args.map(arg => {if(arg.constructor.name === 'Selector') return arg.selector;})
    return await page.waitForFunction(elementOrFunc, args, options);
  }
  throw new Error('waitFor badly invoked');
};

