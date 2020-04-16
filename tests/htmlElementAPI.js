'use strict';
const assert = require('assert');
var _path = require('path');
const {
  goto,
  $,
  fileField,
  textBox,
  button,
  dropDown,
  checkBox,
  radioButton,
  alert,
  click,
  write,
  attach,
  focus,
  scrollTo,
  scrollRight,
  scrollLeft,
  scrollUp,
  scrollDown,
  to,
  waitFor,
  dismiss,
  accept,
  intercept,
  toRightOf,
  clearIntercept,
} = require('../lib/playdrums');

step('Navigate to <url>', async url => {
  await goto(url);
});

step('Ensure Drop down <dropDownSelector> exists', async dropDownSelector => {
  const box = $(dropDownSelector);
  assert.ok(await box.exists());
});

step(
  'Select <value> of Drop down <dropDownSelector>. The value now should be <fieldValue>',
  async (value, dropDownSelector, fieldValue) => {
    await waitFor(1000);
    const box = $(dropDownSelector);
    await box.select(value);
    assert.equal(await box.value(), fieldValue);
  },
);

step('Ensure Check Box <checkBoxSelector> exists', async checkBoxSelector => {
  const box = $(checkBoxSelector);
  assert.ok(await box.exists());
});
step('Check the value of Check Box <checkBoxSelector>', async checkBoxSelector => {
  const box = $(checkBoxSelector);
  await box.check();
  assert.ok(await box.isChecked());
});

step('Radio Button <label>', async label => {
  const button = $(label);
  assert.ok(await button.exists());
  await click(button);
  assert.ok(await button.isChecked());
});

step('Attach file <fileName> to file field <FileFieldName>', async (fileName, FileFieldName) => {
  const field = $(FileFieldName);
  await attach(fileName, field);
  fileName = fileName.substring(fileName.lastIndexOf('/')+1);
  assert.ok((await field.value()).endsWith(fileName));
});

step('Get value <text> of Text Box <textBoxName>', async (text, textBoxName) => {
  const field = $(textBoxName);
  assert.equal(await field.value(), text);
});

step('An existing Text Box <textBoxName> value should give exists true', async textBoxName => {
  const field = $(textBoxName);
  assert.ok(await field.exists());
});

step('Write <text> into Text Box <textBoxSelector>', async (text, textBoxSelector) => {
  await write(text, $(textBoxSelector));
});

step('Write <text> into TextBox with name <textboxName>', async function(text, textBoxName) {
  await write(text, $('//*[@name="'+textBoxName+'"]'));
});

step('Write <text> to Text Box <textBoxName>', async (text, textBoxName) => {
  throw new Error('replace with Write <text> into Text Box <textBoxSelector>')
});

step('Focus on Text Box <textBoxSelector>', async textBoxSelector => {
  await focus($(textBoxSelector));
});

step('Scroll the page right by pixels <pixels>', { continueOnFailure: true }, async pixels => {
  await scrollRight(parseInt(pixels, 10));
  throw new Error('to be removed')
});

step(
  'Scroll element <element> right by pixels <pixels>',
  { continueOnFailure: true },
  async (element, pixels) => {
    throw new Error('to be removed')
    await scrollRight($(element), parseInt(pixels, 10));
  },
);

step('Scroll the page left', { continueOnFailure: true }, async () => {
  throw new Error('to be removed')
  await scrollLeft();
});

step(
  'Wait for Accept message <message> on click of button <buttonName>',
  async (message, buttonName) => {
    alert(message, async () => await accept());

    await click(button(buttonName));
  },
);

step(
  'Wait for dismiss message <message> on click of button <buttonName>',
  async (message, buttonName) => {
    alert(message, async () => await dismiss());

    await click(button(buttonName));
  },
);

step('Respond to <url> with <responseBody>', async function(url, responseBody) {
  await intercept(url, { body: responseBody });
});

step('Respond to regexp <url> with json <jsonString>', async function(url, jsonString) {
  url = new RegExp(url);
  await intercept(url, { body: JSON.parse(jsonString) });
});
step('Respond to <url> with json <jsonString>', async function(url, jsonString) {
  await intercept(url, { body: JSON.parse(jsonString) });
});

step('Navigate to relative path <relativePath>', async function(relativePath) {
  var absolutePath = _path.resolve(relativePath);
  await goto('file:///' + absolutePath);
});

step('Scroll to element <arg0>', async function(arg0) {
  await scrollTo($(arg0));
});

step('Scroll the page left by pixels <pixels>', { continueOnFailure: true }, async pixels => {
  await scrollLeft(parseInt(pixels, 10));
  throw new Error('to be removed')
});

step(
  'Scroll element <element> left by pixels <pixels>',
  { continueOnFailure: true },
  async function(element, pixels) {
    throw new Error('to be removed')
    await scrollLeft($(element), parseInt(pixels, 10));
  },
  
);

step('Scroll the page right', { continueOnFailure: true }, async () => {
  throw new Error('to be removed')
  await scrollRight();
});

step('Scroll the page up by pixels <pixels>', { continueOnFailure: true }, async pixels => {
  throw new Error('to be removed')
  await scrollUp(parseInt(pixels, 10));
});

step('Scroll element <element> up by pixels <pixels>',  async function(
  element,
  pixels,
) {
  throw new Error('to be removed')
  await scrollUp($(element), parseInt(pixels, 10));
});

step('Scroll the page up', { continueOnFailure: true }, async () => {
  throw new Error('to be removed')
  await scrollUp();
});

step('Scroll the page down by pixels <pixels>', { continueOnFailure: true }, async pixels => {
  throw new Error('to be removed')
  await scrollDown(parseInt(pixels, 10));
});

step(
  'Scroll element <element> down by pixels <pixels>',
  { continueOnFailure: true },
  async function(element, pixels) {
    throw new Error('to be removed')
    await scrollDown($(element), parseInt(pixels, 10));
  },
);

step('Scroll the page down', { continueOnFailure: true }, async () => {
  throw new Error('to be removed')
  await scrollDown();
});

step('Navigate to relative path <path> with timeout <timeout> ms', async function(path, timeout) {
  var absolutePath = _path.resolve(path);
  await goto('file:///' + absolutePath, {
    navigationTimeout: timeout,
  });
});

step('Navigate to <url> with timeout <timeout> ms', async function(url, timeout) {
  await goto(url, { navigationTimeout: timeout });
});

step('Reset intercept for <url>', function(url) {
  clearIntercept(url);
});

step('Reset all intercept', function() {
  clearIntercept();
});
