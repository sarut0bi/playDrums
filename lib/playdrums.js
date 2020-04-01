
let browser,
  context,
  page,
  device = false

const { chromium, firefox, webkit } = require('playwright');

const defaultConfig = {
  browser: chromium,
  device: { 'viewport': null },
  userOptions: {
    navigationTimeout: 30000,
    defaultTimeout: 10000,
    observeTime: 3000,
    retryInterval: 10,
    retryTimeout: 1000,
    observe: false,
    debugEvents: [],
    matchHiddenElement: false,
    headless: false,
  },
}

const userOptions = { ...defaultConfig.userOptions };


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
 * @param {Object} [options={headless:false}] eg. {headless: true|false,observe=true,browserType: 'webkit'}
 * @param {string} [options.browserType='firefox'] - Option to choose browser.
 * @param {boolean} [options.headless=false] - Option to open browser in headless/headful mode.
 * @param {boolean} [options.ignoreCertificateErrors=false] - Option to ignore certificate errors.
 * @param {boolean} [options.observe=false] - Option to run each command after a delay. Useful to observe what is happening in the browser.
 * @param {number} [options.observeTime=3000] - Option to modify delay time for observe mode. Accepts value in milliseconds.
 *
 * @returns {Promise}
 */
module.exports.openBrowser = async (options = {}) => {
  options = {...userOptions, ...options};
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

  let deviceContext = device || defaultConfig.device;

  browser = await browser.launch({ headless: headless });
  context = await browser.newContext(deviceContext);
  context.setDefaultNavigationTimeout(userOptions.navigationTimeout);
  context.setDefaultTimeout(userOptions.retryInterval * userOptions.retryTimeout);
  context.name = 'default';
  page = await context.newPage();
  _setDebugEvent();

};



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
 * Launches a new tab. If url is provided, the new tab is opened with the url loaded.
 * @example
 * await openTab('https://duckduckgo.com/')
 * await openTab() # opens a blank tab.
 *
 * @param {string} [targetUrl=undefined] - Url of page to open in newly created tab.
 * @param {Object} options
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click. Accepts value in milliseconds.
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Page load events to implicitly wait for. Events available https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page
 *
 * @returns {Promise}
 */
module.exports.openTab = async (url, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  page = await context.newPage();
  _setDebugEvent();
  if (typeof url == 'string')
    await this.goto(url);
};

/**
 * Allows switching between tabs using URL or page title in current Window.
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
module.exports.switchTab = async arg => {
  validate();

  if (typeof arg != 'string' && !Object.prototype.toString.call(arg).includes('RegExp')) {
    throw new TypeError(
      'The "targetUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }
  page = false;

  var pages = await currentContext.pages();

  for (let page of pages)
    page.title = await page.title();

  Object.prototype.toString.call(arg).includes('RegExp') ?
    pages = pages.filter(page => page.url().match(new RegExp(arg)) || page.title.match(new RegExp(arg))) :
    pages = pages.filter(page => page.url() === arg || page.title === arg);

  if (pages.length > 0) {
    page = pages[0];
    context = await page.context();
  }

  if (!page)
    throw new Error(`Cannot find title or URL matching ` + arg);

}

/**
 * Allows switching between tabs using URL or page title in all opened Window. Will return the first matching tab.
 *
 * @example
 * # switch using URL on default window
 * await switchWindow('https://duckduckgo.com/','default')
 * # switch using Title on all opened window
 * await switchTo('Taiko')
 * # switch using regex URL on window named 'Thirdwindow' 
 * await switchTo(/http(s?):\/\/(www?).google.(com|co.in|co.uk)/,'ThirdWindow')
 *
 * @param {string} arg - URL/Page title of the tab to switch.
 * @param {string} name - Window name containing tab. Optional parameter
 *
 * @returns {Promise}
 */
module.exports.switchWindow = async (arg,name) => {
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
      break;
    }
  }
  if (!page)
    throw new Error(`Cannot find title or URL matching ` + arg);

}

