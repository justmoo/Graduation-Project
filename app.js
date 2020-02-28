const app = require("express")();
const bodyParser = require("body-parser");
const indexRoute = require("./routes/indexRoute");
const port = process.env.PORT || process.argv[2];

/// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// routes
app.use("/", indexRoute);

app.listen(
  port,
  console.log(`Welcome aboard captain. All systems online. Port : ${port}.`)
);
