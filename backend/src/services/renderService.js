const renderFacade = require("../dao/renderFacade");

exports.upload = async (req, res, next) => {
  try {
    //console.log(req.body);
    res.status(201).json(await renderFacade.upload(req.body));
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
