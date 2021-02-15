const data = require('@begin/data');

const babies = new Map();

async function get(id) {
  let baby = babies.get(id);

  if (!baby) {
    baby = await data.get({
      table: 'babies',
      key: id,
    });
    babies.set(id, baby);
  }

  return baby;
}

async function create(payload) {
  await data.set({
    table: 'babies',
    ...payload,
  });
}

module.exports = {
  get,
  create,
};
