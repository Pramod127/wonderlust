
const Listing = require("../models/listing.js");
module.exports.index =async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm=(req, res) => {
res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner"); 

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
}



module.exports.createListing=async (req, res) => {
   let url= req.file.path;
   let filename=req.file.filename;
  

  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;
  newListing.image={url,filename};
  await newListing.save();
  req.flash("success","new Listing created!");
  
  res.redirect("/listings");
}
module.exports.updateListing=async (req, res) => {
   
  const { id } = req.params;
  const updatedListingData = req.body.listing;

  if (typeof updatedListingData.image === "string") {
    updatedListingData.image = {
      url: updatedListingData.image,
      filename: "manual"
    };
  }

  let listing =await Listing.findByIdAndUpdate(id, updatedListingData, {
    new: true,
    runValidators: true
  });
  if( typeof req.file!=="undefined"){
  let url= req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
await listing.save();
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};
module.exports.renderEditForm=async(req,res)=>{

    let{id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
       res.render("listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.deleteListing=async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
};