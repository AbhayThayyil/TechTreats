const { Router } = require('express');
var express = require('express');
const { addListener } = require('nodemon');
const { adminDash, viewProducts, addProduct, postAddProduct, editProduct, deleteProduct, postEditProduct, adminLogin, postAdminLogin, viewUsers, adminBlockUser, adminUnblockUser, viewCategories, addCategory, postAddcategory, deleteCategory, editCategory, postAddCategory, postEditCategory, adminViewProducts, adminAddProduct, adminDeleteProduct, viewInventory, addStock, postAddStock, adminViewOrders, adminLogout, postOrderStatus, postUpdateStatus, viewAdminProductCards, updateStatus, addCoupon, postAddCoupon, viewCoupon, editCoupon, postEditCoupon, deleteCoupon, sendRefundProcess, addBanner, postAddBanner, viewBanner, editBanner, postEditBanner, deleteBanner, salesReport } = require('../controllers/admin-controller');
var router = express.Router();
const adminController=require('../controllers/admin-controller')
var productHelper=require('../helpers/product-helpers')
const categoryHelper=require('../helpers/category-helpers');
const { verifyAdminLogin } = require('../middleware/verify');
const multer=require('multer')




//    MULTER FOR MULTIPLE IMAGE UPLOAD ---->PRODUCT IMAGES

const multerStorageProduct=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/productImages");
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + '-' + file.originalname)
    }
})

// MULTER ---------->Banner

const multerStorageBanner=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/bannerImages");
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() + '-' + file.originalname)
    }
})

const uploadMultiple=multer({storage:multerStorageProduct})

//banner uploads
const uploadBanner=multer({storage:multerStorageBanner})
const multipleBanner=uploadBanner.fields([{name:'bannerImage1',maxCount:1},{name:'bannerImage2',maxCount:1},{name:'bannerImage3',maxCount:1},{name:'bannerImage4',maxCount:1}])



//admin-login
router.get('/',adminLogin)
router.post('/admin-login',postAdminLogin)

//admin-logout

router.get('/admin-logout',adminLogout)
/* GET users listing. */
router.get('/admin-dashboard',verifyAdminLogin,adminDash);

//**********************************  PRODUCT MANAGEMENT *********************** */

//view products
router.get('/view-products',verifyAdminLogin,adminViewProducts)

//add products
router.get('/add-product',verifyAdminLogin,adminAddProduct)

router.post('/add-product',verifyAdminLogin,uploadMultiple.array("image"),postAddProduct)

//edit products
router.get('/edit-product',verifyAdminLogin,editProduct)
// router.post('/edit-product/:id',postEditProduct)
router.post('/edit-product/:id',verifyAdminLogin,uploadMultiple.array("image"),postEditProduct)

//delete-products
router.get('/delete-product/:id',verifyAdminLogin,adminDeleteProduct)

//********************************* USER MANAGEMENT  *************************  */

//view-users
router.get('/view-users',verifyAdminLogin,viewUsers)


//block user
router.get('/block/:id',verifyAdminLogin,adminBlockUser)
//unblock user
router.get('/unblock/:id',verifyAdminLogin,adminUnblockUser)

// *************************************  CATEGORY MANAGEMENT  ***************************

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


//***********************************   INVENTORY MANAGEMENT ******************** */

//view inventory
router.get('/view-inventory',verifyAdminLogin,viewInventory)

//add stock
router.post('/add-stock',verifyAdminLogin,postAddStock)


// ****************************   ORDER MANAGEMENT  ********************************

//view-orders
router.get('/admin-view-orders',verifyAdminLogin,adminViewOrders)

//view-order-cards

router.get('/view-admin-order-cards',verifyAdminLogin,viewAdminProductCards)

//change order status
router.post('/product-status',verifyAdminLogin,updateStatus)

//send refund
router.post('/admin/send-refund',verifyAdminLogin,sendRefundProcess)

// **************************************   COUPON MANAGEMENT ************************

//coupon-management
router.get('/view-coupons',verifyAdminLogin,viewCoupon)
//add coupon
router.get('/add-coupon',verifyAdminLogin,addCoupon)
router.post('/add-coupon',verifyAdminLogin,postAddCoupon)

router.get('/edit-coupon',verifyAdminLogin,editCoupon)
router.post('/edit-coupon',verifyAdminLogin,postEditCoupon)

router.get('/delete-coupon',verifyAdminLogin,deleteCoupon)


// **************************************   BANNER MANAGEMENT ************************

//view banner
router.get('/banner-management',verifyAdminLogin,viewBanner)

//add banner
router.get('/add-banner',verifyAdminLogin,addBanner)
router.post('/add-banner',verifyAdminLogin,multipleBanner,postAddBanner)

//edit banner
router.get('/edit-banner/',verifyAdminLogin,editBanner)
router.post('/edit-banner/',verifyAdminLogin,multipleBanner,postEditBanner)

//delete banner
router.get('/delete-banner/:id',verifyAdminLogin,deleteBanner)


// **************************************   SALES REPORT ************************

router.get('/sales-report',verifyAdminLogin,salesReport)

router.post('/sales-date-apply',verifyAdminLogin,adminController.sortSales)








module.exports = router;
 