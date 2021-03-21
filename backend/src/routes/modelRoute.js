const express = require("express");
const router = express.Router();
const service = require("../services/modelService");

router.post("/", service.upload);
/*
router.get("/", templateService.findAll);
router.get("/:id", templateService.findById);
router.delete("/:id", templateService.delete);
router.put("/:id", templateService.put);
*/

module.exports = router;
