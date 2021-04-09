const { exec } = require("child_process");
const fs = require("fs");

const execute = async (data, filename) => {
  exec(
    `blender -b -P src\\services\\blender\\renderScript.py -- ${filename} ${data.lens} ${data.clip_start} ${data.clip_end} ${data.location_x} ${data.location_y} ${data.location_z} ${data.qua_w} ${data.qua_x} ${data.qua_y} ${data.qua_z}`,
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

exports.upload = async (body, model) => {
  fs.writeFile(
    `./public/uploads/${model.md5}.gltf`,
    Buffer.from(model.data),
    (err) => {
      if (err) throw err;
      execute(JSON.parse(body.data), model.md5);
    }
  );

  return { eh: "eh" };
  throw new Error("Bad request.");
};
