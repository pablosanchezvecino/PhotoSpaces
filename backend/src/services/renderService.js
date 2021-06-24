import { Worker } from "worker_threads";
import { saveTempFile, deleteTempFiles } from "../logic/fileLogic.js";
import { setTimeEstimation } from "../logic/timeLogic.js";

export async function upload(req, res, next) {
  try {
    console.log("Processing model...");

    // Optiones para la respuesta de la petición
    const options = {
      root: "./public/",
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };

    // Tomamos el modelo de la petición y lo guardamos temporalmente
    const model = req.files.model;
    saveTempFile(model);

    // Creamos el worker (thread) para la ejecución de el renderizado
    const worker = new Worker("./src/logic/renderLogic.js", {
      workerData: {
        data: req.body.data,
        fileName: model.md5,
      },
    });

    // Recibimos los mensajes del worker, si es un mensaje de tiempo
    // actualizamos el objeto, sino, respondemos a la petición y
    // borramos los ficheros temporales
    worker.on("message", (message) => {
      if (message.includes("file")) {
        setTimeEstimation(JSON.parse(message));
      } else {
        res.status(201).sendFile(`${message}.png`, options, (err) => {
          if (err) {
            console.log(err);
            res.status(500);
          } else deleteTempFiles(message);
        });
      }
    });
  } catch (e) {
    next(e);
  }
}
