const mongoose = require("mongoose");
const schema = mongoose.Schema;
const review = require("./review.js")

const listingSchema = new schema({
    title: String,
    description: String,
    image: {
        filename: String,
        url: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
        type: schema.Types.ObjectId,
        ref: "Review",
        },
    ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing){
        await review.deleteMany({_id: {$in: listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