/**
 * Add interceptor for the network call. Helps in overriding request or to mock response of a network call in currentWindow.
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
 * await openWindow({device:getDevice('iPhone 6')});
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
 * Opens the specified URL in the browser's window. Adds `http` protocol to the URL if not present.
 * @example
 * await openWindow('https://google.com', { name: 'windowName' }) - Opens a Incognito window
 * await openWindow('https://google.com', { name: 'windowName', incognito: false }) - Opens normal window
 * @param {string} name - name of the window
 * @param {string} url - URL to navigate page to.
 * @param {Object} options
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Events available to wait for ['DOMContentLoaded', 'loadEventFired', 'networkAlmostIdle', 'networkIdle', 'firstPaint', 'firstContentfulPaint', 'firstMeaningfulPaint']
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {Object} options.headers - Map with extra HTTP headers.
 *
 * @returns {Promise}
 */

module.exports.openWindow = async (name,url,options = {}) => {
  options = {...userOptions,...options};
  validate();
  let deviceContext = device || defaultConfig.device;
  let lastContext = context;
  let lastPage = page;
  context = await browser.newContext(deviceContext);
  context.setDefaultNavigationTimeout(userOptions.navigationTimeout);
  context.setDefaultTimeout(userOptions.retryInterval * userOptions.retryTimeout);
  context.name = name;
  context.lastContext = lastContext;
  context.lastPage = lastPage;
  page = await context.newPage();
  _setDebugEvent();
};

/**
 * Closes the specified browser window.
 * @example
 * await closeWindow('windowName') - Closes a window with given arg or current if not provided
 */

module.exports.closeWindow = async () => {
  validate();
  let closedContext = context;
  context = closedContext.lastContext;
  page = closedContext.lastPage;
  await closedContext.close();
};

/**
 * Closes the given tab with given URL or closes current tab in current or given context.
 *
 * @example
 * # Closes the current tab.
 * await closeTab()
 * # Closes all the tabs with Title 'Open Source Test Automation Framework | Gauge' in currentWindow
 * await closeTab('Open Source Test Automation Framework | Gauge')
 * # Closes all the tabs with URL 'https://gauge.org'. in 'default' named context. 
 * await closeTab('https://gauge.org','default')

 *
 * @param {string} [arg=undefined] - URL/Page title of the tab to close. Optionnal
 * @param {string} [window=undefined] - context to close page in. Optionnal
 *
 * @returns {Promise}
 */

module.exports.closeTab = async (arg,window) => {
  validate();

  if (typeof arg == 'string' || Object.prototype.toString.call(arg).includes('RegExp')) {

    var pages = await currentContext.pages();

    for (let page of pages)
      page.title = await page.title();

    Object.prototype.toString.call(arg).includes('RegExp') ?
      pages = pages.filter(page => page.url().match(new RegExp(arg)) || page.title.match(new RegExp(arg))) :
      pages = pages.filter(page => page.url() === arg || page.title === arg);

    if (pages.length > 0) {
      page = pages[0];
    }else{
      throw new Error(`Unable to find tab matching `+arg)
    }
  }

  await page.close();
  page = context.lastPage;
  context = context.lastContext;
}

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
    let filteredCookies = cookies.filter(cookie => JSON.stringify(cookie) !== JSON.stringify({... cookie,... name}));
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
  cookies = cookies.filter(cookie => JSON.stringify(cookie) === JSON.stringify({...cookie, ...name}));
  return cookies;
};

