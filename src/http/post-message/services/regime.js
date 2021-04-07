const { nanoid } = require('nanoid');
const {
  db, marshall, unmarshall, tableName,
} = require('./db');
const Result = require('./result');
const { formatTime, calcDuration, shiftDate } = require('./date');
const partiql = require('./partiql');

const cache = new Map();
const TableName = tableName('babysitter_regime');

class RegimeService {
  static for(baby, range) {
    const key = `${baby.id}-${range.start.getTime()}-${range.end.getTime()}`;

    if (!cache.has(key)) {
      const service = new RegimeService(baby.babyId || baby.id, range);
      cache.set(key, service);
      return service;
    }

    return cache.get(key);
  }

  constructor(babyId, dateRange) {
    this.babyId = babyId;
    this.dateRange = dateRange;
    this.events = null;
  }

  async createEvent(type, payload = null) {
    const event = {
      id: nanoid(3),
      at: Date.now(),
      ...payload,
      type,
      babyId: this.babyId,
    };

    await db.putItem({
      TableName,
      Key: marshall({
        babyId: this.babyId,
        at: event.at,
      }),
      Item: marshall(event),
    });

    if (this.events) {
      this.events.push(event);
    }

    return event;
  }

  async getEventById(eventId) {
    const events = await this.getEvents();
    const eventToUpdateIdx = events.findIndex((event) => event.id === eventId);

    return eventToUpdateIdx === -1 ? null : events[eventToUpdateIdx];
  }

  async setEventTime(eventId, newDate) {
    const events = await this.getEvents();
    const eventToUpdateIdx = events.findIndex((event) => event.id === eventId);

    if (eventToUpdateIdx === -1) {
      return Result.error('Trying to update time of event that was created not today');
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
    const changedEvent = {
      ...eventToUpdate,
      at: newTimestamp,
      babyId: this.babyId,
    };
    const queries = [
      partiql`
        DELETE FROM "${partiql.raw(TableName)}"
        WHERE "babyId" = ${this.babyId}
          AND "at" = ${eventToUpdate.at}
          AND "id" = ${eventToUpdate.id}
      `,
      partiql`
        INSERT INTO "${partiql.raw(TableName)}" VALUE ${changedEvent}
      `,
    ];
    await db.executeTransaction({ TransactStatements: queries });
    eventToUpdate.at = newTimestamp;

    return Result.value(eventToUpdate);
  }

  async getEvents() {
    if (!this.events) {
      this.events = await this.getEventsFor(this.dateRange);
    }
    return this.events;
  }

  async getEventsFor(dateRange, options = {}) {
    const start = dateRange.start || new Date(1970);
    const end = dateRange.end || new Date();
    const response = await db.query({
      TableName,
      ProjectionExpression: 'id, #eventType, #createdAt',
      KeyConditionExpression: 'babyId = :babyId AND #createdAt BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#createdAt': 'at',
        '#eventType': 'type',
      },
      ExpressionAttributeValues: marshall({
        ':babyId': this.babyId,
        ':start': start.getTime(),
        ':end': end.getTime(),
      }),
      ScanIndexForward: 'ascending' in options ? options.ascending : true,
      Limit: options.limit,
    });

    return response.Items
      ? response.Items.map(unmarshall)
      : [];
  }

  async getLastYesterdayEvent() {
    const events = await this.getEventsFor({
      start: shiftDate(this.dateRange.start, -1),
      end: this.dateRange.start,
    }, {
      ascending: false,
      limit: 1,
    });
    return events[0];
  }

  async getStatus() {
    const events = await this.getEvents();
    const lastEvent = events[events.length - 1]
      || await this.getLastYesterdayEvent();

    if (!lastEvent) {
      return null;
    }

    return {
      summary: calcSummary(events),
      lastEvent: {
        ...lastEvent,
        duration: calcDuration(Date.now(), lastEvent.at),
      },
    };
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

  async cancelEvent(eventId) {
    const eventToRemove = await this.getEventById(eventId);

    if (!eventToRemove) {
      return Result.error('Trying to cancel event that was created not during this day.');
    }

    await db.executeStatement(partiql`
      DELETE FROM "${partiql.raw(TableName)}"
      WHERE "babyId" = ${this.babyId}
        AND "at" = ${eventToRemove.at}
        AND "id" = ${eventToRemove.id}
    `);
    this.events = this.events.filter((event) => event !== eventToRemove);

    return Result.value(eventToRemove);
  }
}

function calcSummary(events) {
  const summary = {
    totals: { amount: 0, duration: 0 },
  };

  events.forEach((event, index) => {
    const startDate = index + 1 < events.length
      ? events[index + 1].at
      : Date.now();
    const eventDuration = calcDuration(startDate, event.at);

    summary[event.type] = summary[event.type] || {
      amount: 0,
      duration: 0,
    };
    summary[event.type].amount++;
    summary[event.type].duration += eventDuration;
    summary.totals.duration += eventDuration;
    summary.totals.amount++;
  });

  return summary;
}

module.exports = RegimeService;
