const {Router} = require('express')
const authRouter = Router()
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")



/** 
* @route POST /api/auth/register
* @description Register a new user
* @access Public
*/
authRouter.post("/register",authController.registerUserController)
/** 
* @route POST /api/auth/login
* @description login user
* @access Public
*/
authRouter.post("/login",authController.loginUserController)
authRouter.get("/logout",authController.logoutUserController)
authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController)


module.exports = authRouter;