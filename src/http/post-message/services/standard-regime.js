const PARSING_SCHEMA = {
  age: parseMonth,
  wakingTime: parseTime,
  amountOfDayDreams: parseNumber,
  dayDreamTime: parseTime,
  totalDayDreamTime: parseTime,
  nightDreamTime: parseTime,
  totalDreamTime: parseTime,
};

module.exports = parseTable(PARSING_SCHEMA, `
  age       | wakingTime     | amountOfDayDreams | dayDreamTime | totalDayDreamTime | nightDreamTime | totalDreamTime
  0m        |  20-50min      | 4-8               | 15min-4h     | 6-10h             | 8-10h          | 16-20h
  1-2m      |  50-1:20h      | 4-5               | 30min-2h     | 6-8h              | 10-12h         | 14-17h
  3m        |  1:20h-1:40h   | 3-4               | 30min-2h     | 5-6h              | 10-12h         | 14-17h
  4m        |  1:30h-2h      | 3-4               | 30min-2h     | 4-5h              | 10-12h         | 14-16h
  5-6m      |  1:45h-2:15h   | 3                 | 30min-2h     | 3-4h              | 10-12h         | 14-16h
  6-7m      |  2:30h-3h      | 2-3               | 1-2h         | 3-4h              | 10-12h         | 13-15h
  8-10m     |  3h-3:45h      | 2                 | 1-2h         | 2-3h              | 11-12h         | 13-15h
  10-12m    |  3:30h-4:30h   | 1-2               | 1-2h         | 2-3h              | 11-12h         | 13-14h
  12-18m    |  4h-5:30h      | 1-2               | 1-2h         | 1.5-3h            | 11-12h         | 12:30-13h
  2y        |  4-6h          | 1                 | 1-2h         | 1-2h              | 11-12h         | 12-13h
  3y        |  5-6h          | 1                 | 1-2h         | 1-2h              | 10-11h         | 12h
`);

function parseTable(schema, table) {
  const [heading, ...rows] = table.trim().split('\n');
  const keys = splitRow(heading);

  return rows.map((row) => {
    const values = splitRow(row);
    return keys.reduce((object, key, index) => {
      const parseValue = schema[key] || identity;
      object[key] = parseValue(values[index]);
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

  return values.map((value) => {
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
