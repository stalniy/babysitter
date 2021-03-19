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
  static for(babyId, range) {
    const key = `${babyId}-${range.start.getTime()}-${range.end.getTime()}`;

    if (!cache.has(key)) {
      const service = new RegimeService(babyId, range);
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
    const queries = [
      partiql`
        DELETE FROM "${partiql.raw(TableName)}"
        WHERE "babyId" = ${this.babyId}
          AND "at" = ${eventToUpdate.at}
          AND "id" = ${eventToUpdate.id}
      `,
      partiql`
        INSERT INTO "${partiql.raw(TableName)}" VALUE ${{
  ...eventToUpdate,
  at: newTimestamp,
  babyId: this.babyId,
}}
      `,
    ];
    await db.executeTransaction({ TransactStatements: queries });
    eventToUpdate.at = newTimestamp;

    return Result.value(eventToUpdate);
  }

  async getEvents() {
    if (!this.events) {
      this.events = await this.getDayRelatedEvents();
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

  async getLastPrevDayEvents(limit) {
    return await this.getEventsFor({
      start: shiftDate(this.dateRange.start, -1),
      end: this.dateRange.start,
    }, {
      ascending: false,
      limit,
    });
  }

  async getFirstNextDayEvents(limit) {
    if (this.dateRange.end.getDate() === new Date().getDate()) {
      return [];
    }

    return await this.getEventsFor({
      start: this.dateRange.end,
      end: shiftDate(this.dateRange.end, +1),
    }, {
      limit,
    });
  }

  async getDayRelatedEvents() {
    const [prevDay, events, nextDay] = await Promise.all([
      this.getLastPrevDayEvents(1),
      this.getEventsFor(this.dateRange),
      this.getFirstNextDayEvents(1)
    ]);
    return prevDay.concat(events, nextDay);
  }

  async getStatus() {
    const events = await this.getEvents();
    const lastEvent = events[events.length - 1];

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
}

function calcSummary(events) {
  const summary = {};

  events.forEach((event, index) => {
    const startDate = index + 1 < events.length
      ? events[index + 1].at
      : Date.now();

    summary[event.type] = summary[event.type] || {
      amount: 0,
      duration: 0,
    };
    summary[event.type].amount++;
    summary[event.type].duration += calcDuration(startDate, event.at);
  });

  return summary;
}

module.exports = RegimeService;
