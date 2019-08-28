var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if(req.isAuthenticated()){
        // Does the user own the Campground
        Campground.findById(req.params.id, (err, foundCampground) => {
                if (err || !foundCampground) {
                    req.flash("error", "campground not found");
                    res.redirect("back");
                } else {
                    if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    } else {
                        req.flash("error","you don't have permission to do that!");
                        res.redirect("back");
                    }
                }
            });
    } else {
        // console.log("need to be logged in to do that");
        req.flash("error", "you need to be logged in to do that!");
        res.redirect("/login");
    }
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
    // is User signed in
    if(req.isAuthenticated()){
        // Find the Comment
        Comment.findById(req.params.comment_id, (err, foundComment) => {
                if (err || !foundComment) {
                    req.flash("error", "comment not found");
                    res.redirect("back");
                } else {
                    // is the author the user
                    if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                        next();
                    } else {
                        req.flash("error","you don't have permission to do that!");
                        res.redirect("/login");
                    }
                }
            });
    } else {
        // console.log("need to be logged in to do that");
        req.flash("error", "you need to be logged in to do that!");
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You need to be logged in to do that!")
    res.redirect("/login");
}


module.exports = middlewareObj;