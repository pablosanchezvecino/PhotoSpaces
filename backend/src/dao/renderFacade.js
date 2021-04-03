const { exec } = require("child_process");

const execute = async (data) => {
  exec(
    `blender -b -P src\\services\\blender\\renderScript.py -- ${data.lens} ${data.clip_start} ${data.clip_end} ${data.location_x} ${data.location_y} ${data.location_z} ${data.qua_w} ${data.qua_x} ${data.qua_y} ${data.qua_z}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);

        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};

exports.upload = async (body) => {
  //console.log(image);
  execute(JSON.parse(body.data));
  return { eh: "eh" };

  throw new Error("Bad request.");
};
