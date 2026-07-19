const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

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

// index route
app.get("/", (req, res) => {
    res.send(`this is index route...`);
});

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
    res.render("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/views/listings/index.ejs", { findall });
});

// create new route
app.get("/listing/new", (req, res) => {
    res.render("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/views/listings/new.ejs");
});

// show particular route
app.get("/listing/:id", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/views/listings/show.ejs", { listing });
});

app.post("/listing", async (req, res) => {
    const newData = req.body.list;
    console.log(newData);

    await Listing.insertOne({
        title: newData.title,
        description: newData.description,
        image:{
            url: newData.url,
        },
        price: newData.price,
        country: newData.country,
        location: newData.location,
    }).then((res) => {
        console.log(res);
    })
        .catch((err) => {
            console.log(err);
        });

    res.redirect("/listing");
});

app.get("/listing/:id/edit", async (req, res) => {
    const { id } = req.params;
    const find = await Listing.findById(id);

    res.render("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/views/listings/edit.ejs", { find });
    // console.log({find});
});

app.put("/listing/:id", async (req, res) => {
    const { id } = req.params;
    // await Listing.findByIdAndUpdate(id, {...req.body.find})
    //     .then((res) => {console.log(res)})
    //     .catch((err) => {console.log(err)});

    const { title, description, imgurl ,price, location, country } = req.body;
    await Listing.findByIdAndUpdate(id, {
        title: title,
        description: description,
        image: {url: imgurl},
        price: price,
        country: country,
        location: location,
    }).then((res) => {
        console.log(res)
    })
        .catch((err) => {
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

