import "reflect-metadata";
import { createConnection, Connection, ConnectionOptions } from "typeorm";

const dbOptions: ConnectionOptions = {
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ["dist/entities/**/*.js"],
  migrations: ["dist/migration/**/*.js"],
  subscribers: ["dist/subscriber/**/*.js"],
  synchronize: Boolean(process.env.TYPEORM_SYNC),
};

const connection: Promise<Connection> = createConnection(dbOptions);

export default connection;
