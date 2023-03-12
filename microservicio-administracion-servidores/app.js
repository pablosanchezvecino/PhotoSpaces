require("dotenv").config();
require("colors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const dbConnection = require("./database/config");
const serversRouter = require('./routes/serversRouter.js');
const requestsRouter = require('./routes/requestsRouter.js');

const app = express();
const port = process.env.PORT;

dbConnection();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/servers", serversRouter);
app.use("/requests", requestsRouter);

app.listen(port, () => {
  console.log(
    `Microservicio de administración de servidores escuchando en el puerto ${port}`
      .bold.magenta
  );
});