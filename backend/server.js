const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store
let products = [];
let reviews = [];
let users = [];
let orders = [];

// Future AWS integration points notes:
// products -> Replace array with DynamoDB table scan/put
// images -> Add S3 upload middleware for product images
// auth -> Add Cognito middleware for protected routes
// backend -> Wrap this Express app with serverless-http for Lambda

// POST /signup
app.post('/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // Plaintext since it's an MVP hackathon
    role // 'vendor' or 'customer'
  };

  users.push(newUser);
  res.status(201).json({
    id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, token: `mock-jwt-${newUser.id}`
  });
});

// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role, token: `mock-jwt-${user.id}`
  });
});

// GET /products
app.get('/products', (req, res) => {
  res.json(products);
});

// POST /products
app.post('/products', (req, res) => {
  const { name, price, image, vendorId } = req.body;
  if (!name || !price || !vendorId) {
    return res.status(400).json({ error: 'Name, price, and vendorId are required' });
  }

  const newProduct = {
    id: Date.now().toString(), // Simple ID generation
    name,
    price: Number(price),
    image: image || '',
    vendorId
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// GET /reviews
app.get('/reviews', (req, res) => {
  res.json(reviews);
});

// POST /reviews
app.post('/reviews', (req, res) => {
  const { comment, productId, customerName } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  const newReview = {
    id: Date.now().toString(),
    productId,
    comment,
    customerName: customerName || 'Anonymous',
    date: new Date().toISOString()
  };

  reviews.push(newReview);
  res.status(201).json(newReview);
});

// GET /orders
app.get('/orders', (req, res) => {
  res.json(orders);
});

// POST /orders
app.post('/orders', (req, res) => {
  const { productId, productName, customerName, vendorId } = req.body;
  
  if (!productId || !productName || !customerName || !vendorId) {
    return res.status(400).json({ error: 'All order fields are required' });
  }

  const newOrder = {
    id: Date.now().toString(),
    productId,
    productName,
    customerName,
    vendorId,
    status: 'Placed',
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Ready for future AWS Lambda + API Gateway deployment');
});
