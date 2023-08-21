import { setUpEmailSendingBackupInterval } from "./logic/emailLogic.js";
import { updateQueues } from "./controllers/requestsController.js";
import { setUpCleanupInterval } from "./logic/cleanupLogic.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import requestsRouter from "./routes/requestsRouter.js";
import dbConnection from "./database/databaseConfig.js";
import corsOptions from "./constants/corsOptions.js";
import { port, dbCheckPeriodMs } from "./env.js";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "colors";

printAsciiArt();

dbConnection();

const app = express();

app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use("/requests", requestsRouter);

// Para ayudar a optimizar los tiempos de espera, mediante este endpoint 
// el microservicio de administración avisa al microservicio de gestión de 
// peticiones de la existencia de un nuevo servidor disponible para que 
// compruebe si existe alguna petición encolada que se le pueda enviar
app.post("/new-server-available", (req, res) => {
  res.status(200).send();
  try {
    updateQueues();
  } catch (error) {
    console.error(`Error durante la actualización de las colas. ${error}`.red);
  }
});

// Para no depender completamente del endpoint anterior, de todas formas
// el sistema comprobará de forma periódica la existencia de un nuevo
// servidor disponible y si algún servidor tiene peticiones encoladas y
// no las está procesando siendo posible este procesamiento
setInterval(
  () => {
    try {
      updateQueues();
    } catch (error) {
      console.error(`Error durante la actualización de las colas. ${error}`.red);
    }
  }, 
  dbCheckPeriodMs
);

// Aunque no debería suceder si todo funciona correctamente, el sistema 
// comprobará de forma periódica si es posible eliminar algún archivo temporal
// para evitar que se acumulen debido a algún problema
setUpCleanupInterval();

setUpEmailSendingBackupInterval();

app.listen(port, () => {
  console.log(`Microservicio de gestión de peticiones escuchando en el puerto ${port}`.bold.magenta);
});