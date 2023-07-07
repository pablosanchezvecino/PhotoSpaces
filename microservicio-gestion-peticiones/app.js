import { processQueue } from "./controllers/requestsController.js";
import { setUpCleanupInterval } from "./logic/cleanupLogic.js";
import { setUpEmailSendingBackupInterval } from "./logic/emailLogic.js";
import requestsRouter from "./routes/requestsRouter.js";
import dbConnection from "./database/databaseConfig.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import "colors";

printAsciiArt();

dotenv.config();

dbConnection();

const app = express();
const port = process.env.PORT || 9001;

app.use(cors());
app.use(morgan("dev"));

app.use("/requests", requestsRouter);

// Para ayudar a optimizar los tiempos de espera, mediante este endpoint 
// el microservicio de administración avisa al microservicio de gestión de 
// peticiones de la existencia de un nuevo servidor disponible para que 
// compruebe si existe alguna petición encolada que se le pueda enviar
app.get("/new-server-available", (req, res) => {
  res.status(200).send();
  processQueue();
});

// Para no depender completamente del endpoint anterior, de todas formas
// el sistema comprobará de forma periódica la existencia de un nuevo
// servidor disponible, así nos aseguraremos de que, en caso de fallo de
// la comunicación anterior, a lo sumo la cantidad de tiempo
// durante el cual haya peticiones encoladas y servidores disponibles al 
// mismo tiempo coincidirá con el periodo especificado
setInterval(processQueue, process.env.DB_CHECK_PERIOD_MS);

// Aunque no debería suceder si todo funciona correctamente, el sistema 
// comprobará de forma periódica si es posible eliminar algún archivo temporal
// para evitar que se acumulen debido a algún problema
setUpCleanupInterval();

setUpEmailSendingBackupInterval();

app.listen(port, () => {
  console.log(`Microservicio de gestión de peticiones escuchando en el puerto ${port}`.bold.magenta);
});