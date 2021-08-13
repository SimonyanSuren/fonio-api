import dotenv from "dotenv";
import express, { Request, Response } from "express";
import connection from "./config";
import http = require("http");

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT;
const server = http.createServer(app);

/**
 * Sample of ROOT URL
 *
 * @name welcome
 *
 * @param {express.Request} req
 * @param {express.Response} res
 *
 * @return {express.Response.body}
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Fonio API!").end();
});

connection
  .then((conn) => {
    console.info("DB connection");

    server.listen(PORT, () => {
      console.info("Server started at http://localhost:", PORT);
    });
  })
  .catch((error) => {
    throw new Error(error);
  });
