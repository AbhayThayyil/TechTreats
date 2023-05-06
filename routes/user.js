var express = require('express');
const { viewProducts, userSignUp, userLogin, postUserSignUp, postUserLogin, userLogout, showProductDetail, otpLogin, postOtpLogin, verifyOtp, postVerifyOtp, getCart, addToCart, changeProductQuantity, removeTheCartItem, showCheckout, postCheckout, orderSuccess, viewOrders, viewProductCards, doVerifyPayment, viewCategoryProducts, viewProductsCategoryWise, userProfile, addAddress, deleteAddress, deleteAddresses, showCoupons, submitCoupon, stockReduce, cancelOrder, orderReturn, showWallet, otpTesting, paypalSuccess, getAddressFromDropdown } = require('../controllers/user-controller');
var router = express.Router();
const userController=require('../controllers/user-controller')
var productHelper=require('../helpers/product-helpers');
const categoryHelper=require('../helpers/category-helpers')
const { doLogIn } = require('../helpers/user-helpers');
const { verifyLogin } = require('../middleware/verify');





/* GET home page. */
router.get('/',viewProducts);

//category products view
router.get('/category-products',viewCategoryProducts)

//user-signup

router.get('/user-signup',userSignUp)

router.post('/user-signup',postUserSignUp)

//user-login

router.get('/user-login',userLogin)

router.post('/user-login',postUserLogin)

//get-otp-login
let signupData;
router.get('/otp-login',otpLogin)
router.post('/otp-login',postOtpLogin)


//verify-otp

router.get('/verify-otp',verifyOtp)
router.post('/verify-otp',postVerifyOtp)

//user-logout

router.get('/user-logout',userLogout)

//product-detail
// router.get('/product-detail/',showProductDetail)
router.get('/product-detail/',showProductDetail)

// To post review by user
router.post('/submit-review',verifyLogin,userController.submitReview)

//******************************************  CART  *********************************

//cart

router.get('/cart',verifyLogin,getCart)

//add to cart

router.get('/add-to-cart/:id',addToCart)

//remove-cart-item

router.post('/remove-cart-item',removeTheCartItem)

//change-product-quantity

router.post('/change-product-quantity',changeProductQuantity)

//*****************************************   ORDERS   ********************************* 

//checkout page

router.get('/checkout',verifyLogin,showCheckout)
router.post('/checkout',postCheckout)

// To select address from dropdown list

router.get('/select-address/:id',verifyLogin,getAddressFromDropdown)
//order-success-page

router.get('/order-success',verifyLogin,orderSuccess)

//order-fail-page

router.get('/order-fail',verifyLogin,userController.orderFail)

//order-success=paypal

router.get('/paypal-order-success/:id',verifyLogin,paypalSuccess)

//order-list

router.get('/view-orders',verifyLogin,viewOrders)

//view-product-cards

router.get('/view-product-cards/:id',verifyLogin,viewProductCards)

//verify payment
router.post('/verify-payment',verifyLogin,doVerifyPayment)

//user-profile,edit-credentials,edit basic data,edit important data
router.get('/user-profile',verifyLogin,userProfile)

router.get('/edit-credentials',verifyLogin,userController.editUserCredentials)

router.get('/edit-basic-user-data',verifyLogin,userController.editBasicCreds)
router.post('/edit-basic-user-data',verifyLogin,userController.postEditedBasicCreds)

router.get('/edit-important-user-data',verifyLogin,userController.editImportantCreds)
router.post('/edit-important-user-data',verifyLogin,userController.postEditedImportantCreds)

//user-wallet
router.get('/user-wallet',verifyLogin,showWallet)

//user-add-address
router.post('/submit-address',verifyLogin,addAddress)

//delete-address
router.post('/delete-address',verifyLogin,deleteAddresses)

//cancel-order
router.post('/cancel-product',cancelOrder)

//return order
router.post('/return-product',orderReturn)


//*****************************************   COUPONS   ********************************* 



//submit coupon

router.post('/apply-coupon',verifyLogin,submitCoupon)


//stock quantity reduce

router.post('/stock-reduce',verifyLogin,stockReduce)


//*******************************************  404    */

// router.get('/error-page',verifyLogin,userController.errorPage)



router.get('*',userController.errorPage)













module.exports = router;
