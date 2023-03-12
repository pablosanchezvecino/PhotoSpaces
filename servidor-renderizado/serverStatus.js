const ServerStates = require("./constants/serverStatesEnum.js");

let currentStatus;

// Para debugging
setInterval(() => console.log(currentStatus.description.cyan), 1000);

const getStatus = () => currentStatus;

const setStatus = (newStatus) => (currentStatus = newStatus);


module.exports = {
  getStatus,
  setStatus
};
