var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");


router.get("/", (rep,res)=>{
    res.render("landing");
});


// ===========
// AUTH ROUTES
// ===========

// show registration form
router.get("/register", (req, res)=>{
    res.render("register", {page: "register"});
});

//handle sign up logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === "secretcode123"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success",`Welcome to YelpCamp${user.username}`)
            res.redirect("/campgrounds");
        })
    })
});

// show login form
router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
});

// handle login logic
router.post("/login", passport.authenticate("local", 
    {

        failureRedirect: "/login",
        failureFlash: true
    }), (req,res) => {
        req.flash("success",`Welcome ${req.user.username}!`);
        res.redirect("/campgrounds");
});

// logout route

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success","You have logged out!")
    res.redirect("/campgrounds");
})


module.exports = router;