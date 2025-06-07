const mongoose=require('mongoose');
const timeLogSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Project'
    },
    startTime:{type:Date},
    endTime:{type:Date},
    totalHours:Number,
    startLocation:{
        latitude:Number,
        longitude:Number
    },
    endLocation:{
        latitude:Number,
        longitude:Number,
    }

},{timestamps:true})

module.exports=mongoose.model('TimeLog',timeLogSchema);