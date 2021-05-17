const getStandardRegimeAt = require('../services/standardRegime');

async function exec(ctx) {
  ctx.replyWithHTML(
    `<b>Name:</b> ${ctx.baby.name}\n${
      renderAge(ctx.baby)}\n\n${
      renderStandardRegime(ctx.baby.ageInMonths())}`,
  );
}

function renderAge(baby) {
  const years = baby.ageInYears();

  if (years < 1) {
    return `<b>Days</b>: ${baby.ageInDays()}`;
  }

  return `<b>Years</b>: ${years}`;
}

function renderStandardRegime(ageInMonth) {
  const regime = getStandardRegimeAt(ageInMonth);

  if (!regime) {
    return `No regime items found for baby's age: ${ageInMonth} month`;
  }

  return `<b>Standard regime for ${regime.age.raw}</b>:\n`
    + `Waking time: ${regime.wakingTime.raw}\n`
    + `1 dream time during day: ${regime.dayDreamTime.raw}\n`
    + `total dream time during day: ${regime.totalDayDreamTime.raw}\n`
    + `Night dream time: ${regime.nightDreamTime.raw}\n`;
}

module.exports = {
  name: 'baby',
  description: 'Information about baby',
  exec,
};
