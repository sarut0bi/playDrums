/* global date */

const assert = require('assert');

const { title, text, $, evaluate, waitFor } = require('../lib/playdrums');

step('Assert title to be <userTitle>', async function(userTitle) {
  assert.ok((await title()).includes(userTitle));
});

step('Assert Exists <table>', async function(table) {
  for(let row of table.rows)
    assert.ok(await $(row.cells[1]).exists());
});

step('assert text should be empty into <table>', async function(table) {
  for(let row of table.rows)
    assert.equal(await $(row.cells[1]).text(),'');
});

step('Assert text <content> exists on the page.', async function(content) {
  assert.ok(await waitFor($('text="'+content+'"')));
});

step('Assert <content> exists on the page.', async function(content) {
  assert.ok(await waitFor($(content)));
});

step('Assert text <content> does not exist', async function(content) {
  assert.equal(await $(content).exists(),false);
});

step('Assert text <expectedText> exists on the textArea. <table>', async function(
  expectedText,
  table,
) {
  if(!expectedText)
    expectedText = "";
  for (let row of table.rows)
  {
    var actualText = await $(row.cells[1]).text();
    assert.equal(actualText, expectedText);
  }
});

step('Assert page has set timezome', async function() {
  const getTime = await evaluate(() => {
    return date.toString();
  });
  assert.equal(getTime, 'Sat Nov 19 2016 13:12:34 GMT-0500 (Eastern Standard Time)');
});
