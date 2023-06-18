import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import requestsRouter from "./routes/requestsRouter.js";
import dbConnection from "./database/databaseConfig.js";
import serversRouter from "./routes/serversRouter.js";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import "colors";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

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