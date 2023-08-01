import { renderServerPort, requestHandlingMicroserviceUrl } from "../env.js";
import { isValidServerName, isValidIpv4 } from "../logic/validationLogic.js";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import mongoose from "mongoose";


// Funciones asociadas a los endpoints relacionados con la administración de los servidores de renderizado

const getServers = async (req, res) => {
  try {
    let limit = req.query.limit;

    // Si no se ha indicado límite o no es un entero
    if (!limit || limit.includes(".") || isNaN(parseInt(limit))) {
      // 0 indica a mongoose que no limite el número de documentos devueltos
      limit = 0; 
    }
    
    let servers = null;
    if (limit === 0) { // Sin límite
      servers = await Server.find({});
    } else { // Consulta limitada por cada estado posible
      const idleServers = await Server.find({ status: "idle" }).limit(limit);
      const busyServers = await Server.find({ status: "busy" }).limit(limit);
      const disabledServers = await Server.find({ status: "disabled" }).limit(limit);

      servers = idleServers.concat(busyServers, disabledServers);
    }

    res.status(200).send(servers);
  } catch (error) {
    console.error(`Error en la consulta de los servidores a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta de los servidores a la base de datos" });
  }
};

const getServerById = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }
  
  // Buscar servidor en BD
  let server = null;
  try {
    server = await Server.findById(req.params.id);
  } catch (error) {
    console.error(`Error en la consulta del servidor en la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en en la consulta del servidor en la base de datos" });
    return;
  }

  // No se encuentra el servidor
  if (!server) {
    console.error(`Servidor de renderizado asociado al id ${req.params.id} no encontrado`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ningún servidor de renderizado almacenado en el sistema" });
    return;
  }

  // Todo bien
  res.status(200).send(server);
};

const addServer = async (req, res) => {
  // Extraer dirección IP y nombre del servidor del cuerpo de la petición
  const renderingServerIp = req.body.ip;
  const renderingServerName = req.body.name;

  // Si no es posible extraer la dirección IP, informar del error
  if (!renderingServerIp) {
    console.error("No se encontró la dirección IP del servidor de renderizado en el cuerpo de la petición".red);
    res.status(400).send({ error: "No se encontró la dirección IP del servidor de renderizado en el cuerpo de la petición" });
    return;
  }

  // Si no es posible extraer el nombre, informar del error
  if (!renderingServerName) {
    console.error("No se encontró el nombre del servidor de renderizado en el cuerpo de la petición".red);
    res.status(400).send({ error: "No se encontró el nombre del servidor de renderizado en el cuerpo de la petición" });
    return;
  }

  // Validaciones
  if (!isValidServerName(renderingServerName)) {
    console.error(`El nombre para el servidor recibido no es válido (${renderingServerName})`.red);
    res.status(400).send({ error: "El nombre para el servidor recibido no es válido" });
    return;
  }

  if (!isValidIpv4(renderingServerIp)) {
    console.error(`La dirección IP recibida no sigue el formato IPv4 (${renderingServerIp})`.red);
    res.status(400).send({ error: "La dirección IP recibida no sigue el formato IPv4" });
    return;
  }

  // Comprobar que no hay servidor registrado con la misma dirección IP
  let sameIPServer = null;
  let sameNameServer = null;
  try {
    sameIPServer = await Server.findOne({ ip: renderingServerIp });
    sameNameServer = await Server.findOne({ name: renderingServerName });
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a añadir el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a añadir el servidor" });
    return;
  }

  if (sameIPServer) {
    console.error("Encontrado servidor con la misma dirección IP registrado en el sistema".red);
    res.status(400).send({ error: "El servidor ya se encuentra registrado en el sistema" });
    return;
  }

  if (sameNameServer) {
    console.error("Encontrado servidor con el mismo nombre registrado en el sistema".red);
    res.status(400).send({ error: "El nombre especificado ya se encuentra asociado a un servidor registrado en el sistema" });
    return;
  }

  // Realizar consulta al servidor para saber si este es capaz de actuar como servidor de renderizado
  try {
    const response = await fetch(`http://${renderingServerIp}:${renderServerPort}/bind`, { method: "POST" });
    if (response.ok) {
      // Todo va bien en el servidor de renderizado
      // Persistir info servidor
      const serverInfo = await response.json();

      const newServer = new Server({
        name: renderingServerName,
        ip: renderingServerIp,
        status: "idle",
        os: serverInfo.os,
        cpu: serverInfo.cpu,
        gpu: serverInfo.gpu,
        blenderVersion: serverInfo.blenderVersion,
        registrationDate: Date.now(),
        timeSpentOnRenderTest: serverInfo.timeSpentOnRenderTest,
        enqueuedRequestsCount: 0,
        fulfilledRequestsCount: 0,
        totalCyclesNeededTime: 0,
        totalCyclesBlenderTime: 0,
        totalCyclesProcessedBytes: 0,
        totalCyclesProcessedPixels: 0,
        cyclesProcessedBytesPerMillisecondOfNeededTime: null,
        cyclesScore: null,
        totalEeveeNeededTime: 0,
        totalEeveeBlenderTime: 0,
        totalEeveeProcessedBytes: 0,
        totalEeveeProcessedPixels: 0,
        eeveeProcessedBytesPerMillisecondOfNeededTime: null,
        eeveeScore: null
      });

      try {
        await newServer.save();
      } catch (error) {
        console.error(`Error interno en la conexión con la base de datos al persistir el servidor. ${error}`.red);
        res.status(500).send({ error: "Error interno en la conexión con la base de datos al persistir el servidor" });
        return;
      }

      // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
      try {
        await fetch(`${requestHandlingMicroserviceUrl}/new-server-available`,
          { method: "POST" }
        );
      } catch (error) {
        console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
      }

      // Informar del éxito de la operación al cliente
      res.status(201).send(newServer);
    } else {
      // Servidor no es capaz de renderizar
      console.error(`Recibido código ${response.status} en la respuesta del servidor de renderizado`.red);
      res.status(400).send({ error: "No se pudo añadir el servidor porque este no tiene instalado el software necesario o no está configurado correctamente" });
    }
  } catch (error) {
    console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
    res.status(500).send({ error: "Error en la conexión con el servidor de renderizado" });
  }
};

const disableServer = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }

  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip");
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a deshabilitar el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a deshabilitar el servidor" });
    return;
  }

  // No se encuentra el servidor
  if (!serverInfo) {
    console.error(`Servidor asociado al id ${req.params.id} no encontrado`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ningún servidor de renderizado almacenado en el sistema"});
    return;
  }

  // Solo se puede deshabilitar el servidor si este se encuentra en estado "idle"
  if (serverInfo.status === "busy") {
    res.status(400).send({ error: "El servidor se encuentra procesando una petición" });
    return;
  } else if (serverInfo.status === "disabled") {
    res.status(400).send({ error: "El servidor ya se encuentra deshabilitado" });
    return;
  }

  // Contactar con el servidor para que cambie su estado
  try {
    const response = await fetch(`http://${serverInfo.ip}:${renderServerPort}/disable`, 
      { method: "POST" }
    );
  
    if (response.ok) {
      // Si todo fue bien
      // Actualizar estado en BD
      try {
        await Server.findByIdAndUpdate(req.params.id, { status: "disabled" });
      } catch (error) {
        console.error(`Error interno en la conexión con la base de datos al deshabilitar el servidor. ${error}`.red);
        res.status(500).send({ error: "Error interno en la conexión con la base de datos al deshabilitar el servidor" });
        return;
      }
  
      // Informar del éxito al cliente
      res.status(200).send({ message: (await response.json()).message });
    } else {
      console.error(`Recibido código ${response.status} en la respuesta del servidor de renderizado`.red);
      res.status(400).send({ error: (await response.json()).error });
    }
  } catch (error) {
    console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
    res.status(500).send({ error: "Error en la conexión con el servidor de renderizado" });
  }
};

