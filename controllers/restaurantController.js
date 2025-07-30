const fs = require("fs/promises");
const fs_sync = require("fs"); // temporary.
const path = require("path");

const connectionStringRes = path.join(__dirname, "../db/restaurants.json");
// Temporary Synchronous version.
const restaurants = JSON.parse(
  fs_sync.readFileSync(connectionStringRes, "utf-8")
);

exports.checkID = async (req, res, next, val) => {
  const restaurant = await restaurants.find((el) => parseInt(val) === el.id);
  if (!restaurant)
    return res.status(404).json({
      status: "fail",
      message: "ID not found",
    });
  next();
};

exports.getAllRestaurants = (req, res) => {
  // query restaurants by chef id
  const allRestaurants = req.query.chefid
    ? restaurants.filter((el) => el.chefs.includes(req.query.chefid * 1))
    : restaurants;

  res.status(200).json({
    status: "success",
    data: {
      allRestaurants,
    },
  });
};

exports.getRestaurant = async (req, res) => {
  restaurant = restaurants.find((el) => el.id === req.params.id * 1);
  res.status(200).json({
    status: "success",
    data: {
      restaurant,
    },
  });
};

exports.createRestaurant = async (req, res) => {
  const newID =
    restaurants.length === 0 ? 1 : restaurants[restaurants.length - 1].id + 1;
  newRestaurant = Object.assign({ id: newID }, req.body);
  restaurants.push(newRestaurant);
  await fs.writeFile(connectionStringRes, JSON.stringify(restaurants));
  res.status(201).json({
    status: "success",
    data: {
      newRestaurant,
    },
  });
};

exports.updateRestaurant = async (req, res) => {
  const index = restaurants.findIndex((el) => el.id === req.params.id * 1);
  restaurant = restaurants[index];
  restaurants[index] = { ...restaurants[index], ...req.body };
  await fs.writeFile(connectionStringRes, JSON.stringify(restaurants));
  res.status(200).json({
    status: "success",
    data: {
      restaurant,
    },
  });
};

exports.deleteRestaurant = async (req, res) => {
  const index = restaurants.findIndex((el) => el.id === req.params.id * 1);
  restaurant = restaurants[index];
  restaurants.splice(index, 1);
  await fs.writeFile(connectionStringRes, JSON.stringify(restaurants));
  res.status(204).json({
    status: "success",
    data: {
      restaurant,
    },
  });
};
