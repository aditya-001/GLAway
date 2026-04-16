import mongoose from "mongoose";

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 1
    },
    category: {
      type: String,
      enum: ["Block A", "Block B", "Subway"],
      required: true
    },
    foodType: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      default: "Veg"
    },
    image: {
      type: String,
      default: ""
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 1,
      max: 5
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    prepTime: {
      type: String,
      default: "15-20 mins"
    }
  },
  { timestamps: true }
);

const FoodItem = mongoose.model("FoodItem", foodItemSchema);

export default FoodItem;
