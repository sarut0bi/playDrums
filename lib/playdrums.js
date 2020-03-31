
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

module.exports.openTab = async (url, options = {}) => {
  options = { ...userOptions, ...options };
  validate();
  page = await context.newPage();
  _setDebugEvent();
  if (typeof url == 'string')
    await this.goto(url);
};

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

module.exports.switchWindow = async (name, arg) => {
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

module.exports.intercept = async (requestUrl, option, count) => {
  if (!concept.interceptedRequests)
    concept.interceptedRequests = [];

  if (typeof requestUrl != 'string' && !Object.prototype.toString.call(requestUrl).includes('RegExp')) {
    throw new TypeError(
      'The "requestUrl" argument must be of type string or regex. Received type ' + typeof arg,
    );
  }
  if (Object.prototype.toString.call(requestUrl).includes('RegExp'))
    requestUrl = new RegExp(requestUrl);

  if (!count)
    count = 0;

  concept.interceptedRequests.push({
    requestUrl: requestUrl,
    option: option,
    count: count,
  });

  await concept.route(requestUrl, (request) => {
    var matchRequest;

    request.respond = request.fulfill;

    typeof requestUrl == 'string' ?
      matchRequest = concept.interceptedRequests.filter(r => request.url() === r.requestUrl)[0] :
      matchRequest = concept.interceptedRequests.filter(r => request.url().match(r.requestUrl))[0];

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
    concept.interceptedRequests = concept.interceptedRequests.filter(r => r.count != 0);
  });
}

module.exports.clearIntercept = async () => {
  validate();
  concept.interceptedRequests = [];
};

module.exports.setViewPort = async options => {
  validate();
  await page.setViewportSize(options);
};

module.exports.emulateDevice = async deviceModel => {
  //if (browser)
   // throw new Error(`Please set device emulation before opening browser`);
  const devices = require('playwright');
  let matchDevice = devices.devices[deviceModel];

  if (matchDevice == undefined) {
    throw new Error(`Please set one of the given device models \n${Object.keys(devices.devices).join('\n')}`);
  } else {
    device = matchDevice;
  }
  if(page)
    await this.reload();
};

module.exports.openWindow = async (name,options = {}) => {
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

module.exports.closeWindow = async () => {
  validate();
  let closedContext = context;
  context = closedContext.lastContext;
  page = closedContext.lastPage;
  await closedContext.close();
};

module.exports.closeTab = async arg => {
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

module.exports.overridePermissions = async (origin, permissions) => {
  validate();
  await context.grantPermissions(permissions, origin);
};

module.exports.clearPermissionOverrides = async () => {
  validate();
  await context.clearPermissions();
};

module.exports.setCookie = async (name, value, options = {}) => {
  validate();
  if (!options.url && !options.domain) {
    throw new Error('At least URL or domain needs to be specified for setting cookies');
  }
  options.name = name;
  options.value = value;
  await context.setCookies([options]);
};

module.exports.deleteCookies = async (name) => {
  validate();
  if (!name) {
    await context.clearCookies();
  } else {
    if (typeof name == 'string')
      name = { name: name };
    let cookies = await context.cookies();
    let filteredCookies = cookies.filter(cookie => JSON.stringify(cookie) !== JSON.stringify(Object.assign({}, cookie, name)));
    if (cookies.length == filteredCookies.length)
      throw new Error('Found no cookie(s) matching name ' + name);
    await context.clearCookies();
    await context.setCookies(filteredCookies);
  }
};

module.exports.getCookies = async (name) => {
  validate();
  let cookies = await context.cookies();
  if (name)
    if (typeof name == 'string')
      name = { name: name };
  cookies = cookies.filter(cookie => JSON.stringify(cookie) === JSON.stringify(Object.assign({}, cookie, name)));
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

module.exports.setLocation = async (options) => {
  validate();
  await context.setGeolocation(options);
};

module.exports.goto = async (url, options = {}) => {
  validate();
  if (options.headers)
    await page.setExtraHTTPHeaders(headers);
  await _navigationFunction(page.goto(url), options);
};

module.exports.reload = async (options) => {
  await _navigationFunction(page.reload(options));
};

module.exports.goBack = async (options) => {
  validate();
  await _navigationFunction(page.goBack());
};

module.exports.goForward = async (options) => {
  validate();
  await _navigationFunction(page.goForward())
};

module.exports.currentURL = () => {
  return page.url();
};

module.exports.title = async () => {
  validate();
  return await page.title();
};

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


module.exports.doubleClick = async (selector, options = {}) => {
  options = { ...userOptions,...options, ...{ clickCount: 2 } }
  validate();
  let elementHandle = await selector.getElementHandle();
  await _navigationFunction(elementHandle.click(options));
};

module.exports.rightClick = async (selector, options = {}) => {
  options = { ...userOptions, ...options, ...{ button: "right" } }
  validate();
  let elementHandle = await selector.getElementHandle();
  await _navigationFunction(elementHandle.click(options));
};

module.exports.dragAndDrop = async (selector, options = {}) => {
  throw new Error('osef');
};

module.exports.hover = async (selector, options) => {
  validate();
  let elementHandle = await selector.getElementHandle();
  await elementHandle.hover(options);
};

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

