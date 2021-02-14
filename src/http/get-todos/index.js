const data = require('@begin/data');

exports.handler = async function todos() {
  const pages = await data.get({
    table: 'todos',
    limit: 25,
  });

  const items = [];
  for await (const todo of pages) {
    items.push(todo);
  }
  // Return oldest todo first
  items.sort((a, b) => a.created > b.created);

  return {
    statusCode: 201,
    headers: {
      'content-type': 'application/json; charset=utf8',
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: JSON.stringify({
      todos: items,
    }),
  };
};
