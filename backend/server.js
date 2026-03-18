require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const serverless = require('serverless-http');

const app = express();
const PORT = process.env.PORT || 5001;
const users=[];
app.use(cors());
app.use(express.json());

// --- AWS Configuration ---
// These will automatically use credentials from IAM Roles when deployed to Lambda
// or from environment variables/credentials file when running locally.
const region = process.env.AWS_REGION || 'us-east-1';

const ddbClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ region });

const PRODUCTS_TABLE = process.env.DYNAMODB_PRODUCTS_TABLE || 'Products';
const REVIEWS_TABLE = process.env.DYNAMODB_REVIEWS_TABLE || 'Reviews';
const ORDERS_TABLE = process.env.DYNAMODB_ORDERS_TABLE || 'Orders';
const S3_BUCKET = process.env.S3_IMAGE_BUCKET || 'makernest-product-images';

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
app.get('/products', async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: PRODUCTS_TABLE });
    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (error) {
    console.error('DynamoDB Scan Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /products
app.post('/products', async (req, res) => {
  const { name, price, imageUrl, description, vendorId } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newProduct = {
    id: Date.now().toString(),
    name,
    price: Number(price),
    imageUrl: imageUrl || null,
    description: description || '',
    vendorId: vendorId || 'anonymous'
  };

  try {
    const command = new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: newProduct
    });
    await docClient.send(command);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('DynamoDB Put Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /upload-url
app.get('/upload-url', async (req, res) => {
  const { filename, filetype } = req.query;
  if (!filename || !filetype) {
    return res.status(400).json({ error: 'filename and filetype are required' });
  }

  const key = `products/${Date.now()}-${filename}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: filetype
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
    res.json({
      uploadUrl: presignedUrl,
      objectUrl: `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('S3 Presign Error:', error);
    res.status(500).json({ error: 'Could not generate upload URL' });
  }
});

// GET /reviews
app.get('/reviews', async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: REVIEWS_TABLE });
    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (error) {
    console.error('DynamoDB Scan Error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /reviews
app.post('/reviews', async (req, res) => {
  const { comment, productId } = req.body;
  if (!comment || !productId) {
    return res.status(400).json({ error: 'Comment and productId are required' });
  }

  const newReview = {
    id: Date.now().toString(),
    productId,
    comment,
    date: new Date().toISOString()
  };

  try {
    const command = new PutCommand({
      TableName: REVIEWS_TABLE,
      Item: newReview
    });
    await docClient.send(command);
    res.status(201).json(newReview);
  } catch (error) {
    console.error('DynamoDB Put Error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /orders
app.get('/orders', async (req, res) => {
  try {
    const command = new ScanCommand({ TableName: ORDERS_TABLE });
    const response = await docClient.send(command);
    res.json(response.Items || []);
  } catch (error) {
    console.error('DynamoDB Scan Error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /orders
app.post('/orders', async (req, res) => {
  const { items, total, customerId } = req.body;
  
  const newOrder = {
    id: Date.now().toString(),
    items: items || [],
    total: Number(total) || 0,
    customerId: customerId || 'anonymous',
    status: 'PENDING',
    date: new Date().toISOString()
  };

  try {
    const command = new PutCommand({
      TableName: ORDERS_TABLE,
      Item: newOrder
    });
    await docClient.send(command);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('DynamoDB Put Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Only start the server locally if not running in Lambda
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });

}

// Export for AWS Lambda API Gateway integration
module.exports.handler = serverless(app);
