
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const msToTime = (duration) => {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor(duration / (1000 * 60 * 60));

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  
  return hours + ":" + minutes + ":" + seconds;
};


export { wait, msToTime };