let currentStatus;

// Para debugging
// setInterval(() => console.log(currentStatus.description.cyan), 100);

const getStatus = () => currentStatus;

const setStatus = (newStatus) => (currentStatus = newStatus);

export { getStatus, setStatus };
