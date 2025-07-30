const app = require("./app");
const dotenv = require("dotenv").config();

port = process.env.PORT;

app.listen(port, () => {
  console.log("Listening in port ", port);
});
