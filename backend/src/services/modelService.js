const modelFacade = require("../dao/modelFacade");

exports.upload = async (req, res, next) => {
  try {
    console.log(req.body);
    res.status(201).json(await modelFacade.upload(req.body));
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