_navigationFunction = async (func, options = {}) => {
  options = {...userOptions,...options};
  var promises = [func];
  if (options.waitForEvent)
    promises.push(page.waitForEvent(options.waitForEvent));
  //  typeof options.waitForNavigation == 'object' ?
  //    promises.push(page.waitForNavigation(options.waitForNavigation)) :
  //    promises.push(page.waitForNavigation());

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
 * Opens the specified URL in the browser's tab. Adds `http` protocol to the URL if not present.
 * @example
 * await goto('https://google.com')
 * await goto('google.com')
 * await goto({ navigationTimeout:10000, headers:{'Authorization':'Basic cG9zdG1hbjpwYXNzd29y2A=='}})
 *
 * @param {string} url - URL to navigate page to.
 * @param {Object} options
 * @param {string[]} [options.waitForEvents = ['domcontentloaded']] - Events available to wait for ['DOMContentLoaded', 'loadEventFired', 'networkAlmostIdle', 'networkIdle', 'firstPaint', 'firstContentfulPaint', 'firstMeaningfulPaint']
 * @param {number} [options.navigationTimeout=30000] - Navigation timeout value in milliseconds for navigation after click.
 * @param {Object} options.headers - Map with extra HTTP headers.
 *
 * @returns {Promise}
 */
module.exports.goto = async (url, options = {}) => {
  options = {...userOptions,...options};
  validate();
  if (options.headers)
    await page.setExtraHTTPHeaders(headers);
  await _navigationFunction(page.goto(url), options);
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
  options = {...userOptions,...options};
  validate();

  var isBehindOtherElement = (element) => {
    const boundingRect = element.getBoundingClientRect()
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

  let elementHandle = await selector.getElementHandle();

  if (!elementHandle)
    throw new Error(selector.selector + ' not found');
  if (await elementHandle.evaluate(isBehindOtherElement))
    throw new Error(selector.selector + ' is covered by other element or not visible anymore');

  //await elementHandle.click(options);

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

module.exports.write = async (text, selector, options) => {
  if (selector) {
    let elementHandle = await selector.getElementHandle();
    await elementHandle.fill(text, options)
  } else {
    await page.keyboard.type(text);
  }
};

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

module.exports.attach = async (filePath, to) => {
  await this.click(to);
  page.on('filechooser', async ({ element, multiple }) => {
    await element.setInputFiles(filePath);
  });
};

module.exports.press = async (keys, options) => {
  if (typeof keys == 'string')
    await page.keyboard.press(keys);
  else
    for (let key of keys)
      await page.keyboard.press(key);
};

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

module.exports.mouseAction = async (selector, action, coordinates, options = {}) => {
  options = { ...userOptions,...options}
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

module.exports.scrollTo = async (selector, options = {}) => {
  validate();
  let elementHandle = await selector.getElementHandle();
  await _navigationFunction(elementHandle.scrollIntoViewIfNeeded());
}

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
  this.matchHiddenElement = options.matchHiddenElement;


  this.exists = async (retryInterval,retryTimeout) => {
    retryInterval = retryInterval || userOptions.retryInterval;
    retryTimeout = retryTimeout || userOptions.retryTimeout;

    //var promises = [this.getElementHandle().catch(() => new Promise((resolve) => {/*noop*/})), new Promise((resolve, reject) => setTimeout(() => reject('Timeout !'), 1000))];
    var promises = [this.getElementHandle(), new Promise((resolve) => setTimeout(() => resolve('Timeout !'), 10))];
    const response = await Promise.race(promises)


    return response != null;
  }

  this.getElementHandle = async () => {
    var matchingElements = await page.$$(selector)
    if (!this.matchHiddenElement) {
      for (let element of matchingElements)
        element.lastBoundingBox = await element.boundingBox();
      matchingElements = matchingElements.filter(element => element.lastBoundingBox != null)
    }
    var [ret] = matchingElements || undefined;
    return ret;
  }
}


module.exports.evaluate = async (selector, callback, options = {}) => {
  options = {...userOptions,...options};
  validate();
  let elementHandle;
  selector ? elementHandle = await selector.getElementHandle() : elementHandle = page;
  return await elementHandle.evaluate(callback);

};

module.exports.setConfig = async (config) => {
  userOptions = {...userOptions,...config};
};

module.exports.getConfig = async (config) => {
  if(config)
    return userOptions[config];
};


module.exports.$ = (selector, options = {}) => {
  options = { ...userOptions, ...options }
  validate();
  return new Selector(selector, options);
};


module.exports.waitFor = async (element, time) => {
  validate();
  await page.waitFor(element);
};

