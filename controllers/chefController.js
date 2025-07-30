const fs = require("fs/promises");
const fs_sync = require("fs"); // temporary.
const path = require("path");

const connectionStringChefs = path.join(__dirname, "../db/chefs.json");
const connectionStringRes = path.join(__dirname, "../db/restaurants.json");
// Temporary Synchronous version.
const chefs = JSON.parse(fs_sync.readFileSync(connectionStringChefs, "utf-8"));
const restaurants = JSON.parse(
  fs_sync.readFileSync(connectionStringRes, "utf-8")
);

exports.checkID = async (req, res, next, val) => {
  const chef = await chefs.find((el) => parseInt(val) === el.id);
  if (!chef)
    return res.status(404).json({
      status: "fail",
      message: "ID not found",
    });
  next();
};

exports.getAllChefs = (req, res) => {
  // Query chefs by restaurantid
  const allChefs = req.query.restaurantid
    ? chefs.filter((el) => el.restaurantid === req.query.restaurantid * 1)
    : chefs;

  console.log(req.query);
  res.status(200).json({
    status: "success",
    data: {
      allChefs,
    },
  });
};

exports.getChef = async (req, res) => {
  // finds el with id and returns it
  chef = await chefs.find((el) => req.params.id * 1 === el.id);
  res.status(200).json({
    status: "success",
    data: {
      chef,
    },
  });
};

exports.createChef = async (req, res) => {
  // creates new id.

  const newID = chefs.length === 0 ? 1 : chefs[chefs.length - 1].id + 1;
  const newChef = Object.assign({ id: newID }, req.body); // assings new id to body
  chefs.push(newChef); // inserts previous obj into array
  await fs.writeFile(connectionStringChefs, JSON.stringify(chefs));
  res.status(201).json({
    status: "success",
    data: {
      newChef,
    },
  });
};

exports.updateChef = async (req, res) => {
  const index = chefs.findIndex((el) => el.id === req.params.id * 1);
  chef = chefs[index];
  chefs[index] = { ...chefs[index], ...req.body }; // spread operator to assign new values to the obj.
  await fs.writeFile(connectionStringChefs, JSON.stringify(chefs));
  res.status(200).json({
    status: "success",
    data: {
      chef,
    },
  });
};

exports.deleteChef = async (req, res) => {
  const index = chefs.findIndex((el) => el.id === req.params.id * 1); // finds index of the chefs array where condition is met.
  const chef = chefs[index]; // saves object
  chefs.splice(index, 1); // deletes 1 position after specified index
  await fs.writeFile(connectionStringChefs, JSON.stringify(chefs));
  res.status(204).json({
    status: "success",
    data: {
      chef,
    },
  });
};

exports.assignRestaurant = async (req, res) => {
  const chefId = req.params.id * 1;
  const index = chefs.findIndex((el) => el.id === chefId);
  const restaurantid = req.body.restaurantid;
  const restaurant = restaurants.find((el) => el.id === restaurantid);
  const restaurantIndex = restaurants.findIndex((el) => el.id === restaurantid);
  // Validates restaurant exists in DB.
  if (!restaurant) {
    return res.status(404).json({
      status: "fail",
      message: "Restaurant not found",
    });
  }
  const chef = chefs[index];
  chefs[index] = {
    ...chefs[index],
    ...{ restaurantid: restaurantid }, // spread operator to assign new values to the obj.
  };

  if (!Array.isArray(restaurant.chefs)) {
    // Initializes the array if not found
    restaurants[restaurantIndex].chefs = [];
  }

  if (!restaurant.chefs.includes(chefId)) {
    // Validates the restaurant doesn't have that chef already assigned.
    restaurants[restaurantIndex].chefs.push(chefId);
  }
  await fs.writeFile(connectionStringRes, JSON.stringify(restaurants, null));
  await fs.writeFile(connectionStringChefs, JSON.stringify(chefs));

  res.status(200).json({
    status: "success",
    data: {
      chef,
    },
  });
};

exports.transferChef = async (req, res) => {
  const chefId = req.params.id * 1;
  const restaurantid = req.body.restaurantid * 1;

  const index = chefs.findIndex((el) => el.id === chefId);
  const restaurantIndex = restaurants.findIndex((el) => el.id === restaurantid);

  // Validates new restaurant exists
  if (restaurantIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: "New restaurant not found",
    });
  }

  // obtain current restaurand id and index
  const chef = chefs[index];
  const currentRestaurantId = chef.restaurantid;

  //
  if (!currentRestaurantId) {
    return res.status(400).json({
      status: "fail",
      message:
        "Chef is not currently assigned to any restaurant. Use assignRestaurant instead.",
    });
  }

  // Validar que no se está transfiriendo al mismo restaurante
  if (currentRestaurantId === restaurantid) {
    return res.status(400).json({
      status: "fail",
      message: "Chef is already assigned to this restaurant",
    });
  }

  // Finds current restaurant
  const currentRestaurantIndex = restaurants.findIndex(
    (el) => el.id === currentRestaurantId
  );

  if (currentRestaurantIndex === -1) {
    return res.status(500).json({
      status: "error",
      message: "Current restaurant not found in database",
    });
  }

  // remove chef from current restaurant
  if (Array.isArray(restaurants[currentRestaurantIndex].chefs)) {
    restaurants[currentRestaurantIndex].chefs = restaurants[
      currentRestaurantIndex
    ].chefs.filter((id) => id !== chefId);
  }

  // creates array of chefs on new restaurant if not exists
  if (!Array.isArray(restaurants[restaurantIndex].chefs)) {
    restaurants[restaurantIndex].chefs = [];
  }

  // adds cheft to new restaurant
  if (!restaurants[restaurantIndex].chefs.includes(chefId)) {
    restaurants[restaurantIndex].chefs.push(chefId);
  }

  // uppdates chef with new restaurant
  chefs[index] = {
    ...chefs[index],
    restaurantid: restaurantid,
  };

  // wirtes files
  await fs.writeFile(connectionStringRes, JSON.stringify(restaurants, null, 2));
  await fs.writeFile(connectionStringChefs, JSON.stringify(chefs, null, 2));

  res.status(200).json({
    status: "success",
    message: `Chef transferred from restaurant ${currentRestaurantId} to restaurant ${restaurantid}`,
    data: {
      chef: chefs[index],
      previousRestaurant: currentRestaurantId,
      newRestaurant: restaurantid,
    },
  });
};
