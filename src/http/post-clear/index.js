const data = require('@begin/data');
const arc = require('@architect/functions');

exports.handler = async (req) => {
  const body = arc.http.helpers.bodyParser(req);

  if (body.letmedo$ !== process.env.TL_CLEAR_PWD) {
    return {
      statusCode: 200,
    };
  }

  await clear('regime');
  await clear('babies');

  return {
    statusCode: 200,
  };
};

async function clear(table) {
  const items = await data.get({ table });
  const keys = items.map((item) => ({
    table: item.table,
    key: item.key,
  }));

  await data.destroy(keys);
}
