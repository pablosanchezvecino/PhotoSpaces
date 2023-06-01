import "colors";
import dotenv from "dotenv";
import ServerStates from "./constants/serverStatesEnum.js";
import { setStatus } from "./serverStatus.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import renderingServerRouter from "./routes/renderingServerRouter.js";
import fileUpload from "express-fileupload";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";

dotenv.config();

setStatus(ServerStates.unbound);

const app = express();
const port = process.env.PORT;

app.use(fileUpload());
app.use(cors());
app.use(morgan("dev"));
app.use(ipCheckMiddleware);
app.use("", renderingServerRouter);

app.listen(port, () => {
  console.log(
    `Servidor de renderizado escuchando en el puerto ${port}`.bold.magenta
  );
});
