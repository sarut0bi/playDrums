'use strict';

const {
  click,
  mouseAction,
  $,
} = require('../lib/playdrums');

step('Click link <userlink> below <table>', async function (userlink, table) {
  for (const element of table) {
    await click($(userlink));
  }
});

step('Click text <text>', async function (text) {
  await click($('text='+text));
});

step('Click <selector>', async function (selector) {
  await click($(selector));
});

step('Click link above <table>', async function (table) {
  throw new Error('to replace');
});

step('Click button to right of <table>', async function (table) {
  throw new Error('to replace');
});

step('Right click <table>', async function (table) {
  for (let row of table.rows)
    await click($(row.cells[1]), { button: 'right' });
});

step('Double click <table>', async function (table) {
  for (let row of table.rows)
    await click($(row.cells[1]), { clickCount: 2 });
});

step('Press & Release To Element with element1 and <X>,<Y> co-ordinates', async function (X, Y) {
  await mouseAction($('#button1'), 'press', {
    x: parseInt(X),
    y: parseInt(Y),
  });
  await mouseAction($('#button1'), 'release', {
    x: parseInt(X),
    y: parseInt(Y),
  });
});

step('Press & Release To Element with element2 and <X>,<Y> co-ordinates', async function (X, Y) {
  await mouseAction($('#button4'), 'press', {
    x: parseInt(X),
    y: parseInt(Y),
  });
  await mouseAction($('#button4'), 'release', {
    x: parseInt(X),
    y: parseInt(Y),
  });
});

step('Press & Release To Element with <X>,<Y> co-ordinates', async function (X, Y) {
  await mouseAction('press', {
    x: parseInt(X),
    y: parseInt(Y),
  });
  await mouseAction('release', {
    x: parseInt(X),
    y: parseInt(Y),
  });
});
