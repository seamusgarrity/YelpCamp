var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", (req,res)=>{
    Campground.find({}, (err, allCampgrounds) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds: allCampgrounds,page:"campgrounds"})
        }
    })
});

// CREATE - post sent to /campgroungs to make new campground in DB
// redirects to INDEX  - /campgrounds

router.post("/", middleware.isLoggedIn, (req, res) =>{
    // res.send("post");
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description= req.body.description;
    var author = {
        id: req.user._id,
        username : req.user.username
    }

    geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
            console.log(err);
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }

    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    
    var newCampground = {name: name, image: image, description: description, author:author, location: location, lat: lat, lng: lng, price: price};
    // camps.push(newCampground);
    Campground.create(newCampground, (err, newCG) => {
            if (err) {
                console.log(err);
            } else {
                // console.log(newCG);
                res.redirect(`/campgrounds/${newCG._id}`);
            }
        }); 
    });
});

// NEW - show form for making new campground

router.get("/new", middleware.isLoggedIn, (req,res)=>{
    res.render("campgrounds/new");
});

//SHOW - shows more info on a campground

router.get("/:id", (req, res) => {
    // find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground) => {
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });

});

// EDIT CAMPGROUND ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground});    
        });

});

// UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    }

    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect(`/campgrounds/${req.params.id}`);
            }
        });
    });
})

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, (err) => {
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    })
});


module.exports = router;