const { Router } = require('express');
var express = require('express');
const { addListener } = require('nodemon');
const { adminDash, viewProducts, addProduct, postAddProduct, editProduct, deleteProduct, postEditProduct, adminLogin, postAdminLogin, viewUsers, adminBlockUser, adminUnblockUser, viewCategories, addCategory, postAddcategory, deleteCategory, editCategory, postAddCategory, postEditCategory, adminViewProducts, adminAddProduct, adminDeleteProduct, viewInventory, addStock, postAddStock, adminViewOrders, adminLogout } = require('../controllers/admin-controller');
var router = express.Router();
const adminController=require('../controllers/admin-controller')
var productHelper=require('../helpers/product-helpers')
const categoryHelper=require('../helpers/category-helpers');
const { verifyAdminLogin } = require('../middleware/verify');


//admin-login
router.get('/',adminLogin)
router.post('/admin-login',postAdminLogin)

//admin-logout

router.get('/admin-logout',adminLogout)
/* GET users listing. */
router.get('/admin-dashboard',verifyAdminLogin,adminDash);

//view products
router.get('/view-products',verifyAdminLogin,adminViewProducts)

//add products
router.get('/add-product',verifyAdminLogin,adminAddProduct)

router.post('/add-product',verifyAdminLogin,postAddProduct)

//edit products
router.get('/edit-product',verifyAdminLogin,editProduct)
// router.post('/edit-product/:id',postEditProduct)
router.post('/edit-product/:id',verifyAdminLogin,postEditProduct)

//delete-products
router.get('/delete-product/:id',verifyAdminLogin,adminDeleteProduct)

//view-users
router.get('/view-users',verifyAdminLogin,viewUsers)


//block user
router.get('/block/:id',verifyAdminLogin,adminBlockUser)
//unblock user
router.get('/unblock/:id',verifyAdminLogin,adminUnblockUser)

//CATEGORY

//view-category
router.get('/view-categories',verifyAdminLogin,viewCategories)

//add category
router.get('/add-category',verifyAdminLogin,addCategory)
router.post('/add-category',verifyAdminLogin,postAddCategory)

//edit category
router.get('/edit-category',verifyAdminLogin,editCategory)
router.post('/edit-category/:id',verifyAdminLogin,postEditCategory)

//delete-category
router.get('/delete-category/:id',verifyAdminLogin,deleteCategory)

//view inventory
router.get('/view-inventory',verifyAdminLogin,viewInventory)

//add stock
router.post('/add-stock',verifyAdminLogin,postAddStock)

//view-orders
router.get('/admin-view-orders',verifyAdminLogin,adminViewOrders)








module.exports = router;
 