 if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const MongoStore = require("connect-mongo");
const app = express();

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/DataBase";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");

const  flash=require("connect-flash");

const ExpressError =require("./utils/ExpressError.js");
const reviews = require("./routes/review.js");
const listings = require("./routes/listing"); 
const passport=require("passport");

const LocalStrategy = require('passport-local').Strategy;
const User=require("./models/users.js");
const userRouter=require("./routes/user.js");

// DB connection
async function main() {
    await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));



const sessionOptions = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
  }),
  secret: process.env.SESSION_SECRET || "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
// Default route
// app.get("/", (req, res) => {
//     res.send("Server is running");
// });
 

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res, next)=>{
  res.locals.success=req.flash("success");
    res.locals.error = req.flash("error"); 
    res.locals.currUser=req.user;
  

  next();
})


main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });



    // app.get("/demouser",async(req,res)=>{
    //     let fakeUser=new User({
    //         email:"student@gmail.com",
    //         username:"delta-student"
    //     });
    //     let registerUser= await  User.register(fakeUser,"helloworld");
    //     res.send(registerUser);
    // });


app.use("/listings", listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",userRouter);

app.all("/*splat", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// General Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Start server only when running locally
if (require.main === module) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`Server is connected at port ${port}`);
    });
}

module.exports = app;

