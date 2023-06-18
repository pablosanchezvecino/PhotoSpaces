import "colors";
import dotenv from "dotenv";
import ServerStates from "./constants/serverStatesEnum.js";
import { setStatus, setEstimatedRemainingProcessingTime } from "./serverStatus.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import renderingServerRouter from "./routes/renderingServerRouter.js";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";

dotenv.config();

setStatus(ServerStates.unbound);
setEstimatedRemainingProcessingTime(null);

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use(ipCheckMiddleware);
app.use("", renderingServerRouter);

app.listen(port, () => {
  console.log(
    `Servidor de renderizado escuchando en el puerto ${port}`.bold.magenta
  );
});
