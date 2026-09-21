const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/models/listing.js");
const Review = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/models/review.js")
const {reviewSchema} = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/schema.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const ExpressError = require("../11_middlewares/ExpressError.js");
const CookieParser = require("cookie-parser");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(CookieParser());

const mongoUrl = "mongodb://127.0.0.1:27017/airbnb";

main()
    .then(() => {
        console.log(`DB connected...`);
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongoUrl);
}

app.listen(8080, () => {
    console.log(`server running on 8080`)
})

// ************************SERVER SIDE REVIEWS VALIDATION********************************

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

// ***************************************************************************************

// index route
app.get("/", (req, res) => {
    res.send(`this is index route...`);
});

app.get("/greet", (req, res) => {
    let {name = 'anonymous'} = req.cookies;
    res.send(`hello ${name}`);
})

// app.get("/listing", (req, res) => {
//    Listing.insertOne({
//     title: "whitefield",
//     description: "afjdnfasdfsdafdsaf",
//     image: "dsfdfadfsd",
//     price: 25000,
//     location: "bangalore",
//     country: "india",
//    })
//    .then((res) => {console.log(res)})
//    .catch((err) => {console.log(err)});

//    res.send(`db added...`);
// })

// show all route

app.get("/listing", async (req, res) => {
    const findall = await Listing.find({});
    res.render("./listings/index.ejs", { findall });
});

// create new route
app.get("/listing/new", (req, res) => {
    res.render("./listings/new.ejs");
});

// show particular route
app.get("/listing/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs", { listing });
});

app.post("/listing", wrapAsync(async (req, res, next) => {

    const newData = req.body.list;
    console.log(newData);

    await Listing.insertOne({
        title: newData.title,
        description: newData.description,
        image: {
            url: newData.url,
        },
        price: newData.price,
        country: newData.country,
        location: newData.location,
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        console.log(err);
    });

    res.redirect("/listing");

}));

app.get("/listing/:id/edit", async (req, res) => {
    const { id } = req.params;
    const find = await Listing.findById(id);

    res.render("./listings/edit.ejs", { find });
    // console.log({find});
});

app.put("/listing/:id", async (req, res) => {
    const { id } = req.params;
    // await Listing.findByIdAndUpdate(id, {...req.body.find})
    //     .then((res) => {console.log(res)})
    //     .catch((err) => {console.log(err)});

    const { title, description, imgurl, price, location, country } = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        image: { url: imgurl },
        price: price,
        country: country,
        location: location,
    }).then((res) => {
        console.log(res)
    }).catch((err) => {
            console.log(err)
        });
    res.redirect(`/listing/${id}`);
});

app.delete("/listing/:id", async (req, res) => {
    const { id } = req.params;
    let del = await Listing.findByIdAndDelete(id)
        .then((res) => { console.log(res) })
        .catch((err) => { console.log(err) });
    res.redirect("/listing");
});

// **********************REVIEW ROUTE**********************

app.post("/listing/:id/reviews", validateReview, wrapAsync( async (req, res) => {
    let listreview = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listreview.reviews.push(newReview);

    await newReview.save();
    await listreview.save();

    res.redirect(`/listing/${listreview._id}`);
}));

// ********************************************************

// delete review
app.delete("/listing/:id/reviews/:reviewid", wrapAsync( async(req, res) => {
    const {id, reviewid} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewid}});
    await Review.findByIdAndDelete(reviewid);

    res.redirect(`/listing/${id}`);
}))

app.use((req, res, next) => {
    // next(new ExpressError(404, "page not found !"));
    throw new ExpressError(404, "page not found");
});

// middlewares
app.use((err, req, res, next) => {
    let { status = 500, message = "something broke!" } = err;
    // res.status(status).send(message);
    res.render("./listings/error.ejs", { message });
});



