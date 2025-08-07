// app.js (correct order)
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const userRouter = require("./routes/user.routes");
const connectToDB = require("./config/db");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index.route");

connectToDB();

const app = express();

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/upload", require("./routes/upload-files.route"));
app.use("/user", userRouter);

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});
