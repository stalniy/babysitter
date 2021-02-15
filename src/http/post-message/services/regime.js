const formatRelative = require('date-fns/formatDistance');
const data = require('./persistance');
const Result = require('./result');
const { formatTime } = require('./date');

class RegimeService {
  constructor(babyId) {
    this.babyId = babyId;
    this.tableName = `regime.${babyId}.${new Date().toISOString().split('T')[0]}`;
    this.events = null;
  }

  async createEvent(type, payload = null) {
    const event = await data.set({
      ...payload,
      table: this.tableName,
      type,
      at: new Date().toISOString(),
    });

    if (this.events) {
      this.events.push(event);
    }

    return event;
  }

  async setEventTime(eventId, newDate) {
    const events = await this.getEvents();
    const eventToUpdateIdx = events.findIndex((event) => event.key === eventId);

    if (eventToUpdateIdx === -1) {
      return Result.error(`Trying to update time of unknown event with id ${eventId}`);
    }

    const prevEvent = events[eventToUpdateIdx - 1];
    const isInvalidDate = newDate.getTime() > Date.now()
      || prevEvent && newDate.getTime() < new Date(prevEvent.at).getTime();
    if (isInvalidDate) {
      const now = formatTime(Date.now());
      const message = prevEvent
        ? `New time should be in range between ${now} and ${formatTime(prevEvent.at)}`
        : `New time should not be greater than ${now}`;
      return Result.error(message);
    }

    const eventToUpdate = events[eventToUpdateIdx];
    const newIsoDate = newDate.toISOString();
    await data.set({
      ...eventToUpdate,
      at: newIsoDate,
      table: this.tableName,
      key: eventId,
    });
    eventToUpdate.at = newIsoDate;

    return Result.value();
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
      duration: calcDuration(dateTime, lastEvent.at),
    };
  }

  async getCurrentStatus() {
    return this.getStatusAt(new Date().toISOString());
  }
}

function calcDuration(date, anotherDate) {
  const end = new Date(date);
  const start = new Date(anotherDate);

  if (end.getTime() < start.getTime()) {
    return 'invalid';
  }

  return formatRelative(end, start);
}

module.exports = RegimeService;
