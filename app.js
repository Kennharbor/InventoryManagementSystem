require('dotenv').config();
const express = require('express');
const connectDB = require('./database');

const productRoutes = require('./route/productRoute');
const userRoutes = require('./route/userRoute');
// Middleware
const app = express();
app.use(express.json());
// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
