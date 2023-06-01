let currentStatus;
let estimatedRemainingProcessingTime;

// Para debugging
setInterval(() => console.log(currentStatus.description.cyan), 500);

const getStatus = () => currentStatus;

const setStatus = (newStatus) => (currentStatus = newStatus);

const getEstimatedRemainingProcessingTime = () => estimatedRemainingProcessingTime;

const setEstimatedRemainingProcessingTime = (newEstimatedRemainingProcessingTime) => (estimatedRemainingProcessingTime = newEstimatedRemainingProcessingTime);


export { getStatus, setStatus, getEstimatedRemainingProcessingTime, setEstimatedRemainingProcessingTime };
