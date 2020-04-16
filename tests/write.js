const { write, clear, near, textBox, into, toLeftOf, $ } = require('../lib/playdrums');

step('Write <text>', async function(text) {
  await write(text);
});

step('Clear element <cssSelector>', async function(cssSelector) {
  await clear($(cssSelector));
});

step('Write <text> into Input Field near <table>', async function(text, table) {
  throw new Error('Write <text> into  <tableSelector>');
  for (const element of table) {
    await write(text, $(element));
  }
});

step('Write <text> into <tableSelector>', async function(text, table) {
  for(let row of table.rows)
    await write(text, $(row.cells[1]));

});