const mongoose = require("mongoose");
const Listing = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/models/listing.js");
const initdata = require("/home/mknasiruddin/Desktop/Coding/Sigma/10_majorProject_01/init/data.js");

const mongoUrl = "mongodb://127.0.0.1:27017/airbnb";

main()
    .then(() => {
        console.log(`DB connected...`);
    })
    .catch((err) => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(mongoUrl);
}

const initdb = async() => {
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log(`data pushed.........`);
}

initdb();