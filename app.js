require("dotenv").config();

const express   = require("express"),
app             = express(),
bodyParser      = require("body-parser"),
mongoose        = require("mongoose"),
passport        = require("passport"),
flash           = require("connect-flash"),
localStrategy   = require("passport-local");
Campground      = require("./models/campground"),
Comment         = require("./models/comment"),
User            = require("./models/user"),
seedDB          = require("./seeds"),
methodOverride  = require("method-override");

// REQUIRING ROUTES
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");




mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+"/public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require("moment");

// seedDB(); //seed the database
 
// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "This is the secret!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MIDDLEWARE

// passes currentUser to all routes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// INCLUDING OF ROUTES
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// Starting server to listen on port 3000
app.listen(3000,()=>{
    console.log("YelpCamp server starting!");
});