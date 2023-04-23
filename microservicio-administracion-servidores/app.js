import "colors";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dbConnection from "./database/config.js";
import serversRouter from "./routes/serversRouter.js";
import requestsRouter from "./routes/requestsRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

dbConnection();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/servers", serversRouter);
app.use("/requests", requestsRouter);

app.listen(port, () => {
  console.log(
    `Microservicio de administración de servidores escuchando en el puerto ${port}`
      .bold.magenta
  );
});