let currentStatus;
let estimatedRemainingProcessingTime;

// Para debugging
setInterval(() => console.log(currentStatus.description.cyan), 5000);

const getStatus = () => currentStatus;

const setStatus = (newStatus) => (currentStatus = newStatus);

const getEstimatedRemainingProcessingTime = () => estimatedRemainingProcessingTime;

const setEstimatedRemainingProcessingTime = (newEstimatedRemainingProcessingTime) => (estimatedRemainingProcessingTime = newEstimatedRemainingProcessingTime);


export { getStatus, setStatus, getEstimatedRemainingProcessingTime, setEstimatedRemainingProcessingTime };