const enableServer = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }

  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip");
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a habilitar el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a habilitar el servidor" });
    return;
  }

  // Solo se puede habilitar el servidor si este se encuentra en estado "disabled"
  if (serverInfo.status === "busy") {
    res.status(400).send({ error: "El servidor ya se encuentra habilitado y procesando una petición" });
    return;
  } else if (serverInfo.status === "idle") {
    res.status(400).send({ error: "El servidor ya se encuentra habilitado y a la espera de peticiones" });
    return;
  }

  // Contactar con el servidor para que cambie su estado
  try {
    const response = await fetch(`http://${serverInfo.ip}:${renderServerPort}/enable`, 
      { method: "POST" }
    );
    
    if (response.ok) {
      // Si todo fue bien
      // Actualizar estado en BD
      try {
        await Server.findByIdAndUpdate(req.params.id, { status: "idle" });
      } catch (error) {
        console.error(`Error interno en la conexión con la base de datos al habilitar el servidor. ${error}`.red);
        res.status(500).send({ error: "Error interno en la conexión con la base de datos al habilitar el servidor" });
        return;
      }
  
      // Informar del éxito al cliente
      res.status(200).send({message: (await response.json()).message });

      // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
      try {
        await fetch(`${requestHandlingMicroserviceUrl}/new-server-available`, 
          { method: "POST" }
        );
      } catch (error) {
        console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
      }
      
    } else {
      console.error(`Recibido código ${response.status} en la respuesta servidor de renderizado`.red);
      res.status(400).send({ error: (await response.json()).error });
    }
  } catch (error) {
    console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
    res.status(500).send({ error: "Error en la conexión con el servidor de renderizado" });
  }
  
};

