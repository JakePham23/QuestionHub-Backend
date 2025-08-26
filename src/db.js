import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
class PostgreSQLDatabase {
  constructor() {
    this._connect();
  }

  async _connect() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432", 10),
      database: process.env.DB_DATABASE,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: true }
          : false,
    });
    this.pool.on("connect", () => {
      console.log("PostgreSQL Database connected");
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });

    // Test the connection
    try {
      await this.pool.query("SELECT NOW()");
      console.log("Initial database connection successful.");
    } catch (err) {
      console.error("FATAL: Initial database connection failed.", err);
      process.exit(1);
    }
  }

  static getInstance() {
    if (!PostgreSQLDatabase.instance) {
      PostgreSQLDatabase.instance = new PostgreSQLDatabase();
    }
    return PostgreSQLDatabase.instance;
  }

  /**
   * Executes a SQL query.
   * @param {string} text - The SQL query string.
   * @param {Array} [params] - The parameters to pass to the query.
   * @returns {Promise<import('pg').QueryResult>} The query result.
   */
  async query(text, params) {
    return this.pool.query(text, params);
  }

  async close() {
    await this.pool.end();
    console.log("PostgreSQL pool has been closed.");
  }
}

export default PostgreSQLDatabase.getInstance();
