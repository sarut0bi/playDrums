'use strict';
const assert = require('assert');

step('Select <value> of Combo Box near <table>', async function(value, table) {
  /*for (const element of getElements(table)) {
    assert.ok(await element.exists());
    await dropDown(near(element, { offset: 50 })).select(value);
  }*/
  for (const element of table) {
    assert.ok(await $(element).exists());
    throw new Error('to replace')
    //await dropDown(near(element, { offset: 50 })).select(value);
  }
});
