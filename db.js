const { Pool } = require("pg");

async function initDb() {
  // Step 1: connect to system postgres DB
  const sysPool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: "postgres", // connect to default system db
  });

  // Step 2: ensure our app DB exists
  const dbName = process.env.PG_DATABASE;
  const checkDb = await sysPool.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [dbName]
  );
  if (checkDb.rowCount === 0) {
    console.log(`Database "${dbName}" not found. Creating...`);
    await sysPool.query(`CREATE DATABASE "${dbName}"`);
  }
  await sysPool.end();

  // Step 3: connect to our app DB
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: dbName,
  });

  // Step 4: ensure users table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users (
      id serial PRIMARY KEY,
      name varchar NOT NULL,
      age int NOT NULL,
      address jsonb NULL,
      additional_info jsonb NULL
    );
  `);

  console.log(`Connected to DB "${dbName}" and ensured table "users" exists.`);
  return pool;
}

module.exports = initDb;
