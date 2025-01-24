import express from "express";
import dotenv from "dotenv";
import queryDB from "./db.js";
import cors from "cors";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await queryDB("SELECT * FROM posts");
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get user by ID
app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await queryDB("SELECT * FROM posts WHERE id = $1", [id]);
    if (!user.length) {
      return res.status(404).json({ message: `posts with ID ${id} not found` });
    }
    res.json(user[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Create a new user
app.post("/posts", async (req, res) => {
  const { author, title, content, cover } = req.body;
  try {
    const newPost = await queryDB(
      "INSERT INTO posts (author, title, content, cover) VALUES ($1, $2, $3, $4) RETURNING *",
      [author, title, content, cover]
    );
    res.status(201).json(newPost[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database insertion failed" });
  }
});

// Update user by ID
app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { author, title, content, cover } = req.body;

  try {
    const updatedUser = await queryDB(
      "UPDATE posts SET author = $1, title = $2, content = $3 cover = $4 RETURNING *",
      [author, title, content, cover]
    );
    if (!updatedUser.length) {
      return res.status(404).json({ message: `posts with ID ${id} not found` });
    }
    res.json(updatedUser[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database update failed" });
  }
});

// Delete user by ID
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await queryDB(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [id]
    );
    if (!deletedUser.length) {
      return res.status(404).json({ message: `posts with ID ${id} not found` });
    }
    res.json(deletedUser[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database deletion failed" });
  }
});

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
