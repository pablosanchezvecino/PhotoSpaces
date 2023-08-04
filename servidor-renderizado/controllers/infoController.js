import { getStatus, getLatestRequest, getEstimatedRemainingProcessingTime } from "../serverStatus.js";

// Función asociada al endpoint que devuelve el tiempo restante estimado del proceso de renderizado

const handleEstimatedRemainingProcessingTimeRequest = async (req, res) => {
  res.status(200).send(
    { 
      estimatedRemainingProcessingTime: getEstimatedRemainingProcessingTime(),
      status: getStatus().description,
      latestRequest: getLatestRequest()
    }
  );
};

export { handleEstimatedRemainingProcessingTimeRequest };