import { createSchema } from "./db.js";
import { seedUsers } from "./seeds/seed_users.js";

createSchema();
seedUsers();
