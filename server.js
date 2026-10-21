const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.url);
    next();
});
const PORT = 3000;

app.use(express.json());
app.use(cors());

// MySQL database connection
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1s012345",
    database: "jahaan"
});

// Community API
const communityRoutes = require("./community");
app.use("/api/community", communityRoutes);

// Signup API
app.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Please fill in all fields."
        });
    }

    try {
        const cleanEmail = email.trim().toLowerCase();

        const [existing] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), cleanEmail, hashedPassword]
        );

        res.status(201).json({
            message: "Account created successfully!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not create account."
        });
    }
});

// Login API
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter your email and password."
        });
    }

    try {
        const cleanEmail = email.trim().toLowerCase();

        const [users] = await pool.execute(
            "SELECT id, name, email, password FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        res.json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not log in."
        });
    }
});

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to Jahaan Server!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Jahaan API is working!",
        status: "success"
    });
});

// Start server
app.post("/api/login-test", (req, res) => {
    res.json({ message: "Login route is reachable" });
});
app.listen(PORT, () => {
    console.log(`Jahaan server running on http://localhost:${PORT}`);
});