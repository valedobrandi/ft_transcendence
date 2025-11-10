import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import db from '../../database/db.js'
import JWT from 'jsonwebtoken';
import fs from "fs";
import path from "path";
import fastifyMultipart from "@fastify/multipart";

export default function avatarRoute(fastify: FastifyInstance) 
{

  fastify.register(fastifyMultipart);

  fastify.post('/profil/avatar/:id', async (request: FastifyRequest<{ Params: { id: string } }>, res) => {
    try {
      const idUser = Number(request.params.id);
      if (!idUser) 
        return res.status(404).send({ error: "ID unknown" });

      const existUser = db.prepare('SELECT * FROM users WHERE id = ?').get(idUser);
      if (!existUser) 
        return res.status(404).send({ error: "User not found" });

     
      const data = await request.file();
      if (!data) 
        return res.status(400).send({ error: "File not found" });

      const allowedTypes: { [key: string]: string } = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg"
      };
      const ext = allowedTypes[data.mimetype];
      if (!ext) 
        return res.status(400).send({ error: "Invalid file type" });

    
      const uploadDir = path.join(process.cwd(), "src/images");
      if (!fs.existsSync(uploadDir)) 
        fs.mkdirSync(uploadDir, { recursive: true });

    
      const fileName = `avatar_${idUser}_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

    
      await fs.promises.writeFile(filePath, await data.toBuffer());


      const publicPath = `/images/${fileName}`;
      db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(publicPath, idUser);

      return res.status(200).send({ message: "Avatar uploaded successfully!", avatar_url: publicPath });

    } 
    catch (err) 
    {
      console.error("Upload error:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
  });
}
