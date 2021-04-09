const renderFacade = require("../dao/renderFacade");

exports.upload = async (req, res, next) => {
  try {
    res.status(201).json(await renderFacade.upload(req.body, req.files.model));
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
