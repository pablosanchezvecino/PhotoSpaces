require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { dbConnection } = require("./database/config");
const Server = require("./models/Server");

const app = express();
const port = process.env.PORT;

dbConnection();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.post("/servers", (req, res) => {
  // Extraer IP del cuerpo de la petición
  const renderingServerIP = req.body.ip;

  // Si no es posible extraer la IP, informar del error
  if (renderingServerIP === undefined) {
    res.status(400).send({
      error:
        "No se encontró la IP del servidor de renderizado en el cuerpo de la petición",
    });
  }

  // TODO: Comprobar que no hay servidor registrado con la misma IP
  if (false) {
    res
      .status(400)
      .send({ error: "El servidor ya se encuentra registrado en el sistema" });
  }

  // Realizar consulta al servidor para saber sus especificaciones y si tiene Blender instalado
  fetch(`http://${renderingServerIP}:3000/specs`)
    .then((response) => response.json())
    .then((serverSpecs) => {
      if (serverSpecs.blenderVersion === null) {
        // No tiene Blender
        // Informar al cliente del problema
        res.status(400).send({
          error:
            "No se pudo añadir el servidor porque este no dispone de ninguna instalación de Blender",
        });
      } else {
        // Tiene Blender
        // TODO: Persistir info servidor

        const newServer = new Server({
          name: "weiii",
          os: serverSpecs.os,
          cpu: serverSpecs.cpu,
          gpu: serverSpecs.gpu,
          blenderVersion: serverSpecs.blenderVersion,
          status: "idle",
          registrationDate: Date.now(),
        });

        newServer.save();

        // Informar del éxito de la operación al cliente
        res.status(201).send(serverSpecs);
      }
    })
    .catch((error) => {
      // Se produce error al contactar con el posible servidor de renderizado
      // Informar al cliente del problema
      res.status(400).send({
        error: "No fue posible establecer una conexión con el servidor",
      });
    });
});

app.get("/servers", async (req, res) => {
  const servers = await Server.find({});
  res.send(servers);
});

app.listen(port, () => {
  console.log(
    `Microservicio de administración de servidores escuchando en el puerto ${port}`
  );
});
