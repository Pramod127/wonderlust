const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema ,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
//const listings = require("../routes/listing"); //  make sure the path is correct
const {isLoggedIn,isOwner}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer=require("multer");
const{storage}=require("../cloudConfig.js");

const upload=multer({storage});


//  validateListing middleware
const validateListing = (req, res, next) => {
  
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//  validateReview middleware
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

router
.route("/")
.get( wrapAsync(listingController.index))
.post(
  isLoggedIn, 
  upload.single('listing[image]'),
  validateListing,
   wrapAsync(listingController.createListing)
);



//  Index Route - Show all listings
//router.get("/", wrapAsync(listingController.index));

//  New Listing Form
router.get("/new",isLoggedIn ,listingController.renderNewForm);

// Show Route - Single listing with reviews
router.get("/:id", isLoggedIn,  wrapAsync(listingController.showListing));


//  Create Listing
//router.post("/",isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//  Edit Form
router.get("/:id/edit",isLoggedIn,isOwner ,wrapAsync(listingController.renderEditForm));

//  Update Listing
router.put("/:id", isLoggedIn, isOwner,  upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing));



//  Delete Listing
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.deleteListing));

//  Create Review
router.post("/:id/reviews", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id; 
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "Review Added!");
  res.redirect(`/listings/${listing._id}`);
}));


//  Delete Review
router.delete("/:id/reviews/:reviewId",isLoggedIn, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
   req.flash("success","Review Deleted1!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;
