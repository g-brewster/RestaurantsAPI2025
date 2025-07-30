const express = require("express");
const chefController = require("../controllers/chefController");
const validateBody = require("../middlewares/validators");

router = express.Router();

router.param("id", chefController.checkID); // Middleware to validate parameter id.

router
  .route("/")
  .get(chefController.getAllChefs)
  .post(validateBody, chefController.createChef); // middleware to validate body

router
  .route("/:id")
  .get(chefController.getChef)
  .patch(validateBody, chefController.updateChef)
  .delete(chefController.deleteChef);

router.route("/:id/assign").post(validateBody, chefController.assignRestaurant);
router.route("/:id/transfer").post(validateBody, chefController.transferChef);

module.exports = router;
