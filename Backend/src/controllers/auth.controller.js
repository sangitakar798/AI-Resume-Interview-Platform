const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/backlist.model")
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
                message: "Account already exists with this email address or username"
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

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax"
        });

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

        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // IMPORTANT: await
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

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

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax"
        });

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
async function logoutUserController(req,res){
    const token = req.cookies.token

    if(token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie("token")
    res.status(200).json({
        message:"User logged out successfully"
    })
}



async function getMeController(req,res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id : user._id,
            username: user.username,
            email: user.email
        }
    })
}






















module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};


