const renderFacade = require("../dao/renderFacade");

exports.upload = async (req, res, next) => {
  try {
    console.log("Processing model...");

    const fileName = await renderFacade.upload(req.body, req.files.model);
    const options = {
      root: "./public/",
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };

    res.status(201).sendFile(`${fileName}.png`, options, (err) => {
      if (err) throw err;
      else renderFacade.deleteTempFiles(fileName);
    });
  } catch (e) {
    next(e);
  }
};

/*
exports.findAll = async function (req, res, next) {
  try {
    res.status(200).json(await allFacade.find(Template));
  } catch (err) {
    next(err);
  }
};
*/
