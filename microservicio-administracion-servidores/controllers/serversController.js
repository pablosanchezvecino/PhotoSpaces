// Funciones asociadas a los endpoints relacionados con la administración de los servidores de renderizado

import Server from "../models/Server.js";

const getServers = async (req, res) => {
  try {
    const servers = await Server.find({});
    res.status(200).send(servers);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

const addServer = async (req, res) => {
  // Extraer dirección IP y nombre del servidor del cuerpo de la petición
  const renderingServerIP = req.body.ip;
  const renderingServerName = req.body.name;

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

  // Realizar consulta al servidor para saber si este es capaz de actuar como servidor de renderizado
  try {
    const response = await fetch(`http://${renderingServerIP}:3000/test`);
    if (response.status === 200) {
      // Todo va bien en el servidor de renderizado
      // Persistir info servidor
      const serverInfo = await response.json();

      const newServer = new Server({
        name: renderingServerName,
        ip: renderingServerIP,
        os: serverInfo.os,
        cpu: serverInfo.cpu,
        gpu: serverInfo.gpu,
        blenderVersion: serverInfo.blenderVersion,
        status: "idle",
        registrationDate: Date.now(),
        timeSpentOnRenderTest: serverInfo.timeSpentOnRenderTest,
      });

      newServer.save();

      // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
      fetch(`http://${process.env.REQUEST_MANAGEMENT_MICROSERVICE_IP}:${process.env.REQUEST_MANAGEMENT_MICROSERVICE_PORT}/new-server-available`);

      // Informar del éxito de la operación al cliente
      res.status(201).send(newServer);
    } else {
      // Servidor no es capaz de renderizar
      res.status(500).send({
        error:
          "No se pudo añadir el servidor porque este no tiene instalado el software necesario",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).send({
      error: "No fue posible establecer una conexión con el servidor",
    });
  }
};

const disableServer = async (req, res) => {
  // Consultar dirección IP y estado del servidor
  const serverInfo = await Server.findById(req.params.id, "status ip").exec();

  // Solo se puede deshabilitar el servidor si este se encuentra en estado "idle"
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
      console.error(error);
      res.status(500).send({
        error: "Error al contactar con el servidor de renderizado",
      });
    });
};

const enableServer = async (req, res) => {
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
      error:
        "El servidor ya se encuentra habilitado y a la espera de peticiones",
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
      console.error(error);
      res.status(500).send({
        error: "Error al contactar con el servidor de renderizado",
      });
    });
};

const deleteServer = async (req, res) => {
  // Consultar dirección IP y estado del servidor
  const serverInfo = await Server.findById(req.params.id, "status ip").exec();

  // Solo se puede eliminar el servidor si este se no se encuentra en estado "busy"
  if (serverInfo.status === "busy") {
    res.status(400).send({
      error: "El servidor se encuentra procesando una petición",
    });
    return;
  }

  // Borrar info del servidor de la BD
  await Server.findByIdAndDelete(req.params.id);

  // Informar del éxito al cliente
  res.status(200).send({
    message: "Servidor eliminado del sistema con éxito",
  });
};

export { getServers, addServer, disableServer, enableServer, deleteServer };
