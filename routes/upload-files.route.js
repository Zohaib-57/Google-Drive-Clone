const express = require("express");
const multer = require("multer");
const supabase = require("../config/supabaseClient.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory for easy upload

console.log("Upload route file loaded");

router.post("/upload-file", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded." });
		}

		const file = req.file;
		const bucket = "userfiles"; // Make sure you created this bucket in Supabase storage

		// Create unique filename to avoid conflicts
		const fileName = `${Date.now()}_${file.originalname}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from(bucket)
			.upload(fileName, file.buffer, {
				contentType: file.mimetype,
			});

		if (error) {
			throw error;
		}

		// Get public URL for the uploaded file
		const { data: publicUrlData } = supabase.storage
			.from(bucket)
			.getPublicUrl(fileName);

		res.json({
			message: "File uploaded successfully",
			fileUrl: publicUrlData.publicUrl,
		});
	} catch (err) {
		console.error("Upload error:", err.message);
		res.status(500).json({ error: "Failed to upload file." });
	}
});

module.exports = router;
