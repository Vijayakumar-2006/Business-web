import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Urban Waves API Running");
});

// simple health check with DB status
app.get("/health", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const dbState = states[mongoose.connection.readyState] || "unknown";
    res.json({ ok: true, db: dbState, uptime: process.uptime() });
});

// Initialize database - create it if it doesn't exist
app.get("/init-db", async (req, res) => {
    try {
        // Check if database exists by trying to list collections
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        // Create a test user to initialize the database
        const testUser = new User({
            name: "Test User",
            email: "test@example.com",
            password: "test123",
            location: {
                houseNo: "",
                street: "",
                city: "Testville",
                pincode: "000000"
            }
        });

        // Check if test user already exists
        const existingUser = await User.findOne({ email: "test@example.com" });
        if (!existingUser) {
            await testUser.save();
            res.json({
                message: "Database initialized successfully",
                database: "urbanwaves",
                collection: "users",
                collections: collections.map(c => c.name)
            });
        } else {
            res.json({
                message: "Database already exists",
                database: "urbanwaves",
                collection: "users",
                collections: collections.map(c => c.name)
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Signup - creates a new user in MongoDB
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, location } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name: name || '', email, password: hashed, location: location || {} });
        await user.save();

        return res.json({ ok: true, user: { email: user.email, name: user.name, location: user.location } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// Login - verifies credentials
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

        return res.json({ ok: true, user: { email: user.email, name: user.name, location: user.location } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// Update Profile - updates user details
app.put('/api/update-profile', async (req, res) => {
    try {
        const { email, name, password, location } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required to identify user' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (location) user.location = location;
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            user.password = hashed;
        }

        await user.save();

        return res.json({ ok: true, user: { email: user.email, name: user.name, location: user.location } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
