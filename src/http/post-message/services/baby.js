const {
  db, marshall, unmarshall, tableName,
} = require('./db');

const babies = new Map();
const TableName = tableName('babysitter_baby');
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

class Baby {
  constructor(props) {
    Object.assign(this, props);
  }

  ageInYears() {
    const birthDate = new Date(this.birthDate);
    const now = new Date();
    const year = now.getFullYear() - birthDate.getFullYear();
    const month = now.getMonth() - birthDate.getMonth();

    if (month < 0 || month === 0 && now.getDate() < birthDate.getDate()) {
      return year - 1;
    }

    return year;
  }

  ageInDays() {
    return Math.floor(this.ageInMs() / ONE_DAY_IN_MS);
  }

  ageInMonths() {
    const ONE_MONTH = 30 * ONE_DAY_IN_MS;
    return Math.round(this.ageInMs() / ONE_MONTH);
  }

  ageInMs() {
    return new Date().setHours(0, 0, 0, 0) - new Date(this.birthDate).getTime();
  }
}

async function get(id) {
  let baby = babies.get(id);

  if (!baby) {
    const response = await db.getItem({
      TableName,
      Key: marshall({ id }),
    });
    const props = response.Item ? unmarshall(response.Item) : null;
    baby = new Baby(props);
    babies.set(id, baby);
  }

  return baby;
}

async function create(baby) {
  await db.putItem({
    TableName,
    Item: marshall(baby),
  });
  babies.set(baby.id, baby);
}

module.exports = {
  get,
  create,
};
