const { marshall } = require('./db');

function partiql(strings, ...values) {
  return strings.reduce((result, chunk, index) => {
    result.Statement += chunk;

    if (index < values.length) {
      const { placeholder, params } = unwrapInput(values[index]);
      const serializedParams = params ? params.map((p) => marshall({ p }).p) : [];
      result.Statement += placeholder;
      result.Parameters.push(...serializedParams);
    }

    return result;
  }, {
    Statement: '',
    Parameters: [],
  });
}

function unwrapInput(value) {
  if (value && value.type === TYPE_RAW) {
    return { placeholder: value.value };
  }

  if (value && value.constructor === Object) {
    const params = [];
    const placeholder = JSON.stringify(value, (_, item) => {
      if (item && typeof item === 'object') {
        return item;
      }

      params.push(item);
      return '?';
    })
      .replace(/"\?"/g, '?')
      .replace(/"/g, '\'');
    return { placeholder, params };
  }

  return { placeholder: '?', params: [value] };
}

const TYPE_RAW = {};
partiql.raw = (value) => ({ type: TYPE_RAW, value });

module.exports = partiql;
