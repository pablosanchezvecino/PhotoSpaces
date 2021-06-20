let timeEstimation = {
  file: "",
  time: 0,
  remaining: 0,
};

export function getTimeEstimation() {
  return timeEstimation;
}

export function setTimeEstimation(newTime) {
  timeEstimation.file = newTime.file;
  timeEstimation.time = newTime.time;
  timeEstimation.remaining = newTime.remaining;
}
