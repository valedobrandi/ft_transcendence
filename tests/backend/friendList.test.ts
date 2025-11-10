import { describe, it, expect } from "vitest";
import { fastify } from "../src/server.js";
import { userMock } from "./Mock.js";

describe("FRIEND LIST TEST", () => {
    var response;

    it("01 - ADD A USER TO THE FRIEND LIST", async () => {
        response = await fastify.inject({
            method: "POST",
            url: "/add-friend",
            body: {
                userId: userMock["alice"].id,
                friendUserId: userMock["bob"].id,
            },
        });

        expect(response.statusCode).toBe(200);
    });

    it("02 - GET FRIEND LIST", async () => {
        response = await fastify.inject({
            method: "GET",
            url: "/friend-list",
            query: {
                userId: userMock["alice"].id.toString(),
            },
        });

        expect(response.statusCode).toBe(200);

        const data = response.json();

        expect(data.payload).toContain(userMock["bob"].id);
    });

    it("03 - REMOVE A USER FROM THE FRIEND LIST", async () => {
        response = await fastify.inject({
            method: "DELETE",
            url: "/remove-friend",
            body: {
                userId: userMock["alice"].id,
                friendUserId: userMock["bob"].id,
            },
        });

        expect(response.statusCode).toBe(200);

        response = await fastify.inject({
            method: "GET",
            url: "/friend-list",
            query: {
                userId: userMock["alice"].id.toString(),
            },
        });

        const data = response.json();
        expect(data.payload).toBeDefined();
        expect(data.payload).not.toContain(userMock["bob"].id);
    });

    it("04 - ADD A USER TO THE FRIEND LIST (VALIDATION FAILURE)", async () => {
        response = await fastify.inject({
            method: "POST",
            url: "/add-friend",
            body: {
                userId: userMock["alice"].id,
            },
        });
        expect(response.statusCode).toBe(400);
    });

    it("05 - REMOVE A USER FROM THE FRIEND LIST (VALIDATION FAILURE)", async () => {
        response = await fastify.inject({
            method: "DELETE",
            url: "/remove-friend",
            body: {
                userId: userMock["alice"].id,
            },
        });
        expect(response.statusCode).toBe(400);
    });
});