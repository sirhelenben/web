const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords
const app = express();
const jwt = require('jsonwebtoken'); // Importing the JWT library
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const cors = require('cors');


// Accessing environment variables

console.log("JWT_SECRET: ", process.env.JWT_SECRET);
console.log("PORT: ", process.env.PORT);

const User = require('./models/User');
// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files



app.use('/uploads', express.static('uploads'));
app.use(cors()); // Enable CORS for all routes






const uri= 'mongodb+srv://sirbenhelen:sir0987031933!@cluster0.rflsn.mongodb.net/clothingstore?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri) 
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Could not connect to MongoDB:', err));



    
const MessageModel= require ('./models/message');
console.log('MessageModel:', MessageModel);

  
// Signup Route
app.post('/signup', async (req, res) => {
  const { phoneNumber, password } = req.body;
  res.send('recieved signup data:  ${phoneNumber} , ${password}');

  try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
          phoneNumber,
          password: hashedPassword, // Save the hashed password
      });

      // Save the user in the database
      await newUser.save();

      // Send a success response
      res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
      // Handle any error that occurs
      res.status(400).json({ error: 'Error registering user: ' + error.message });
  }
});


const bodyParser = require('body-parser');
app.use(bodyParser.json());


// Login route
app.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
      // Check if user exists
      const user = await User.findOne({ phoneNumber });
      if (!user) {
          return res.status(400).json({ error: 'Invalid phone number or password.' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: 'Invalid phone number or password.' });
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '2w' });
 res.json({ token });
      // Respond with the token
      res.status(200).json({ message: 'Login successful!', token });
  } catch (error) {
      res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Start the server


  

app.get('/message', (req, res) => {
    res.sendFile(__dirname + '/message.html'); // Send the messaging HTML page
  });
  
  app.post('/send-message', (req, res) => {
    const { message, userId } = req.body; // Assuming user authentication is already implemented
    // Save message to the database (MongoDB)
    const newMessage = new MessageModel({
      userId: userId,
      message: message,
      date: new Date()
    });
  
    newMessage.save()
  .then(() => res.status(200).json({ message: 'Message sent successfully' }))
  .catch((err) => res.status(500).json({ error: 'Failed to send message' }));

    
  });
  




app.post('/send-response', (req, res) => {
  const { messageId, response } = req.body;

  // Assuming you have a Message model and a way to find the message by ID
  MessageModel.findById(messageId, (err, message) => {
      if (err || !message) {
          return res.status(404).json({ error: 'Message not found' });
      }

      // Here you would send the response to the customer
      // For simplicity, let's log it to the console or save it to a Response model
      console.log(`Response to ${message.sender}: ${response}`);

      // Optionally, save the response to the database if you want to keep track of it
      // const newResponse = new ResponseModel({ messageId, response });
      // newResponse.save();

      res.status(200).json({ message: 'Response sent successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
 });


// Order route
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        const savedOrder = await order.save();
        console.log('Order Data:', req.body);
        res.json({ success: true, orderId: savedOrder._id });
    } catch (error) {
        console.error("Error saving order:", error);
        res.json({ success: false, message: 'Order could not be processed' });
    }
});
const multer = require('multer');
const storage = multer.memoryStorage(); // Configure storage location
const Order = require('./models/Order'); // Order model we created
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Save screenshots in 'uploads' directory




// Middleware for checking admin password
const ADMIN_PASSWORD = "helen"; // Replace with a secure password

let users = [
    { username: "admin", password: "$2a$10$C0HgWVtC9xl6yOqG5.l1xOetM5Oh7XjfSKFbF2FwUl4yISORv5pXe" } // Hash of "admin_password"
  ];

  // Login route to authenticate user
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
 
    // Find user (e.g., check username)
    const user = users.find(user => user.username === username);
    if (!user) {
       return res.status(400).json({ message: "User not found" });
    }
 
    // Check password
    bcrypt.compare(password, user.password, (err, isMatch) => {
       if (!isMatch) {
          return res.status(401).json({ message: "Incorrect password" });
       }
 
       // Create JWT token if password matches
       const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });  // Token expires in 1 hour
       res.status(200).json({ message: "Login successful", token });
    });
 });
 
 // Middleware to verify JWT token
 const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
       return res.status(401).json({ message: 'Access denied, no token provided' });
    }
 
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
       if (err) {
          return res.status(401).json({ message: 'Invalid or expired token' });
       }
       req.user = decoded;  // Store decoded user info for further use
       next();
    });
 };
 
 // Example protected route (Add Product)
 app.post('/api/admin/products', verifyToken, (req, res) => {
    // Assuming productData comes from the request body
    const { name, price, image, stock } = req.body;
    const newProduct = { name, price, image, stock };
    
    console.log("Adding product:", newProduct);
    res.status(200).json({ message: "Product added successfully", product: newProduct });
 });
 
