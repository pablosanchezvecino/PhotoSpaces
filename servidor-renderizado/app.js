import { setStatus, setEstimatedRemainingProcessingTime } from "./serverStatus.js";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import renderingServerRouter from "./routes/renderingServerRouter.js";
import ServerStates from "./constants/serverStatesEnum.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import "colors";

printAsciiArt();

if (process.env.DOCKER_CONTAINER_EXECUTION) {
  console.log("Ejecución en contenedor Docker detectada ".bold.blue);
} else {
  console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
  dotenv.config();
}

setStatus(ServerStates.unbound);
setEstimatedRemainingProcessingTime(null);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(ipCheckMiddleware);
app.use("", renderingServerRouter);

app.listen(port, () => {
  console.log(
    `Servidor de renderizado escuchando en el puerto ${port}`.bold.magenta
  );
});
