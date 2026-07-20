const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');
const upload = require('../middleware/cloudinary');

//bring in the auth middleware
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/authorizeRoles');

// Define the routes
router.post('/', protect, authorizeRoles('admin'), productController.createProduct);
router.get('/', protect, productController.getAllProducts);
router.post('/email', protect, authorizeRoles('admin'), productController.createProductWithEmail);
router.get('/:id', protect, productController.getProductById);
router.put('/:id', protect, authorizeRoles('admin'), productController.updateProduct);
router.delete('/:id', protect, authorizeRoles('admin'), productController.deleteProduct);
router.put('/:id/image', protect, authorizeRoles('admin'), upload.single('image'), productController.updateProductImage);

module.exports = router;
