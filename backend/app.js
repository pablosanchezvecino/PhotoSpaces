import express from "express";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import queue from "express-queue";
const app = express();
const port = process.env.PORT || 3030;

// Para el log de consola
app.use(morgan("dev"));

// La cola de la app
export const requestQueue = queue({ activeLimit: 1, queuedLimit: -1 });

// Para aceptar FormData
app.use(fileUpload());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Rutas
import renderRoute from "./src/routes/renderRoute.js";
import timeRoute from "./src/routes/timeRoute.js";
import queueRoute from "./src/routes/queueRoute.js";

app.use("/render", requestQueue, renderRoute);
app.use("/queue", queueRoute);
app.use("/time", timeRoute);

// Ruta de error
app.use((req, res, next) => {
  const error = new Error(
    "Method " + req.method + " for " + req.originalUrl + " not found"
  );
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

// Despliegue del servidor
app.listen(port, () => {
  console.log("> Servidor desplegado en http://localhost:" + port);
});
