const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postNicky",
  database: "SPA_Services",
  port: 5432,
});

module.exports = pool;
