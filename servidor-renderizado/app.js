require("dotenv").config();
const ServerStates = require("./constants/serverStatesEnum.js");
const { setStatus } = require("./serverStatus");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const colors = require("colors");
const renderingServerRouter = require('./routes/renderingServerRouter.js');

setStatus(ServerStates.idle);

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));
app.use("", renderingServerRouter);

app.listen(port, () => {
  console.log(
    `Servidor de renderizado escuchando en el puerto ${port}`.bold.magenta
  );
});
