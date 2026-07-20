const Product = require('../models/productModel');
const User = require('../models/userModel');
const cloudinary = require('../config/cloudinaryConfig');
const sendEmail = require('../middleware/emailSender');
const fs = require('fs');
const path = require('path');

const productMailTemplate = fs.readFileSync(
    path.join(__dirname, '../htmlTemplate/productMail.html'),
    'utf8'
);

const fillTemplate = (template, values) => {
    return Object.entries(values).reduce((html, [key, value]) => {
        return html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
    }, template);
};

const getPublicIdFromImageUrl = (imageURL) => {
    if (!imageURL) {
        return '';
    }

    const [, uploadPath] = imageURL.split('/upload/');
    if (!uploadPath) {
        return '';
    }

    return uploadPath
        .replace(/^v\d+\//, '')
        .replace(/\.[^/.]+$/, '');
};

exports.createProductWithEmail = async (req, res) => {
    try {
        const { name, description = '', price, quantity = 0, imageURL = '', to } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ message: 'Name and price are required' });
        }

        const product = await Product.create({ name, description, price, quantity, imageURL });

        let recipients = to;
        if (!recipients) {
            const admins = await User.find({ role: 'admin' }).select('email');
            recipients = admins.map(admin => admin.email);
        }

        if (!recipients || recipients.length === 0) {
            return res.status(400).json({ message: 'No email recipient found' });
        }

        const html = fillTemplate(productMailTemplate, {
            productName: product.name,
            productDescription: product.description,
            productPrice: product.price,
            productQuantity: product.quantity
        });
        const subject = 'New Product Created';
        await sendEmail(recipients, subject, html);

        res.status(201).json({ message: 'Product created and email sent successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product and sending email', error: error.message });
    }
};

exports.updateProductImage = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const currentPublicId = product.imagePublicId || getPublicIdFromImageUrl(product.imageURL);
        if (currentPublicId) {
            await cloudinary.uploader.destroy(currentPublicId);
        }

        const uploadedImageUrl = req.file.path || req.file.secure_url;
        if (!uploadedImageUrl) {
            const publicId = req.file.filename;
            await cloudinary.uploader.destroy(publicId);
            return res.status(500).json({ message: 'Image uploaded but no URL was returned' });
        }

        // save the new image URL to the product
        product.imageURL = uploadedImageUrl;
        product.imagePublicId = req.file.filename || getPublicIdFromImageUrl(uploadedImageUrl);
        await product.save();
        res.status(200).json({ message: 'Product image updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product image', error: error.message });
    }
};

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
 
// Get all products
exports.getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json(products);
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
};
