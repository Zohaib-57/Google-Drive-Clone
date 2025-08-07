const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const userModel = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.get("/register", (req, res) => {
	res.render("register");
});

router.post(
	"/register",
	body("email").trim().isEmail().isLength({ min: 13 }),
	body("password").trim().isLength({ min: 5 }),
	body("username").trim().isLength({ min: 3 }),
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array(),
				message: "Invalid Data",
			});
		}

		const { email, username, password } = req.body;

		// Check if username or email already exists
		const existingUser = await userModel.findOne({
			$or: [{ username }, { email }],
		});
		if (existingUser) {
			let message = "";
			if (existingUser.username === username) {
				message = "Username already exists.";
			} else if (existingUser.email === email) {
				message = "Email already exists.";
			}
			return res.status(409).json({ message });
		}

		const hashPassword = await bcrypt.hash(password, 10);
		const newUser = await userModel.create({
			email,
			username,
			password: hashPassword,
		});

		res.status(201).json(newUser);
	}
);

router.get("/login", (req, res) => {
	res.render("login");
});

router.post(
	"/login",
	body("username").trim().isLength({ min: 3 }),
	body("password").trim().isLength({ min: 5 }),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					errors: errors.array(),
					message: "Invalid Data",
				});
			}

			const { username, password } = req.body;
			const user = await userModel.findOne({
				$or: [{ username }, { email: username }],
			});

			if (!user) {
				return res.status(400).json({
					message: "Invalid Credentials. Please try again.",
				});
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res.status(400).json({
					message: "Invalid credentials. Please try again.",
				});
			}

			if (!process.env.JWT_SECRET) {
				return res.status(500).json({
					message:
						"JWT_SECRET is not set in the environment. Please contact the administrator.",
				});
			}

			const token = jwt.sign(
				{
					userId: user._id,
					email: user.email,
					username: user.username,
				},
				process.env.JWT_SECRET
			);

			res.cookie("token", token);
			res.send("Login successful! You can now access your dashboard.");
		} catch (err) {
			console.error("Login error:", err);
			res
				.status(500)
				.json({ message: "An unexpected error occurred during login." });
		}
	}
);

module.exports = router;
