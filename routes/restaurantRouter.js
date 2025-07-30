const express = require("express");
const restaurantController = require("../controllers/restaurantController");
const validateBody = require("../middlewares/validators");

router = express.Router();

router.param("id", restaurantController.checkID);

router
  .route("/")
  .get(restaurantController.getAllRestaurants)
  .post(validateBody, restaurantController.createRestaurant);

router
  .route("/:id")
  .get(restaurantController.getRestaurant)
  .patch(validateBody, restaurantController.updateRestaurant)
  .delete(restaurantController.deleteRestaurant);

module.exports = router;
