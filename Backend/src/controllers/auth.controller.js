const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/backlist.model");

// Cookie configuration for Vercel frontend + Render backend
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/*
 * Register User
 */
async function registerUserController(req, res) {
    try {
        console.log("Register API called");
        console.log("Request body:", req.body);

        const { username, email, password } = req.body;

        const normalizedUsername = username?.trim();
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedUsername || !normalizedEmail || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        console.log("Checking existing user...");

        const isUserAlreadyExist = await userModel.findOne({
            $or: [
                { username: normalizedUsername },
                { email: normalizedEmail }
            ]
        });

        if (isUserAlreadyExist) {
            return res.status(400).json({
                message:
                    "Account already exists with this email address or username"
            });
        }

        console.log("Hashing password...");

        const hash = await bcrypt.hash(password, 10);

        console.log("Creating user...");

        const user = await userModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hash
        });

        console.log("User created:", user._id);

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Store JWT in HTTP-only cookie
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}


/*
 * Login User
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user
        const user = await userModel.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // IMPORTANT:
        // Use the same cookie configuration as Register
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "User login successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}


/*
 * Logout User
 */
async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token;

        // Add token to blacklist
        if (token) {
            await tokenBlacklistModel.create({
                token
            });
        }

        // Remove cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}


/*
 * Get Current User
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User details fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Get user error:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}


module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};