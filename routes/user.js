const express = require("express");
const router = express.Router();
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { Passport } = require("passport");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
 const  userController=require("../controllers/users.js");
// Show signup form
router.get("/signup",userController.renderSignupForm );

// Handle signup logic
router.post("/signup", wrapAsync(userController.signup));


router.get("/login",userController.loginForm);

router.post("/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
 userController.login
);



router.get("/logout",userController.logout);
module.exports = router;
