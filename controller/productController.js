const Product = require('../models/productModel');
const cloudinary = require('../middleware/cloudinary');

const user = require('../models/userModel');
const sendEmail = require('../middleware/emailSender');

exports.createProductWithEmail = async (req, res) => {
    try {
        const {name, price} = req.body;
        const product = await Product.create({ name, price });

        // get all admins from the database
        const admins = await user.find({ role: 'admin' });
        const adminEmails = admins.map(admin => admin.email);

        // send email to all admins
        const subject = 'New Product Created';
        const message = 
        <><h1>New Product Created</h1><p>A new product has been created:</p><ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Price:</strong> ${price}</li>
            </ul></>
        await sendEmail(adminEmails, subject, message);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

exports.updateProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.imageURL) {
            const publicId = product.imageURL.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // save the new image URL to the product
        product.imageURL = req.file.path;
        await product.save();
        res.status(200).json({ message: 'Product image updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product image', error });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json(product);
};
 
// Get all products
exports.getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json(products);
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
};