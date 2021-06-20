import { parentPort, workerData } from "worker_threads";
import { spawn } from "child_process";

const timeToMillis = (data, type) => {
  const slice =
    type === "Time"
      ? data.slice(data.indexOf("Time") + 5, data.indexOf("Time") + 14)
      : data.slice(
          data.indexOf("Remaining") + 10,
          data.indexOf("Remaining") + 18
        );
  const time = slice.toString().replace(".", ":").split(":");
  return (
    (parseInt(time[0]) * 60 + parseInt(time[1])) * 1000 + parseInt(time[2])
  );
};

const execute = async (modelData, filename) => {
  const timeEstimation = {
    file: "",
    time: 0,
    remaining: 0,
  };
  const dataString = JSON.stringify(modelData);
  const command = spawn(process.env.BLENDER_CMD || "blender", [
    "-b",
    "-P",
    process.env.BLENDER_SCRIPT || "src/logic/blender/renderScript.py",
    `${filename}`,
    `${dataString}`,
  ]);

  command.stdout.on("data", (data) => {
    if (data.toString().includes("Time")) {
      timeEstimation.file = filename;
      timeEstimation.time = timeToMillis(data.toString(), "Time");
      timeEstimation.remaining = data.toString().includes("Remaining")
        ? timeToMillis(data.toString(), "Remaining")
        : timeEstimation.remaining;
      parentPort.postMessage(JSON.stringify(timeEstimation));
    }
  });

  command.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  command.on("close", (code) => {
    parentPort.postMessage(workerData.fileName);
    process.exit();
  });
};

execute(JSON.parse(workerData.data), workerData.fileName);
