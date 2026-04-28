import FoodItem from "../models/FoodItem.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { toClientPayload } from "../utils/response.js";

const sampleItems = [
  {
    name: "Masala Dosa Combo",
    description: "Crispy dosa, sambhar, chutney, and a campus-style filter coffee.",
    price: 95,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    prepTime: "12-15 mins"
  },
  {
    name: "Veg Loaded Sub",
    description: "Fresh veggies, sauces, and cheese in a toasted signature loaf.",
    price: 165,
    category: "Subway",
    image:
      "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    prepTime: "10-12 mins"
  },
  {
    name: "Paneer Roll",
    description: "Smoky paneer roll with mint mayo and onions.",
    price: 110,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    prepTime: "8-10 mins"
  },
  {
    name: "Cold Coffee",
    description: "Campus favorite cold coffee topped with cream and choco dust.",
    price: 70,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    prepTime: "5 mins"
  },
  {
    name: "Aloo Tikki Sub",
    description: "Toasted sub with tikki, crunchy veggies, and chipotle.",
    price: 145,
    category: "Subway",
    image:
      "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80",
    rating: 4.2,
    prepTime: "10 mins"
  },
  {
    name: "Chole Kulche",
    description: "Spiced chole paired with soft kulche and salad.",
    price: 90,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1626132647523-66c57a1d4c9f?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    prepTime: "10-14 mins"
  },
  {
    name: "Idli Power Plate",
    description: "Soft idlis with sambhar, coconut chutney, and podi butter drizzle.",
    price: 80,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    prepTime: "8-10 mins"
  },
  {
    name: "Cheese Masala Uttapam",
    description: "Thick uttapam layered with onions, capsicum, masala, and melted cheese.",
    price: 115,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    prepTime: "12-16 mins"
  },
  {
    name: "Mini Samosa Basket",
    description: "Crispy bite-sized samosas served with tamarind and mint chutney.",
    price: 60,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    prepTime: "6-8 mins"
  },
  {
    name: "Classic Veg Burger",
    description: "Grilled veg patty burger with peri-peri mayo, lettuce, and fries seasoning.",
    price: 105,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    prepTime: "10-12 mins"
  },
  {
    name: "Tandoori Paneer Wrap",
    description: "Roasted paneer, onions, peppers, and smoky sauce in a soft wrap.",
    price: 125,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    prepTime: "9-11 mins"
  },
  {
    name: "Cheese Maggi Bowl",
    description: "Street-style Maggi tossed with vegetables, herbs, and molten cheese.",
    price: 85,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
    rating: 4.2,
    prepTime: "7-9 mins"
  },
  {
    name: "Subway Club Melt",
    description: "Toasted multigrain sub packed with veggies, olives, and triple cheese.",
    price: 185,
    category: "Subway",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    prepTime: "11-13 mins"
  },
  {
    name: "Mexican Corn Sub",
    description: "Sweet corn, jalapenos, onions, and chipotle sauce in a toasted roll.",
    price: 155,
    category: "Subway",
    image:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    prepTime: "9-11 mins"
  },
  {
    name: "Peri Peri Fries",
    description: "Crispy fries dusted with peri-peri spice and a creamy dip on the side.",
    price: 75,
    category: "Subway",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    prepTime: "6-8 mins"
  },
  {
    name: "Campus Brownie Shake",
    description: "Chocolate brownie blended into a thick shake with whipped cream.",
    price: 95,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    prepTime: "5-6 mins"
  },
  {
    name: "Lemon Mint Cooler",
    description: "Refreshing lime, mint, and soda cooler for hot campus afternoons.",
    price: 55,
    category: "Block B",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
    rating: 4.2,
    prepTime: "4-5 mins"
  },
  {
    name: "Chocolate Chip Muffin",
    description: "Soft bakery muffin loaded with chocolate chips and warm cocoa notes.",
    price: 50,
    category: "Block A",
    image:
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    prepTime: "3-4 mins"
  },
  {
    name: "Egg Keema Dosa",
    description: "Golden dosa packed with masala egg bhurji and spicy campus chutneys.",
    price: 125,
    category: "Block A",
    foodType: "Non-Veg",
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    prepTime: "10-12 mins"
  },
  {
    name: "Chicken Kathi Roll",
    description: "Juicy chicken strips, onions, and mint mayo wrapped in a flaky paratha.",
    price: 145,
    category: "Block B",
    foodType: "Non-Veg",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    prepTime: "11-13 mins"
  },
  {
    name: "Chicken Tikka Sub",
    description: "Smoky tikka chicken, crunchy veggies, and chipotle sauce in a toasted sub.",
    price: 205,
    category: "Subway",
    foodType: "Non-Veg",
    image:
      "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    prepTime: "10-12 mins"
  }
];

