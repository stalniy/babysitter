const data = require('@begin/data');

class RegimeService {
  constructor(babyId) {
    this.babyId = babyId;
    this.tableName = `regime.${babyId}.${new Date().toISOString().split('T')[0]}`;
    this.events = null;
  }

  async createEvent(type, payload = null) {
    const event = await data.set({
      ...payload,
      tableName: this.tableName,
      type,
      at: new Date().toISOString(),
    });

    if (this.events) {
      this.events.push(event);
    }

    return event;
  }

  async setEventTime(eventId, time) {
    const events = await this.getEvents();
    const eventToUpdate = events.find((event) => event.key === eventId);

    if (!eventToUpdate) {
      throw new ReferenceError(`Trying to update time of unknown event with id ${eventId}`);
    }

    // TODO: timezone!
    const date = new Date(eventToUpdate.at);
    const chunks = time.split(':').map((v) => Number(v));
    date.setHours(...chunks);

    console.log('timezone offset = ', date.getTimezoneOffset());

    eventToUpdate.at = date.toISOString();
    await data.set({
      ...eventToUpdate,
      table: this.tableName,
      key: eventId,
    });
  }

  async getEvents() {
    this.events = this.events || await data.get({ table: this.tableName });
    return this.events;
  }

  async getStatusAt(dateTime) {
    const events = await this.getEvents();
    let lastEvent = events[events.length - 1];

    if (lastEvent && lastEvent.at === dateTime) {
      lastEvent = events[events.length - 2];
    }

    if (!lastEvent) {
      return null;
    }

    return {
      amountOfDreams: events.filter((event) => event.type === 'fallAsleep').length,
      eventsAmount: events.length,
      lastEvent,
      duration: humanizeTime((new Date(dateTime) - new Date(lastEvent.at)) / 1000),
    };
  }

  async getCurrentStatus() {
    return this.getStatusAt(new Date().toISOString());
  }
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
