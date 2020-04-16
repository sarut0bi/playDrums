const assert = require('assert');
const {
  scrollTo,
  scrollUp,
  press,
  hover,
  dragAndDrop,
  $,
  currentURL,
  clear,
  setCookie,
  deleteCookies,
  tap,
  waitFor,
  evaluate,
} = require('../lib/playdrums');
var URL = require('url').URL;

step('Scroll to <table>', async function (table) {
  for (let row of table.rows)
    await scrollTo($(row.cells[1]));
});

step('Press <key>', async function (key) {
  await press(key);
});

step('Hover on element <table>', async function (table) {
  for (let row of table.rows)
    await hover($(row.cells[1]));
});

step('Drag <source> and drop to <destination>', async function (source, destination) {
  throw new Error('replace');
  await dragAndDrop($(source), $(destination));
});

step('Drag <source> and drop at <directionTable>', async function (source, directionTable) {
  throw new Error('replace');
  const direction = {};
  directionTable.rows.forEach(row => {
    direction[row.cells[0]] = parseInt(row.cells[1]);
  });
  await dragAndDrop($(source), direction);
});

step('Assert url host is <hostName>', async function (hostName) {
  const url = await currentURL();
  assert.equal(new URL(url).hostname, hostName);
});

step('Assert page navigated back <hostname>', async function (hostName) {
  const url = await currentURL();
  assert.equal(new URL(url).hostname, hostName);
});

step('Assert page navigated to <target>', async function (target) {
  const url = await currentURL();
  assert.equal(new URL(url).pathname, target);
});

step('Tap on <arg0>', async function (arg0) {
  throw new Error('replace');
  await tap(arg0);
});

step('Wait for <ms>', async function (ms) {
  await waitFor(ms);
});

step('Assert tap on screen', async function () {
  // eslint-disable-next-line no-undef
  throw new Error('replace');
  const touch = await evaluate(() => getResult());
  assert.deepEqual(touch, ['Touchstart: 0', 'Touchend: 0']);
});

step('clear <table>', async function (table) {
  for (let row of table.rows)
    await clear($(row.cells[1]));
});

step('set cookie with <key> and <value>', async function (key, value) {
  await setCookie(key, value, { url: 'http://localhost:3001/' });
});

step('delete cookie with <key>', async function (key) {
  await deleteCookies(key, { url: 'http://localhost:3001/' });
});
