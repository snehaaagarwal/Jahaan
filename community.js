const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1s012345",
    database: "jahaan"
});

// Get all community posts
router.get("/", async (req, res) => {
    try {
        const [posts] = await pool.query(
           "SELECT id, name, message, created_at FROM posts ORDER BY id DESC"
        );

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load posts" });
    }
});

// Create a new community post
router.post("/", async (req, res) => {
    const { name, message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            error: "Message cannot be empty"
        });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO posts (name, message) VALUES (?, ?)",
            [name?.trim() || "Traveller", message.trim()]
        );

        res.status(201).json({
            id: result.insertId,
            name: name?.trim() || "Traveller",
            message: message.trim()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save post" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await pool.execute(
            "DELETE FROM posts WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not delete post"
        });
    }
});

router.get("/:postId/comments", async (req, res) => {
    try {
        const [comments] = await pool.execute(
            "SELECT * FROM comments WHERE post_id = ? ORDER BY id DESC",
            [req.params.postId]
        );

        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not load comments" });
    }
});

router.post("/:postId/comments", async (req, res) => {
    const { comment,name } = req.body;

    if (!comment || !comment.trim()) {
        return res.status(400).json({
            error: "Comment cannot be empty"
        });
    }

    try {
        const [result] = await pool.execute(
            "INSERT INTO comments (post_id,name, comment) VALUES (?, ?,?)",
           [
    req.params.postId,
    name?.trim() || "Traveller",
    comment.trim()
]
        );

        res.status(201).json({
            id: result.insertId,
            post_id: req.params.postId,
            comment: comment.trim()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not save comment" });
    }
});


module.exports = router;