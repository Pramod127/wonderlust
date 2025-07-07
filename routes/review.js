const express = require("express");
const router = express.Router({mergeParams:true});//review
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError =require("../utils/ExpressError.js")
const {reviewSchema }=require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController=require("../controllers/reviews.js");



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
//post route
router.post("/",isLoggedIn, validateReview ,wrapAsync(reviewController.createReview));
//delete route 
router.delete("/:reviewId" ,
  
  isLoggedIn,
  isReviewAuthor,
  wrapAsync
  (reviewController.deleteRoute));
module.exports=router;