const abortServer = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }

  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip name");
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor" });
    return;
  }

  // No se encuentra el servidor
  if (!serverInfo) {
    console.error(`Servidor asociado al id ${req.params.id} no encontrado`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ningún servidor de renderizado almacenado en el sistema"});
    return;
  }

  // Solo se puede deshabilitar el servidor si este se encuentra en estado "busy"
  if (serverInfo.status !== "busy") {
    res.status(400).send({ error: "El servidor no se encuentra procesando una petición" });
    return;
  }

  // Obtener petición que está siendo procesada el servidor
  let request = null;
  try {
    request = await Request.findOne({ status: "processing", assignedServer: serverInfo.name });
  } catch (error) {
    console.error(`Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor. ${error}`.red);
    res.status(500).send({ error: "Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor" });
    return;
  }

  // Contactar con el servidor para que cambie su estado
  try {
    const response = await fetch(`http://${serverInfo.ip}:${renderServerPort}/abort`, 
      { method: "POST" }
    );
  
    if (response.ok) {
      // Si todo fue bien
      // Actualizar estado en BD
      try {
        await Server.findByIdAndUpdate(req.params.id, { status: "idle" });
        await Request.findByIdAndUpdate(request._id, {
          status: "enqueued",
          queueStartTime: new Date(),
          processingStartTime: null,
          assignedServer: null,
          sentFile: false,
          transferTime: false
        });
      } catch (error) {
        console.error(`Error interno en la conexión con la base de datos tras abortar el procesamiento en el servidor. ${error}`.red);
        res.status(500).send({ error: "Error interno en la conexión con la base de datos tras abortar el procesamiento en el servidor" });
        return;
      }

      // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
      try {
        await fetch(`${requestHandlingMicroserviceUrl}/new-server-available`, 
          { method: "POST" }
        );
      } catch (error) {
        console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
      }
  
      // Informar del éxito al cliente
      res.status(200).send({message: (await response.json()).message });
    } else {
      console.error(`Recibido código ${response.status} en la respuesta servidor de renderizado`.red);
      res.status(400).send({ error: (await response.json()).error });
    }
  } catch (error) {
    console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
    res.status(500).send({ error: "Error en la conexión con el servidor de renderizado" });
  }
};

const deleteServer = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }
  
  // Consultar dirección IP y estado del servidor
  let serverInfo = null;
  try {
    serverInfo = await Server.findById(req.params.id, "status ip");
  } catch (error) {
    console.error(`Error en la consulta previa del servidor a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta previa del servidor a la base de datos" });
    return;
  }

  // No existe servidor asociado al id especificado
  if (!serverInfo) {
    console.error(`Servidor de renderizado asociado al id ${req.params.id} no encontrado`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ningún servidor de renderizado registrado en el sistema" });
    return;
  }

  // Existe servidor
  // Solo se puede eliminar si este no se encuentra en estado "busy"
  if (serverInfo.status === "busy") {
    res.status(400).send({ error: "El servidor se encuentra procesando una petición" });
    return;
  }

  // Informar a servidor para que quede desvinculado
  let responseSent = false;
  try {
    const response = await fetch(`http://${serverInfo.ip}:${renderServerPort}/unbind`,
      { method: "POST" }
    );

    if (!response.ok) {
      res.status(500).send({ error: "Conflicto entre el contenido de la base de datos y el estado local del servidor, se intentará eliminar de todas formas" });
      responseSent = true;
    }

  } catch (error) {
    res.status(500).send({ error: "Error en la conexión con el servidor de renderizado, se intentará eliminar de todas formas" });
    responseSent = true;
  }

  // No hacemos return en los casos de error anteriores porque
  // queremos eliminar el servidor de todas formas, tratando de 
  // evitar que se quede en el sistema si hay problemas con este

  // Borrar info del servidor de la BD
  let deletedServer = null;
  try {
    deletedServer = await Server.findByIdAndRemove(req.params.id);
  } catch (error) {
    console.error(`Error interno al intentar borrar el servidor de la base de datos. ${error}`);
    if (!responseSent) {
      res.status(500).send({ error: "Error interno al intentar borrar el servidor de la base de datos" });
    }
    return;
  }

  // Todo bien
  if (!responseSent) {
    res.status(200).send({ message: "Servidor eliminado con éxito", deletedServer });
  }

};

export { getServers, getServerById, addServer, disableServer, enableServer, deleteServer, abortServer };
