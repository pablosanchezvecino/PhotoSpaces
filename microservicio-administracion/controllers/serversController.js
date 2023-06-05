// Funciones asociadas a los endpoints relacionados con la administración de los servidores de renderizado

import Server from "../models/Server.js";

const getServers = async (req, res) => {
  try {
    const servers = await Server.find({});
    res.status(200).send(servers);
  } catch (error) {
    console.error(`Error en la consulta a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

const addServer = async (req, res) => {
  // Extraer dirección IP y nombre del servidor del cuerpo de la petición
  const renderingServerIP = req.body.ip;
  const renderingServerName = req.body.name;

  // Si no es posible extraer la dirección IP, informar del error
  if (!renderingServerIP) {
    res.status(400).send({
      error:
        "No se encontró la IP del servidor de renderizado en el cuerpo de la petición",
    });
    return;
  }

  // Si no es posible extraer el nombre, informar del error
  if (!renderingServerName) {
    res.status(400).send({
      error:
        "No se encontró el nombre del servidor de renderizado en el cuerpo de la petición",
    });
    return;
  }

  // Comprobar que no hay servidor registrado con la misma IP
  let sameIPServer = null;
  let sameNameServer = null;
  try {
    sameIPServer = await Server.findOne({ ip: renderingServerIP }).exec();
    sameNameServer = await Server.findOne({
      name: renderingServerName
    }).exec();
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a añadir el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a añadir el servidor" });
    return;
  }

  if (sameIPServer) {
    res.status(400).send({
      error: "El servidor ya se encuentra registrado en el sistema",
    });
    return;
  }

  if (sameNameServer) {
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
      try {
        await fetch(
          `http://${process.env.REQUEST_MANAGEMENT_MICROSERVICE_IP}:${process.env.REQUEST_MANAGEMENT_MICROSERVICE_PORT}/new-server-available`
        );
      } catch (error) {
        console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
      }

      // Informar del éxito de la operación al cliente
      res.status(201).send(newServer);
    } else {
      // Servidor no es capaz de renderizar
      res.status(500).send({
        error:
          "No se pudo añadir el servidor porque este no tiene instalado el software necesario o no está configurado correctamente",
      });
    }
  } catch (error) {
    console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
    res.status(400).send({
      error: "Error en la conexión con el servidor de renderizado",
    });
  }
};

const disableServer = async (req, res) => {
  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip").exec();
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a deshabilitar el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a deshabilitar el servidor" });
    return;
  }

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
      console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
      res.status(500).send({
        error: "Error en la conexión con el servidor de renderizado",
      });
    });
};

const enableServer = async (req, res) => {
  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip").exec();
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a habilitar el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a habilitar el servidor" });
    return;
  }

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
      // Si todo fue bien
      if (response.status === 200) {
        // Actualizar estado en BD
        await Server.findByIdAndUpdate(req.params.id, { status: "idle" });

        // Informar del éxito al cliente
        res.status(200).send({
          message: (await response.json()).message,
        });

        // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
        try {
          await fetch(
            `http://${process.env.REQUEST_MANAGEMENT_MICROSERVICE_IP}:${process.env.REQUEST_MANAGEMENT_MICROSERVICE_PORT}/new-server-available`
          );
        } catch (error) {
          console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
        }

      } else {
        res.status(400).send({
          error: (await response.json()).error,
        });
      }
    })
    .catch((error) => {
      console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
      res.status(500).send({
        error: "Error en la conexión con el servidor de renderizado",
      });
    });
};

const deleteServer = async (req, res) => {
  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip");
  } catch (error) {
    res.status(400).send({ error: "El parámetro no es válido" });
    return;
  }

  // No existe servidor asociado al id especificado
  if (!serverInfo) {
    console.error(`Petición asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({
      error:
        "El parámetro id no se corresponde con ningún servidor de renderizado registrado en el sistema",
    });
    return;
  }

  // Existe servidor
  // Solo se puede eliminar si este no se encuentra en estado "busy"
  if (serverInfo.status === "busy") {
    res.status(400).send({
      error: "El servidor se encuentra procesando una petición",
    });
    return;
  }

  // Informar a servidor para que quede desvinculado
  try {
    const serverResponse = await fetch(
      `http://${serverInfo.ip}:${process.env.RENDER_SERVER_PORT}/unbind`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (serverResponse.status !== 200) {
      res.status(500).send({
        error: "Conflicto entre el contenido de la base de datos y el estado local del servidor",
      });
      return;
    }
  } catch (error) {
    res.status(500).send({
      error: "Error en la conexión con el servidor",
    });
    return;
  }

  // Borrar info del servidor de la BD
  let deletedServer = null;
  try {
    deletedServer =  await Server.findByIdAndRemove(req.params.id);
  } catch {
    res.status(500).send({
      error:
        "Error interno al intentar borrar el servidor de la base de datos",
    });
    return;
  }

  // Todo bien
  console.log(`Servidor eliminado: ${deletedServer}`.magenta);
  res.status(200).send({
    message: "Servidor eliminado con éxito",
    deletedServer,
  });

};

export { getServers, addServer, disableServer, enableServer, deleteServer };
