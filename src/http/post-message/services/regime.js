const data = require('@begin/data');

class RegimeService {
  constructor(babyId) {
    this.babyId = babyId;
    this.tableName = `regime.${babyId}.${new Date().toISOString().split('T')[0]}`;
    this.events = null;
  }

  async createEvent(type, payload = null) {
    const event = await data.create({
      ...payload,
      tableName: this.tableName,
      type,
      at: new Date().toISOString().split('T')[1],
    });

    if (this.events) {
      this.events.push(event);
    }

    return event;
  }

  async getStatusAt(time) {
    const events = this.events || await data.get({ tableName: this.tableName });
    let latestEvent = events[events.length - 1];

    if (latestEvent.at === time) {
      latestEvent = events[events.length - 2];
    }

    if (!latestEvent) {
      return null;
    }

    return {
      lastType: latestEvent.type,
      duration: humanizeTime(timeToSeconds(time) - timeToSeconds(latestEvent.at)),
    };
  }

  async getCurrentStatus() {
    const now = new Date().toISOString().split('T')[1];
    return this.getStatusAt(now);
  }
}

const TIME_CHUNKS_IN_SECONDS = [60 * 60, 60, 1];
function timeToSeconds(rawTime) {
  const dotIndex = rawTime.indexOf('.');
  const time = dotIndex === -1 ? rawTime : rawTime.slice(0, dotIndex);

  return time.split(':')
    .reduce((seconds, chunk, index) => seconds + Number(chunk) * TIME_CHUNKS_IN_SECONDS[index], 0);
}

function humanizeTime(duration) {
  const time = [
    Math.floor(duration / 3600),
    parseInt((duration / 60) % 60, 10),
    parseInt(duration % 60, 10),
  ];

  time.forEach((part, index) => {
    time[index] = part < 10 ? `0${part}` : part;
  });

  return time.join(':');
}

module.exports = RegimeService;
