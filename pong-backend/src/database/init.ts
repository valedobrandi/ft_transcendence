
import { createSchema } from "./schema.js";
import { drop_tables } from "./seeds/seed_dropTable.js";
import { seedUsers } from "./seeds/seed_users.js";

drop_tables();
createSchema();
if (process.env.NODE_ENV !== 'production') {
    seedUsers();
}
