
import { createSchema } from "./schema.js";
import { seedMatch } from "./seeds/seed_match.js";
import { seedUsers } from "./seeds/seed_users.js";

createSchema();
seedUsers();
seedMatch();
