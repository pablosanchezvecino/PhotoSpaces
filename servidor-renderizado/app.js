import { setStatus, setEstimatedRemainingProcessingTime } from "./serverStatus.js";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import renderingServerRouter from "./routes/renderingServerRouter.js";
import ServerStates from "./constants/serverStatesEnum.js";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import "colors";

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
