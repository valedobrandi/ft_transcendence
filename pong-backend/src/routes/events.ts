import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Database from 'better-sqlite3';
import db from "../../database/db";
import { statusCode } from "../types/statusCode";
import { connectedRoomInstance } from "../state/ConnectedRoom";

type EventOnChangeDB = {
    status: 'error' | 'success';
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
    status: 'error' | 'success';
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
            types: 'object',
            properties: {
                to_id: { type: 'number' },
                from_id: { type: 'number' },
                type: { type: 'string' },
                message: { type: 'string' }
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
}

class EventsController {
    private eventsServiceInstance = new EventsService();

    insertEvent(req: FastifyRequest<{ Body: InsertEventBody }>, res: FastifyReply) {
        const { to_id, from_id, type, message } = req.body;
        const { status, data } = this.eventsServiceInstance.insertEvent(to_id, from_id, type, message);
		// Lookout for the destination user to send real-time notification (if connected)
		if (status === 'success') {
			const user = connectedRoomInstance.getById(to_id);
			if (user && user.socket) {
				const newEvent: NewEventsDB = {
					id: data.id,
					type,
					from_id,
					to_id,
					payload: message,
					timestamp: new Date().toISOString()
				};
				user.socket.send(JSON.stringify({
					status: statusCode('OK'),
					type: 'NEW_EVENT',
					data: newEvent
				}));
			}
		}
        return res.status(statusCode('OK')).send({ status, message: data.message, })
    }

    getToEvents(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { status, data } = this.eventsServiceInstance.getToEvents(id);
        return res.status(statusCode('OK')).send({ status, data });
    }

    getFromEvents(req: FastifyRequest, res: FastifyReply) {
        const id = Number(req.userId);
        const { status, data } = this.eventsServiceInstance.getFromEvents(id);
        return res.status(statusCode('OK')).send({ status, data });
    }

}

class EventsService {
    private eventsModelInstance = new EventsModel(db);

    insertEvent(to_id: number, from_id: number, type: string, message: string) {
        switch (type) {
            case 'friend:add':
                // Check if friend request already exists could be added here
                const duplicates = this.eventsModelInstance.getDuplicateEvent(type, from_id, to_id);
                if (duplicates.data.length > 0) {
                    return { status: 'error', data: { message: 'duplicate event' } };
                }
                break;
            case 'friend:accept':
            case 'friend:reject':
                break;
            default:
                return { status: 'error', data: { message: 'invalid event type' } };
        }
        const { status, data } = this.eventsModelInstance.insertEvent(type, from_id, to_id, message);
        return { status, data };
    }

    getToEvents(to_id: number) {
        const {status, data} = this.eventsModelInstance.getToEvents(to_id);
        return { status, data };
    }

    getFromEvents(from_id: number) {
        const {status, data} = this.eventsModelInstance.getFromEvents(from_id);
        return { status, data };
    }

	deleteEvent(eventId: number) {
		const { status, data } = this.eventsModelInstance.deleteEvent(eventId);
		return { status, data };
	}
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
        const response = this.stmGetDuplicateEvent.all({ type, fromId, toId });
        return { status: 'success', data: response };
    }

    insertEvent(type: string, fromId: number, toId: number, payload: string): EventOnChangeDB {
        const response = this.stmInsertEvent.run({ type, fromId, toId, payload });
        if (response.changes === 1) {
            return { status: 'success', data: { message: 'event inserted' } };
        }
        return { status: 'error', data: { message: 'event not inserted' } };
    }

    getToEvents(toId: number): GetEvents {
        const response = this.stmGetToEvents.all({ toId });
        return { status: 'success', data: response };
    }

    getFromEvents(fromId: number): GetEvents {
        const response = this.stmGetFromEvents.all({ fromId });
        return { status: 'success', data: response };
    }

	deleteEvent(eventId: number): EventOnChangeDB {
		const response = this.stmDeleteEvent.run({ eventId });
		if (response.changes === 1) {
			return { status: 'success', data: { message: 'event deleted' } };
		}
		return { status: 'error', data: { message: 'event not deleted' } };
	}
}

export { eventsRoutes, EventsController, EventsService, EventsModel };