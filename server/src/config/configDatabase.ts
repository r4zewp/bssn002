import { config } from "dotenv";
import { Pool } from "pg";

const environment = process.env.ENVIRONMENT || "dev";
const envFile = environment === "dev" ? ".env.dev" : ".env.prod";

config({ path: envFile });
console.log(process.env.USER_DB);
const pool = new Pool({
  user: process.env.USER_DB!,
  password: process.env.PASSWORD_DB!,
  database: process.env.DATABASE_DB!,
  host: process.env.HOST_DB!,
  port: Number(process.env.PORT_DB!),
});

pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