app.use('/api/admin', (req, res, next) => {
    const password = req.query.password || req.body.password;
    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }
    next();
});

// Route to fetch orders, with optional filtering by status
app.get('/api/admin/orders', async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};
        const orders = await Order.find(query);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

// Route to update the status of an order
app.patch('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error });
    }
});

// Route to fetch messages (with password protection)
app.get('/customer/messages', async (req, res) => {
    const { password } = req.query;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    // Mock messages data
    
    const messages = await fetchMessages(); // Replace with your actual fetch logic

    // Respond with the messages as JSON
    res.json(messages);
    
});


app.post('/api/payments', upload.single('paymentScreenshot'), async (req, res) => {
    console.log("Request file:", req.file);
    console.log("Request body:", req.body);

    
    try {
        const { orderId } = req.body;
        const paymentScreenshot = req.file ? `/uploads/${req.file.filename}` : null;

        // Create an object or save payment info in your database
        const paymentInfo = {
            orderId,
            paymentScreenshot,
            status: "Pending", // Set status or process payment as needed
            timestamp: new Date()
        };

        // Log for debugging purposes
        console.log("Received payment info:", paymentInfo);

        // Send a success response
        res.status(200).json({ success: true, message: "Payment submitted successfully!" });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ success: false, message: "Error submitting payment." });
    }
});

async function loadProducts() {
    const response = await fetch("http://127.0.0.1:3000/api/admin/products");
 
    // Check if the response is JSON
    if (!response.ok) {
       console.error("Failed to fetch products:", response.status);
       return;
    }
 
    const products = await response.json();
    console.log("Fetched products:", products);  // Debugging line
 
    // Check if products is an array
    if (!Array.isArray(products)) {
       console.error("Products is not an array:", products);
       return;
    }
 
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
 
    // Display products
    products.forEach((product) => {
       const productItem = document.createElement("div");
       productItem.innerHTML = `
          <h4>${product.name}</h4>
          <img src="${product.imageUrl}" alt="${product.name}" style="width:100px; height:auto;">
          <p>${product.description}</p>
          <p>Price: $${product.price}</p>
          <button onclick="removeProduct('${product._id}')">Remove</button>
       `;
       productList.appendChild(productItem);
    });
 }
 
// Add a new product
app.post("/api/admin/products", async (req, res) => {
    try {
       const newProduct = new Product(req.body);
       await newProduct.save();
       res.status(201).json(newProduct);
    } catch (error) {
       console.error("Error adding product:", error);
       res.status(500).json({ error: "Failed to add product" });
    }
 });
 
 // Get all products
 app.get("/api/admin/products", async (req, res) => {
    try {
       const products = await Product.find();
       res.json(products);
    } catch (error) {
       console.error("Error fetching products:", error);
       res.status(500).json({ error: "Failed to fetch products" });
    }
 });
 
 // Remove a product by ID
 app.delete("/api/admin/products/:id", async (req, res) => {
    try {
       const { id } = req.params;
       await Product.findByIdAndDelete(id);
       res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
       console.error("Error removing product:", error);
       res.status(500).json({ error: "Failed to remove product" });
    }
 });