const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 9000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// In-memory storage for stories
let stories = []; // Temporary storage for stories

// Ensure uploads directory exists
const ensureUploadsDirectory = () => {
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
  }
};
ensureUploadsDirectory();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Unique file name
  },
});
const upload = multer({ storage });

// API routes

/**
 * @route GET /stories
 * @desc Retrieve all stories
 */
app.get("/stories", (req, res) => {
  try {
    res.status(200).json(stories); // Send the stories array
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

/**
 * @route POST /stories
 * @desc Add a new story with an optional front cover
 */
app.post("/stories", upload.single("front_cover"), (req, res) => {
  try {
    const { title, author, content } = req.body;

    // Validate required fields
    if (!title || !author || !content) {
      return res
        .status(400)
        .json({ error: "Title, author, and content are required." });
    }

    const story = {
      id: stories.length + 1, // Auto-increment ID
      title,
      author,
      content: JSON.parse(content), // Parse content array
      front_cover: req.file ? `/uploads/${req.file.filename}` : null, // Handle uploaded file
    };

    stories.push(story);
    res.status(201).json(story); // Respond with the created story
  } catch (error) {
    console.error("Error handling story submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route POST /upload
 * @desc Upload a single file and return its file path
 */
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;
    res.status(201).json({ filePath }); // Return the file path for the uploaded file
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @route All undefined routes
 * @desc Handle undefined routes
 */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
