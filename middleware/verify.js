module.exports={
//verify login middleware for user
    verifyLogin:(req,res,next)=>{
        if(req.session.userLoggedIn){
        next()
        }
        else{
        res.redirect('/user-login')
        }
    },


 //verify login middleware for admin 
 verifyAdminLogin:(req,res,next)=>{
    if(req.session.adminLoggedIn){
    next()
    }
    else{
    res.redirect('/')
    }
}  
}




