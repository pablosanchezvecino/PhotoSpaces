import { Worker } from "worker_threads";
import { saveTempFile, deleteTempFiles } from "../logic/fileLogic.js";
import { setTimeEstimation } from "../logic/timeLogic.js";

export async function upload(req, res, next) {
  try {
    console.log("Processing model...");
    const options = {
      root: "./public/",
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };

    const model = req.files.model;
    saveTempFile(model);

    const worker = new Worker("./src/logic/renderLogic.js", {
      workerData: {
        data: req.body.data,
        fileName: model.md5,
      },
    });

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
