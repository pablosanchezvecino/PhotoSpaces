const { exec } = require("child_process");

const execute = async () => {
  exec(
    "blender -b -P src\\services\\blender\\renderScript.py",
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

exports.upload = async (image) => {
  //console.log(image);
  execute();
  return { eh: "eh" };

  throw new Error("Bad request.");
};
