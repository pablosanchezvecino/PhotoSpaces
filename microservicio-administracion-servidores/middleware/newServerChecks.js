const checkRequestBody = (err, req, res, next) => {
    
  // Extraer IP del cuerpo de la petición
  const renderingServerIP = req.body.ip;

  // Si no es posible extraer la IP, informar del error
  if (renderingServerIP === undefined) {
    res.status(400).send({
      error:
        "No se encontró la IP del servidor de renderizado en el cuerpo de la petición",
    });
  } else if (false) {

  } else {
    next(err, req, res, next);
  }

   
}