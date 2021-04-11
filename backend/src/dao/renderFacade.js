const { execSync } = require("child_process");
const fs = require("fs");

const execute = async (data, filename) => {
  execSync(
    `blender -b -P src\\services\\blender\\renderScript.py -- ${filename} ${data.lens} ${data.clip_start} ${data.clip_end} ${data.location_x} ${data.location_y} ${data.location_z} ${data.qua_w} ${data.qua_x} ${data.qua_y} ${data.qua_z}`
  );
};

exports.upload = async (body, model) => {
  fs.writeFileSync(`./public/${model.md5}.gltf`, Buffer.from(model.data));

  await execute(JSON.parse(body.data), model.md5);

  return model.md5;
};

exports.deleteTempFiles = (fileName) => {
  fs.unlink(`./public/${fileName}.gltf`, (err) => {
    if (err) throw err;
  });
  fs.unlink(`./public/${fileName}.png`, (err) => {
    if (err) throw err;
  });
};
