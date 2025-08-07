const mongoose = require("mongoose");

function connectToDB() {
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => {
			console.log("Connected to MongoDB");
		})
		.catch((err) => {
			console.error(err.message);
		});
}

module.exports = connectToDB;