export const seedFoodItems = async () => {
  const existingItems = await FoodItem.find({}, "name");
  const existingNames = new Set(
    existingItems.map((item) => item.name.trim().toLowerCase())
  );
  const missingItems = sampleItems.filter(
    (item) => !existingNames.has(item.name.trim().toLowerCase())
  );

  if (missingItems.length > 0) {
    await FoodItem.insertMany(missingItems);
    console.log(`${missingItems.length} sample food items seeded`);
  }
};

const buildImagePath = (file) => {
  if (!file) {
    return undefined;
  }

  if (process.env.VERCEL === "1" && file.buffer) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }

  return `/uploads/${file.filename}`;
};
const ALLOWED_CATEGORIES = ["Block A", "Block B", "Subway"];
const ALLOWED_FOOD_TYPES = ["Veg", "Non-Veg"];

const isAdminSurfaceRequest = (req) => {
  const referer = req.get("referer");

  if (!referer) {
    return false;
  }

  try {
    return new URL(referer).pathname.startsWith("/admin");
  } catch {
    return false;
  }
};

const parseBoolean = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

const normalizeFoodType = (value) => {
  if (!value) {
    return undefined;
  }

  const normalizedValue = value === "Non Veg" ? "Non-Veg" : value;

  if (!ALLOWED_FOOD_TYPES.includes(normalizedValue)) {
    throw new AppError(400, "foodType must be Veg or Non-Veg");
  }

  return normalizedValue;
};

const parseNumber = (value, fieldName, { min, max } = {}) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new AppError(400, `${fieldName} must be a valid number`);
  }

  if (min !== undefined && parsedValue < min) {
    throw new AppError(400, `${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && parsedValue > max) {
    throw new AppError(400, `${fieldName} must not exceed ${max}`);
  }

  return parsedValue;
};

const buildFoodPayload = (body, file) => {
  const payload = {};

  if (body.name !== undefined) payload.name = body.name.trim();
  if (body.description !== undefined) payload.description = body.description.trim();
  if (body.price !== undefined) payload.price = parseNumber(body.price, "Price", { min: 1 });

  if (body.category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(body.category)) {
      throw new AppError(400, "category must be Block A, Block B, or Subway");
    }

    payload.category = body.category;
  }

  if (body.foodType !== undefined) payload.foodType = normalizeFoodType(body.foodType);
  if (body.rating !== undefined) {
    payload.rating = parseNumber(body.rating, "Rating", { min: 1, max: 5 });
  }
  if (body.prepTime !== undefined) payload.prepTime = body.prepTime.trim();

  const availability = parseBoolean(body.isAvailable);
  if (availability !== undefined) {
    payload.isAvailable = availability;
  }

  const uploadedImage = buildImagePath(file);
  if (uploadedImage) {
    payload.image = uploadedImage;
  } else if (body.image) {
    payload.image = body.image;
  }

  return payload;
};

export const getFoodItems = asyncHandler(async (req, res) => {
  const { category, search, available, foodType } = req.query;
  const filters = {};

  if (category) {
    if (!ALLOWED_CATEGORIES.includes(category)) {
      throw new AppError(400, "Invalid category filter");
    }

    filters.category = category;
  }

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (available === "all") {
    // Keep both available and hidden items visible when the admin surface needs them.
  } else if (available !== undefined) {
    filters.isAvailable = available === "true";
  } else if (!isAdminSurfaceRequest(req)) {
    filters.isAvailable = true;
  }

  const normalizedFoodType = normalizeFoodType(foodType);
  if (normalizedFoodType === "Veg") {
    filters.foodType = { $in: ["Veg", null] };
  } else if (normalizedFoodType === "Non-Veg") {
    filters.foodType = "Non-Veg";
  }

  const items = await FoodItem.find(filters).sort({ createdAt: -1 });
  res.json(items);
});

export const getFoodItemById = asyncHandler(async (req, res) => {
  const item = await FoodItem.findById(req.params.id);

  if (!item) {
    throw new AppError(404, "Food item not found");
  }

  res.json(toClientPayload(item, "Food item fetched"));
});

export const createFoodItem = asyncHandler(async (req, res) => {
  const payload = buildFoodPayload(req.body, req.file);

  if (!payload.name || !payload.description || !payload.price || !payload.category) {
    throw new AppError(400, "Name, description, price, and category are required");
  }

  const item = await FoodItem.create(payload);
  res.status(201).json(toClientPayload(item, "Food item created"));
});

export const updateFoodItem = asyncHandler(async (req, res) => {
  const payload = buildFoodPayload(req.body, req.file);

  const item = await FoodItem.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!item) {
    throw new AppError(404, "Food item not found");
  }

  res.json(toClientPayload(item, "Food item updated"));
});

export const deleteFoodItem = asyncHandler(async (req, res) => {
  const item = await FoodItem.findByIdAndDelete(req.params.id);

  if (!item) {
    throw new AppError(404, "Food item not found");
  }

  res.json({
    success: true,
    message: "Food item deleted successfully",
    data: null
  });
});
