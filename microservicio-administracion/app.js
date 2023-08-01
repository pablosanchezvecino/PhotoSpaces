import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import requestsRouter from "./routes/requestsRouter.js";
import dbConnection from "./database/databaseConfig.js";
import serversRouter from "./routes/serversRouter.js";
import { port } from "./env.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "colors";

printAsciiArt();

const app = express();

// Conexión a MongoDB
dbConnection();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Utilizar comprobación de direcciones IP
app.use(ipCheckMiddleware);

// Routers
app.use("/servers", serversRouter);
app.use("/requests", requestsRouter);

app.listen(port, () => {
  console.log(
    `Microservicio de administración escuchando en el puerto ${port}`.bold.magenta
  );
});