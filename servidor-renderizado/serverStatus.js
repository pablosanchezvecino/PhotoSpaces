let currentStatus;
let latestRequest;
let estimatedRemainingProcessingTime;

// Para debugging
setInterval(() => console.log(currentStatus.description.cyan + " " + latestRequest.cyan), 1000);

const getStatus = () => currentStatus;

const setStatus = (newStatus) => (currentStatus = newStatus);

const getLatestRequest= () => latestRequest;

const setLatestRequest = (newRequest) => (latestRequest = newRequest);

const getEstimatedRemainingProcessingTime = () => estimatedRemainingProcessingTime;

const setEstimatedRemainingProcessingTime = (newEstimatedRemainingProcessingTime) => (estimatedRemainingProcessingTime = newEstimatedRemainingProcessingTime);

export { 
  getStatus, 
  setStatus, 
  getLatestRequest, 
  setLatestRequest, 
  getEstimatedRemainingProcessingTime, 
  setEstimatedRemainingProcessingTime 
};
