const MongoClient=require('mongodb').MongoClient

//initial db state
const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb+srv://abhaythayyil:Abhay*abiz98@cluster0.tujohhk.mongodb.net/test'
    const dbname='TechTreats'

    MongoClient.connect(url,(err,data)=>{
        if(err){
            return  done(err)
        }
        state.db=data.db(dbname)
        done()
    })
}


module.exports.get=function(){
    return state.db
}