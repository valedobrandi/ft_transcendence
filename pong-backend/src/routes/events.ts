import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Database from 'better-sqlite3';
import db from "../database/db.js";
import { statusCode } from "../types/statusCode.js";
import { connectedRoomInstance } from "../state/ConnectedRoom.js";
import { print } from "../server.js";

type EventOnChangeDB = {
    message: 'error' | 'success';
    data: { message: string };
};

type NewEventsDB = {
    id: number;
    type: string;
    from_id: number;
    to_id: number;
    payload: string;
    timestamp: string;
}

type GetEvents = {
    message: 'error' | 'success';
    data: NewEventsDB[];
}

type InsertEventBody = {
    to_id: number;
    from_id: number;
    type: string;
    message: string;
};

function eventsRoutes(fastify: FastifyInstance) {
    const eventsControllerInstance = new EventsController();

    fastify.post('/add-event', {
        preHandler: [fastify.authenticate],
        schema: {
			body: {
				type: 'object',
				properties: {
					to_id: { type: 'number' },
					from_id: { type: 'number' },
					type: { type: 'string' },
					message: { type: 'string' }
				},
			},
            required: ['to_id', 'from_id', 'type', 'message']
        },
        handler: eventsControllerInstance.insertEvent.bind(eventsControllerInstance)
    });

    fastify.get('/to-events', {
        preHandler: [fastify.authenticate],
        schema: {},
        handler: eventsControllerInstance.getToEvents.bind(eventsControllerInstance)
    });

    fastify.get('/from-events', {
        preHandler: [fastify.authenticate],
        schema: {},
        handler: eventsControllerInstance.getFromEvents.bind(eventsControllerInstance)
    });

    fastify.delete('/delete-event', {
        preHandler: [fastify.authenticate],
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    eventId: { type: 'number' }
                },
            },
            required: ['eventId']
        },
        handler: eventsControllerInstance.deleteEvent.bind(eventsControllerInstance)
    });
}

class EventsController {
    private eventsServiceInstance = new EventsService();

    insertEvent(req: FastifyRequest<{ Body: InsertEventBody }>, res: FastifyReply) {
        const { to_id, from_id, type, message: msg } = req.body;
        const { message, data } = this.eventsServiceInstance.insertEvent(to_id, from_id, type, msg);
        // Try to send notification

        return res.status(statusCode('OK')).send({ message, data })
    }

    getToEvents(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { message, data } = this.eventsServiceInstance.getToEvents(id);
        return res.status(statusCode('OK')).send({ message, data });
    }

    getFromEvents(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { message, data } = this.eventsServiceInstance.getFromEvents(id);
        return res.status(statusCode('OK')).send({ message, data });
    }

    deleteEvent(req: FastifyRequest<{ Querystring: { eventId: number } }>, res: FastifyReply) {
        const eventId = Number(req.query.eventId);
        const { message, data } = this.eventsServiceInstance.deleteEvent(eventId);
        return res.status(statusCode('OK')).send({ message, data });
    }

}

class EventsService {
    private eventsModelInstance = new EventsModel(db);

    insertEvent(to_id: number, from_id: number, type: string, msg: string) {

        const duplicates = this.eventsModelInstance.getDuplicateEvent(type, from_id, to_id);
        if (duplicates.data.length > 0) {
            return { message: 'error', data: { message: 'event registered' } };
        }

        const { message, data } = this.eventsModelInstance.insertEvent(type, from_id, to_id, msg);

        if (message === 'success') {
            const user = connectedRoomInstance.getById(to_id);
            if (user && user.socket) {
                const newEvent = {
                    to_id,
                    from_id,
                    type,
                    message
                };
                user.socket.send(JSON.stringify({
                    id: data.message,
                    status: statusCode('OK'),
                    message: 'event:new',
                    data: newEvent
                }));
            }
        }

        return { message, data };
    }

    getToEvents(to_id: number) {
        const { message, data } = this.eventsModelInstance.getToEvents(to_id);
        return { message, data };
    }

    getFromEvents(from_id: number) {
        const { message, data } = this.eventsModelInstance.getFromEvents(from_id);
        return { message, data };
    }

    deleteEvent(eventId: number) {
        const { message, data } = this.eventsModelInstance.deleteEvent(eventId);
        return { message, data };
    }
}

export type EventsReturnDB = {
	id: number;
	type: string;
	from_id: number;
	to_id: number;
	payload: string;
	timestamp: string;
}

export type EventInsertDB = {
	lastInsertRowid: number,
	changes: number
}

class EventsModel {
    private db: Database.Database;
    private stmInsertEvent: Database.Statement;
    private stmGetToEvents: Database.Statement;
    private stmGetFromEvents: Database.Statement;
    private stmGetDuplicateEvent: Database.Statement;
    private stmDeleteEvent: Database.Statement;

    constructor(db: Database.Database) {
        this.db = db;
        this.stmInsertEvent = db.prepare(
            `INSERT INTO
                events (type, from_id, to_id, payload)
                VALUES (@type, @fromId, @toId, @payload)`);
        this.stmGetToEvents = db.prepare(`SELECT * FROM events WHERE to_id=@toId`);
        this.stmGetFromEvents = db.prepare(`SELECT * FROM events WHERE from_id=@fromId`);
        this.stmGetDuplicateEvent = db.prepare(
            `SELECT * FROM events
                WHERE type=@type AND from_id=@fromId AND to_id=@toId`);
        this.stmDeleteEvent = db.prepare(
            `DELETE FROM events WHERE id=@eventId`);
    }

    getDuplicateEvent(type: string, fromId: number, toId: number): GetEvents {
        const response = this.stmGetDuplicateEvent.all({ type, fromId, toId }) as NewEventsDB[];
        return { message: 'success', data: response };
    }

    insertEvent(type: string, fromId: number, toId: number, payload: string): EventOnChangeDB {
        const { lastInsertRowid, changes } = this.stmInsertEvent.run({ type, fromId, toId, payload }) as EventInsertDB;
        if (changes === 1) {
            return { message: 'success', data: { message: 'event_inserted' } };
        }
        return { message: 'error', data: { message: 'event not inserted' } };
    }

    getToEvents(toId: number): GetEvents {
        const response = this.stmGetToEvents.all({ toId }) as NewEventsDB[];
        return { message: 'success', data: response };
    }

    getFromEvents(fromId: number): GetEvents {
        const response = this.stmGetFromEvents.all({ fromId }) as NewEventsDB[];
        return { message: 'success', data: response };
    }

    deleteEvent(eventId: number): EventOnChangeDB {
        const { changes } = this.stmDeleteEvent.run({ eventId: Number(eventId) }) as EventInsertDB;
        //print(`[DELETE] Event ID ${eventId}, changes: ${changes}`);
        if (changes === 1) {
            return { message: 'success', data: { message: 'event removed' } };
        }
        return { message: 'error', data: { message: 'event not removed' } };
    }
}

export { eventsRoutes, EventsController, EventsService, EventsModel };