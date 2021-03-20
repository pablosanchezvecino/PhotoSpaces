const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const morgan = require("morgan");

/* Middleware */
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

/* Routes */
const root = "./src/routes";
const templateRoutes = require(root + "/templates");

app.use("/templates", templateRoutes);

/*Error Route*/

app.use((req, res, next) => {
  const error = new Error(
    "Method " + req.method + " for " + req.originalUrl + " not found"
  );
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

/* Listen */
app.listen(port, () => {
  console.log("> Server Running at http://localhost:" + port);
});
