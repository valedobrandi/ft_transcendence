import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '../database/db.js'
import fs from "fs";
import path from "path";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from '@fastify/static';


export default function avatarRoute(fastify: FastifyInstance) {

  const imageDir = '/app/images';

  fastify.register(fastifyMultipart);

  fastify.register(fastifyStatic, {
    root: imageDir,
    prefix: '/avatar/',   // map directly to /avatar/
  });

  fastify.post('/avatar', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    try {
      const idUser = request.user?.id;
      if (!idUser) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const existUser = db.prepare('SELECT * FROM users WHERE id = ?').get(idUser);
      if (!existUser)
        return reply.status(404).send({ error: "User not found" });


      const data = await request.file();
      if (!data)
        return reply.status(400).send({ error: "File not found" });

      const allowedTypes: { [key: string]: string } = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg"
      };
      const ext = allowedTypes[data.mimetype];
      if (!ext)
        return reply.status(400).send({ error: "Invalid file type" });

      const uploadDir = imageDir;
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `avatar_${idUser}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, await data.toBuffer());


      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(fileName, idUser);

      return reply.send({ message: "Avatar uploaded successfully!", payload: { avatar_url: fileName } });

    } catch (err) {
      console.error("Upload error:", err);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });


  fastify.put('/avatar', {
    preHandler: [fastify.authenticate],
  }, async (request: any, reply) => {
    try {
      const idUser = request.user?.id;
      if (!idUser)
        return reply.status(401).send({ error: "Unauthorized" });

      const { avatar_url } = request.body;

      if (!avatar_url)
        return reply.status(400).send({ error: "avatar_url is required" });

      db.prepare(
        `UPDATE users SET avatar_url = ? WHERE id = ?`
      ).run(avatar_url, idUser);

      return reply.status(200).send({
        message: "success",
        payload: { avatar_url }
      });

    } catch (err) {
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}
