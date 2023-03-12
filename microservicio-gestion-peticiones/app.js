require("dotenv").config();
require("colors")
const fileUpload =  require("express-fileupload");
const { writeFileSync, unlink } = require("fs");
const { Worker } = require("worker_threads");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dbConnection = require("./database/config");
const Server = require("./models/Server");
const Request = require("./models/Request");
const requestsRouter = require('./routes/requestsRouter');

dbConnection()

const app = express();
const port = process.env.PORT;

app.use(fileUpload());
app.use(cors());
app.use(morgan("dev"));

app.use("/requests", requestsRouter);



// app.post("/render", async (req, res) => {
//   console.log("Processing model...");
 
//   const options = {
//     root: "./",
//     dotfiles: "deny",
//     headers: {
//       "x-timestamp": Date.now(),
//       "x-sent": true,
//     },
//   };

//   const model = req.files.model;
//   saveTempFile(model);

//   const worker = new Worker("./renderLogic.js", {
//     workerData: {
//       data: req.body.data,
//       fileName: model.md5,
//     },
//   });

//   worker.on("message", (message) => {console.log("PYTHON:  " +message)
//     if (message.includes("file")) {
//       // setTimeEstimation(JSON.parse(message));
//     } else {  
//       res.status(201).sendFile(`${message}.png`, options, (err) => {
//         if (err) {
//           console.log(err);
//           res.status(500);
//         } else deleteTempFiles(message);
//       });
//     }
//   });
// });

app.listen(port, () => {
  console.log(`Microservicio de gestión de peticiones escuchando en el puerto ${port}`.bold.magenta);
});





// // Guardar el archivo temporalmente
// function saveTempFile(model) {
//   writeFileSync(`./${model.md5}.gltf`, Buffer.from(model.data));
// }

// // Eliminar los archivos temporales
// function deleteTempFiles(fileName) {
//   [".gltf", ".png"].map((format) => {
//     unlink(`./${fileName}${format}`, (err) => {
//       if (err) throw err;
//     });
//   });
// }
