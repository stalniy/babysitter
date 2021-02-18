const { nanoid } = require('nanoid');
const {
  db, marshall, unmarshall, tableName,
} = require('./db');
const Result = require('./result');
const { formatTime, calcDuration, shiftDate } = require('./date');

const cache = new Map();
const TableName = tableName('babysitter_regime');

class RegimeService {
  static for(babyId, dateTime = null) {
    const now = dateTime || new Date();
    const key = computeKey(babyId, now);
    const id = `${key.babyId}.${key.date}`;

    if (!cache.has(id)) {
      const service = new RegimeService(key);
      cache.set(id, service);
      return service;
    }

    return cache.get(id);
  }

  constructor(key) {
    this.babyId = key.babyId;
    this.key = key;
    this.serializedKey = marshall(key);
    this.events = null;
  }

  forDate(dateTime) {
    return RegimeService.for(this.babyId, dateTime);
  }

  async createEvent(type, payload = null) {
    const event = {
      id: nanoid(3),
      at: Date.now(),
      ...payload,
      type,
    };
    await db.updateItem({
      TableName,
      Key: this.serializedKey,
      UpdateExpression: 'SET #ei = list_append(if_not_exists(#ei, :empty), :ei)',
      ExpressionAttributeNames: {
        '#ei': 'events',
      },
      ExpressionAttributeValues: marshall({
        ':ei': [event],
        ':empty': [],
      }),
    });

    if (this.events) {
      this.events.push(event);
    }

    return event;
  }

  async setEventTime(eventId, newDate) {
    const events = await this.getEvents();
    const eventToUpdateIdx = events.findIndex((event) => event.id === eventId);

    if (eventToUpdateIdx === -1) {
      return Result.error(`Trying to update time of unknown event with id ${eventId}`);
    }

    const newTimestamp = newDate.getTime();
    const prevEvent = events[eventToUpdateIdx - 1];
    const isInvalidDate = newTimestamp > Date.now()
      || prevEvent && newTimestamp < new Date(prevEvent.at).getTime();
    if (isInvalidDate) {
      const now = formatTime(Date.now());
      const message = prevEvent
        ? `New time should be in range between ${now} and ${formatTime(prevEvent.at)}`
        : `New time should not be greater than ${now}`;
      return Result.error(message);
    }

    const eventToUpdate = events[eventToUpdateIdx];
    await db.updateItem({
      TableName,
      Key: this.serializedKey,
      UpdateExpression: `SET #ei[${eventToUpdateIdx}].#at = :newTime`,
      ConditionExpression: `#ei[${eventToUpdateIdx}].id = :id`,
      ExpressionAttributeNames: {
        '#ei': 'events',
        '#at': 'at',
      },
      ExpressionAttributeValues: marshall({
        ':newTime': newTimestamp,
        ':id': eventId,
      }),
    });
    eventToUpdate.at = newTimestamp;

    return Result.value(eventToUpdate);
  }

  async getEvents() {
    if (!this.events) {
      const response = await db.getItem({
        TableName,
        Key: this.serializedKey,
      });
      this.events = response.Item
        ? unmarshall(response.Item).events
        : [];
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
    return this.getStatusAt(Date.now());
  }

  async getEventsStats() {
    const events = await this.getEvents();

    return events.map((event, index) => {
      const startDate = index + 1 < events.length
        ? events[index + 1].at
        : Date.now();
      return {
        ...event,
        duration: calcDuration(startDate, event.at),
      };
    });
  }
}

function computeKey(babyId, dateTime) {
  const isoDate = dateTime.toISOString();
  return {
    babyId,
    date: isoDate.slice(0, isoDate.indexOf('T')),
  };
}

module.exports = RegimeService;
