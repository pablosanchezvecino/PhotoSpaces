import"colors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dbConnection from "./database/config.js";
import requestsRouter from "./routes/requestsRouter.js";
import { processQueue } from "./controllers/requestsController.js";

dotenv.config();

dbConnection();

const app = express();
const port = process.env.PORT;

app.use(fileUpload());
app.use(cors());
app.use(morgan("dev"));

app.use("/requests", requestsRouter);

// Para ayudar a optimizar los tiempos de espera, mediante este endpoint 
// el microservicio de administración visa al microservicio de gestión de 
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

app.listen(port, () => {
  console.log(`Microservicio de gestión de peticiones escuchando en el puerto ${port}`.bold.magenta);
});