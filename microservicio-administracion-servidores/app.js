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

app.post(
  "/servers",
  async (req, res, next) => {
    // Extraer dirección IP y nombre del servidor del cuerpo de la petición
    const renderingServerIP = req.body.ip;
    const renderingServerName = req.body.name;
    console.log();

    // TODO: Pasar comprobaciones a middleware

    // Si no es posible extraer la dirección IP, informar del error
    if (renderingServerIP === undefined) {
      res.status(400).send({
        error:
          "No se encontró la IP del servidor de renderizado en el cuerpo de la petición",
      });
      return;
    }

    // Si no es posible extraer el nombre, informar del error
    if (renderingServerName === undefined) {
      res.status(400).send({
        error:
          "No se encontró el nombre del servidor de renderizado en el cuerpo de la petición",
      });
      return;
      //next(new Error('I am passing you an error!'));return;
    }

    // Comprobar que no hay servidor registrado con la misma IP
    const sameIPServer = await Server.findOne({ ip: renderingServerIP }).exec();

    if (sameIPServer !== null) {
      res.status(400).send({
        error: "El servidor ya se encuentra registrado en el sistema",
      });
      return;
    }

    // Comprobar que no hay servidor registrado con el mismo nombre
    const sameNameServer = await Server.findOne({
      name: renderingServerName,
    }).exec();

    if (sameNameServer !== null) {
      res.status(400).send({
        error:
          "El nombre especificado ya se encuentra asociado a un servidor registrado en el sistema",
      });
      return;
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

          // Persistir info servidor
          const newServer = new Server({
            name: renderingServerName,
            ip: renderingServerIP,
            os: serverSpecs.os,
            cpu: serverSpecs.cpu,
            gpu: serverSpecs.gpu,
            blenderVersion: serverSpecs.blenderVersion,
            status: "idle",
            registrationDate: Date.now(),
          });

          newServer.save();

          // Informar del éxito de la operación al cliente
          res.status(201).send(newServer);
        }
      })
      .catch((error) => {
        // Se produce error al contactar con el posible servidor de renderizado
        // Informar al cliente del problema
        res.status(400).send({
          error: "No fue posible establecer una conexión con el servidor",
        });
      });
  },
  (err, req, res, next) => {
    res.status(400).send(err.message);
  }
);

app.get("/servers", async (req, res) => {
  const servers = await Server.find({});
  res.send(servers);
});

app.post("/servers/:id/disable", async (req, res) => {
  // Consultar dirección IP y estado del servidor
  const serverInfo = await Server.findById(req.params.id, "status ip").exec();

  // Solo se puede deshabilitar el servidor si este se necuentra en estado "idle"
  if (serverInfo.status === "busy") {
    res.status(400).send({
      error: "El servidor se encuentra procesando una petición",
    });
    return;
  } else if (serverInfo.status === "disabled") {
    res.status(400).send({
      error: "El servidor ya se encuentra deshabilitado",
    });
    return;
  }

  // Contactar con el servidor para que cambie su estado
  fetch(`http://${serverInfo.ip}:${process.env.RENDER_SERVER_PORT}/disable`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (response.status === 200) {
        // Si todo fue bien
        // Actualizar estado en BD
        await Server.findByIdAndUpdate(req.params.id, { status: "disabled" });

        // Informar del éxito al cliente
        res.status(200).send({
          message: (await response.json()).message,
        });
      } else {
        res.status(400).send({
          error: (await response.json()).error,
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/servers/:id/enable", async (req, res) => {
  // Consultar dirección IP y estado del servidor
  const serverInfo = await Server.findById(req.params.id, "status ip").exec();


  // Solo se puede deshabilitar el servidor si este se necuentra en estado "idle"
  if (serverInfo.status === "busy") {
    res.status(400).send({
      error: "El servidor ya se encuentra habilitado y procesando una petición",
    });
    return;
  } else if (serverInfo.status === "idle") {
    res.status(400).send({
      error: "El servidor ya se encuentra habilitado y a la espera de peticiones",
    });
    return;
  }

  // Contactar con el servidor para que cambie su estado
  fetch(`http://${serverInfo.ip}:${process.env.RENDER_SERVER_PORT}/enable`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (response.status === 200) {
        // Si todo fue bien
        // Actualizar estado en BD
        await Server.findByIdAndUpdate(req.params.id, { status: "idle" });

        // Informar del éxito al cliente
        res.status(200).send({
          message: (await response.json()).message,
        });
      } else {
        res.status(400).send({
          error: (await response.json()).error,
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.listen(port, () => {
  console.log(
    `Microservicio de administración de servidores escuchando en el puerto ${port}`
  );
});
