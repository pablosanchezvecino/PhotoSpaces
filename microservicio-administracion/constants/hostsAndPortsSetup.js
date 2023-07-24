const renderServerPort = process.env.RENDER_SERVER_PORT || 3000;

const requestHandlingMicroserviceHost = process.env.REQUEST_HANDLING_MICROSERVICE_HOST || "127.0.0.1";

const requestHandlingMicroservicePort = process.env.REQUEST_HANDLING_MICROSERVICE_PORT || 9001;

export { renderServerPort, requestHandlingMicroserviceHost, requestHandlingMicroservicePort };