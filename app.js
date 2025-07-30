const express = require("express");
const chefRouter = require("./routes/chefRouter");
const restaurantRouter = require("./routes/restaurantRouter");

const app = express();

app.use(express.json()); // Allow json in request body.

app.use("/api/v1/chefs", chefRouter);
app.use("/api/v1/restaurants", restaurantRouter);

module.exports = app;
