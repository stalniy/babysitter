const data = require('./persistance');
const Result = require('./result');
const { formatTime, calcDuration, shiftDate } = require('./date');

const cache = new Map();

class RegimeService {
  static for(babyId, dateTime = null) {
    const now = dateTime || new Date();
    const tableName = computeTableName(babyId, now);

    if (!cache.has(tableName)) {
      const service = new RegimeService(babyId, now);
      cache.set(tableName, service);
      return service;
    }

    return cache.get(tableName);
  }

  constructor(babyId, dateTime) {
    this.babyId = babyId;
    this.tableName = `regime.${babyId}.${dateTime.toISOString().split('T')[0]}`;
    this.events = null;
  }

  forDate(dateTime) {
    return RegimeService.for(this.babyId, dateTime);
  }

  async createEvent(type, payload = null) {
    const event = await data.set({
      at: new Date().toISOString(),
      ...payload,
      table: this.tableName,
      type,
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
    if (!this.events) {
      const events = await data.get({ table: this.tableName });
      this.events = events
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    }
    return this.events;
  }

  async getLastEvent() {
    const events = await this.getEvents();
    return events[events.length - 1];
  }

  async getStatusAt(dateTime) {
    const events = await this.getEvents();
    const lastEvent = events[events.length - 1]
      || await this.forDate(shiftDate(dateTime, -1)).getLastEvent();

    if (!lastEvent) {
      return null;
    }

    return {
      amountOfDreams: events.filter((event) => event.type === 'fallAsleep').length,
      lastEvent,
      duration: calcDuration(dateTime, lastEvent.at),
    };
  }

  async getCurrentStatus() {
    return this.getStatusAt(new Date().toISOString());
  }
}

function computeTableName(babyId, dateTime) {
  const isoDate = dateTime.toISOString();
  return `regime.${babyId}.${isoDate.slice(0, isoDate.indexOf('T'))}`;
}

module.exports = RegimeService;
