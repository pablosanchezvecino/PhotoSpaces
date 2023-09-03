import { setStatus, setEstimatedRemainingProcessingTime, setLatestRequest } from "./serverStatus.js";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import renderingServerRouter from "./routes/renderingServerRouter.js";
import ServerStates from "./constants/serverStatesEnum.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import { port } from "./env.js";
import express from "express";
import morgan from "morgan";
import path from "path";
import "colors";

printAsciiArt();

setStatus(ServerStates.unbound);
setLatestRequest("N/A");
setEstimatedRemainingProcessingTime(null);

const app = express();

app.use(morgan("dev"));
app.use(ipCheckMiddleware);
app.use("", renderingServerRouter);

app.use(express.static(path.join("./public")));

app.listen(port, () => {
  console.log(
    `Servidor de renderizado escuchando en el puerto ${port}`.bold.magenta
  );
});
