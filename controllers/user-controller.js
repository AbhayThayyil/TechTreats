var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')
const categoryHelper=require('../helpers/category-helpers')
const { response } = require('express')



module.exports={

     //----------------------------------------------//
    //              GET                             //
    //                                              //                    
    //----------------------------------------------//

    //user-view-products

    viewProducts:async (req,res)=>{
        let userInSession=req.session.user
        let cartCount=null;
        if(userInSession){
            cartCount=await userHelper.getCartCount(req.session.user._id)
            productHelper.getAllProducts().then((products)=>{
                // console.log(products);
                
                res.render('user/user-home',{user:true,products,userInSession,cartCount})
            })
        }
        else{
            productHelper.getAllProducts().then((products)=>{
                // console.log(products);
                
                res.render('user/user-home',{user:true,products})
            }).catch((error)=>{
                console.log(error);
            })
        }
        // console.log(userInSession,"check session user");
       
        
        
      },
    
    //user-signup
    
    userSignUp:(req,res)=>{
        let userInSession=req.session.user
        res.render('user/user-signup')
        
    },

    //user-login

    userLogin:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }
        else{
            res.render('user/user-login')
        }
        
    },

    //user-logout

    userLogout:(req,res)=>{
        req.session.user=null
        res.redirect('/')
    },

    //product-detail

    showProductDetail:(req,res)=>{
        let userInSession=req.session.user
        let prodId=req.query.id
        console.log(prodId,"checking prodid by query");
        productHelper.getSingleProduct(prodId).then((product)=>{
            res.render('user/product-detail',{layout:'layout',userInSession,product})
        })
        .catch((error)=>{
            console.log(error);
        })
    },

    //get-otp-login page

    otpLogin:(req,res)=>{
        res.render('user/otp-login')
    },


    verifyOtp:(req,res)=>{
        res.render('user/verify-otp')
    },

    //cart
    getCart:async(req,res)=>{
       
        let cartCount=await userHelper.getCartCount(req.session.user._id)
        let products=await userHelper.getCartProducts(req.session.user._id)
        let total=0
        if(products.length>0){
            total=await userHelper.getTotalAmount(req.session.user._id)
        }
        else{
            console.log("No products in cart");
        }
        
        
        console.log(products,"===data from cart of each user===");
        //console.log(cartCount,"no of elements in cart");
        if(cartCount==0){
            console.log("Cart is empty");
            res.redirect('/')
        }
        else{
            res.render('user/cart',{userInSession:req.session.user,userInSessionId:req.session.user._id,layout:'layout',products,cartCount,total,user:true})
        }
        
        
    },

    addToCart:(req,res)=>{
        // console.log("=========calling add to cart===========");
        userHelper.doAddToCart(req.params.id,req.session.user._id).then(()=>{
            // res.json({status:true})
            res.redirect('/')
        })
    },
    //checkout page

    showCheckout:async(req,res)=>{

        let total=await userHelper.getTotalAmount(req.session.user._id)
        
        res.render('user/checkout',{userInSession:req.session.user,layout:'layout',total,user:true})
        
    },
    orderSuccess:(req,res)=>{
        res.render('user/order-success',{userInSession:req.session.user})
    },

    //view-orders

    viewOrders:async(req,res)=>{
        
        let orderDetails=await userHelper.getOrders(req.session.user._id)
        // console.log(orderDetails,"==========getting all order details========");
        res.render('user/view-orders',{user:true,userInSession:req.session.user,orderDetails})
    },

    viewProductCards:async(req,res)=>{
        let orderId=req.params.id
        console.log(orderId,"===order id===");
        let totalOrderDetails=await userHelper.getProducts(orderId)
        let totalPaid=totalOrderDetails[0].totalPrice
        // console.log(totalPaid,"total paid check");
        // console.log(productDetails,"what is in cards prod details");
        
        
        // console.log(total,"total check");

        
        
        
        res.render('user/view-product-cards',{user:true,userInSession:req.session.user,totalOrderDetails,totalPaid})
    },



    //----------------------------------------------//
    //              POST                           //
    //                                             //                    
    //--------------------------------------------//

    //post user-signup

    postUserSignUp:(req,res)=>{
        // console.log(req.body)
        userHelper.doSignUp(req.body).then((response)=>{
            // console.log(response,"response check 2");
            req.session.user=response
            req.session.userLoggedIn=true  
             
            
            if(response.response){
                res.redirect('/')
            }
            else{
                res.render('user/user-signup',{'signupError':"User already registered with this email address/mobile number.Please use another"})
            }
            
        }).catch((error)=>{
            console.log(error);
        })
        
    },

    //post user-login
    
    postUserLogin:(req,res)=>{
        userHelper.doLogIn(req.body).then((response)=>{
            
            // console.log(response,"response check 2");

            if(response.status){
                if(response.user.block){

                    res.render('user/user-login',{'blockError':"You have been blocked.Please contact Admin"})
                }
                else{
                    req.session.user=response.user
                    req.session.userLoggedIn=true
                    
                    
                    // console.log(req.session,"session");
                    res.redirect('/')
                }
            }
            else{
                res.render('user/user-login',{'loginError':"Invalid credentials.Please enter again"})
            }
        }).catch((error)=>{
            console.log(error);
        })
    },

    let:signupData=0,
    postOtpLogin:(req,res)=>{
    
        // console.log(req.body,"what we enter when we enter number");
        userHelper.doOtpLogin(req.body).then((response)=>{
            if(response.status){
                signupData=response.user;
                // console.log(signupData,"======signupdata=======");
                res.redirect('/verify-otp')
            }
            else{
                res.redirect('/otp-login')
            }
        })
        console.log(req.body,"chekcing body we enter");
    },
    
    postVerifyOtp:(req,res)=>{
        
        console.log(req.body,"===the otp we enter====");
        userHelper.doVerifyOtp(req.body,signupData).then((response)=>{
            if(response.status){
                req.session.userLoggedIn=true;
                req.session.user=signupData;

                res.redirect('/')
            }
            else{
                res.redirect('/verify-otp')
            }
        })
    },

    changeProductQuantity:(req,res,next)=>{
        // console.log(req.body,"change product quantity");
        userHelper.doChangeproductQuantity(req.body).then(async(response)=>{
            response.total=await userHelper.getTotalAmount(req.body.user)
            res.json(response)
        })
    },

    removeTheCartItem:(req,res,next)=>{
        // console.log(req.body,"what comes in remove item controller");
        userHelper.doRemoveCartItem(req.body).then((response)=>{
            res.json(response)
        })
    },

    //checkout post

    postCheckout:async(req,res)=>{
        // console.log(req.body,"checking postcheckout body");

        let products=await userHelper.getCartProductList(req.body.userId)
        let totalPrice=await userHelper.getTotalAmount(req.body.userId)
        userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
           
            console.log(req.body,"===checking what is in post checkout===");
           
            if(req.body['payment-method']==='COD'){
                res.json({codSuccess:true})
                
            }
            else{
                userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
                    // console.log(response,"==checking generate razorpay response,resolve from new order==");
                    res.json(response)
                })
            }
            })
        
    },

    doVerifyPayment:(req,res)=>{
        console.log(req.body,"===do verify payment===");
        userHelper.paymentVerification(req.body).then(()=>{
            userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
                console.log("Payment successful");
                res.json({status:true})
            })
        }).catch((err)=>{
            console.log(err);
            res.json({status:false,errMsg:'Payment Failed'})
        })
    }


    

}
