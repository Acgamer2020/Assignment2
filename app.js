// Import dependencies
const express = require("express");
const dotenv = require("dotenv");
const db = require("./db.js"); // SQLite database connection

// Load environment variables from .env file
dotenv.config();

// Set port from env or fallback
const PORT = process.env.PORT || 3000;

// Create the Express server
const app = express();

// -------------------- MIDDLEWARE --------------------
// Parse URL-encoded bodies (from forms, etc.)
app.use(express.urlencoded({ extended: true }));
// Parse JSON request bodies
app.use(express.json());
// Set access control header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// -------------------- ROUTES --------------------

app.get("/statistics", (req, res) => {
  res.json({
    users: 46,
    products: 123,
    sales: 67,
    profit: 23000,
  });
});

app.get("/sales", (req, res) => {
  res.json([
    { x: 50, y: 7 },
    { x: 60, y: 8 },
    { x: 70, y: 8 },
    { x: 80, y: 9 },
    { x: 90, y: 9 },
    { x: 100, y: 9 },
    { x: 110, y: 10 },
    { x: 120, y: 11 },
    { x: 130, y: 14 },
    { x: 140, y: 14 },
    { x: 150, y: 15 },
  ]);
});

app.get("/visitors", (req, res) => {
  res.json({
    day: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    count: [3, 6, 10, 2, 32, 19, 9, 8, 16, 7],
  });
});

app.get("/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/products", (req, res) => {
  try {
    const insert = db.prepare(
      "INSERT INTO products (name,price,description,quantity) values(?,?,?,?)"
    );
    const { name, price, description, quantity } = req.body;

    const result = insert.run(
      name,
      parseFloat(price),
      description,
      parseInt(quantity)
    );

    if (result.lastInsertRowid) {
      res.status(201).json({
        id: result.lastInsertRowid,
        name,
        price,
        description,
        quantity,
      });
    } else {
      res.status(400).json({ error: "Failed to add the product" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: "Failed to add the product" });
  }
});

app.delete("/products/:id", (req, res) => {
  try {
    const del = db.prepare("DELETE FROM products WHERE id=?");
    const result = del.run(parseInt(req.params.id));

    if (result.changes === 1) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: "Failed to delete the product" });
  }
});

// ✅ Fixed PUT route to handle /products/:id
app.put("/products/:id", (req, res) => {
  try {
    const { name, price, description, quantity } = req.body;
    const id = parseInt(req.params.id);

    const update = db.prepare(
      "UPDATE products SET name=?, price=?, description=?, quantity=? WHERE id=?"
    );
    const result = update.run(
      name,
      parseFloat(price),
      description,
      parseInt(quantity),
      id
    );

    if (result.changes >= 1) {
      res.status(200).json({ id, name, price, description, quantity });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ error: "Failed to update the product" });
  }
});

app.get("/top_products", (req, res) => {
  res.json({
    product: ["Iphone 16", "JBL c15", "Dell XPS 16", "Pixel 8 pro", "LG G8"],
    count: [3, 6, 10, 2, 32],
  });
});

app.get("/sold_products", (req, res) => {
  res.json({
    category: ["Phones", "Headphones", "Laptops", "Chargers", "TVs"],
    count: [23, 67, 12, 60, 15],
  });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () =>
  console.log(`server started, listening at port ${PORT}`)
);
