require('dotenv').config()
var db=require('../config/connection')
var collection=require('../config/collection')
const dotenv=require('dotenv').config()



const accountSID=process.env.accountSid
const authToken=process.env.authToken
const serviceId=process.env.serviceId
// const client=require('twilio')(accountSID,authToken,serviceId)
const client=require('twilio')(accountSID,authToken,serviceId)






module.exports={

    doOtpLogin:(userData)=>{
        let response={}
        
        return new Promise(async (resolve,reject)=>{
             try{
                let user=await db.get().collection(collection.USER_COLLECTION).findOne({mobile:userData.mobile})
                console.log(user,"user details");
                

                if(user){
                console.log(user,"userdata after otp post");
                response.status=true;
                response.user=user;
                console.log(response,"=====response in otplogin helper====");
                    
                client.verify.v2.services(serviceId)
                .verifications
                .create({to: `+91${userData.mobile}`, channel: 'sms'})
                .then(data => {
                    
                    resolve(response)
                });
            }
            
            else{
                response.status=false;
                resolve(response)
            }
             }
                
             catch (error) {
                let err={}
                err.message="Something went wrong "
                reject(err)
            }
            
        })
        
    },

    doVerifyOtp:(verifyOtp,userData)=>{
        return new Promise((resolve,reject)=>{
            try {
                console.log(userData,"===userData from==== ");
                client.verify.v2.services(serviceId)
                .verificationChecks
                .create({to: `+91${userData.mobile}`, code:verifyOtp.otp})
                .then((data)=>{
                    if(data.status=='approved'){
                        resolve({status:true})
                    }
                    else{
                        resolve({status:false})
                    }
                });
            } catch (error) {
                let err={}
                err.message=error
                reject(err)
            }
            
        })
    },
       
    
}






     