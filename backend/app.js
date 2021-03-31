const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const morgan = require("morgan");
const formData = require("express-form-data");
const os = require("os");
const bodyParser = require("body-parser");

/* Middleware */
app.use(morgan("dev"));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: false }));

// for parsing multipart/form-data
// parse data with connect-multiparty.
app.use(
  formData.parse({
    uploadDir: os.tmpdir(),
    autoClean: true,
  })
);
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

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
const routes = require(root + "/renderRoute");

app.use("/render", routes);

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
