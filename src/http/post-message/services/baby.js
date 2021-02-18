const { db, marshall, unmarshall } = require('./db');

const babies = new Map();

async function get(id) {
  let baby = babies.get(id);

  if (!baby) {
    const response = await db.getItem({
      TableName: 'babysitter_baby',
      Key: marshall({ id }),
    });
    baby = response.Item ? unmarshall(response.Item) : null;
    babies.set(id, baby);
  }

  return baby;
}

async function create(baby) {
  await db.putItem({
    TableName: 'babysitter_baby',
    Item: marshall(baby),
  });
  babies.set(baby.id, baby);
}

module.exports = {
  get,
  create,
};
