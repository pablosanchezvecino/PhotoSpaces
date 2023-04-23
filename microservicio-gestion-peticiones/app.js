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

app.get("/new-server-available", (req, res) => {
  res.status(200).send();

  processQueue();
});


app.listen(port, () => {
  console.log(`Microservicio de gestión de peticiones escuchando en el puerto ${port}`.bold.magenta);
});