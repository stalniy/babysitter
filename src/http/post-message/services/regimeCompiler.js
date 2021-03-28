function parseTable(schema, table) {
  const [heading, ...rows] = table.trim().split('\n');
  const keys = splitRow(heading);

  return rows.map((row) => {
    const values = splitRow(row);
    return keys.reduce((object, key, index) => {
      const parseValue = schema[key] || identity;
      const rawValue = values[index];
      object[key] = { value: parseValue(rawValue), raw: rawValue };
      return object;
    }, {});
  });
}

function splitRow(row) {
  return row.trim().split(/\s*\|\s*/);
}

function identity(x) {
  return x;
}

function parse(parserName, text, unitProcessors) {
  const values = text.split(/\s*-\s*/)
    .filter(Boolean);
  const possibleUnits = Object.keys(unitProcessors);
  const exprUnit = getUnit(text, possibleUnits);
  const parsedValues = values.map((value) => {
    const valueUnit = getUnit(value, possibleUnits);
    const unitToUse = valueUnit || exprUnit;

    if (unitToUse in unitProcessors) {
      const v = valueUnit ? value.slice(0, -valueUnit.length) : value;
      return unitProcessors[unitToUse](v);
    }

    if (unitProcessors.byDefault) {
      return unitProcessors.byDefault(value);
    }

    throw new Error(`${parserName} cannot parse value of ${value}`);
  });

  if (parsedValues.length === 1) {
    parsedValues.push(parsedValues[0]);
  }

  return parsedValues;
}

function parseMonth(text) {
  return parse('parseMonth', text, {
    m: Number,
    y: (value) => Number(value) * 365,
  });
}

function parseTime(text) {
  return parse('parseTime', text, {
    min: Number,
    h(value) {
      const chunks = value.split(':');
      const hour = Number(chunks[0]);
      const minutes = chunks[1] ? Number(chunks[1]) : 0;

      return (60 * hour + minutes) * 60 * 1000;
    },
  });
}

function parseNumber(text) {
  return parse('parseNumber', text, {
    byDefault: Number,
  });
}

function getUnit(value, possibleUnits) {
  return possibleUnits.find((u) => value.endsWith(u));
}

const PARSING_SCHEMA = {
  age: parseMonth,
  wakingTime: parseTime,
  amountOfDayDreams: parseNumber,
  dayDreamTime: parseTime,
  totalDayDreamTime: parseTime,
  nightDreamTime: parseTime,
  totalDreamTime: parseTime,
};

module.exports = {
  compile(regime) {
    const items = parseTable(PARSING_SCHEMA, regime);

    return (ageInMonth) => {
      return items.find(item => item.age.value[0] <= ageInMonth && ageInMonth <= item.age.value[1]);
    };
  }
}
