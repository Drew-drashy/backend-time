const mongoose=require('mongoose');
const projectSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    center:{
        latitude: {
            type: Number,
            rquired: true
        },
        longitude: {
            type: Number,
            required: true
        },
    },
    status:{
        type:String,
        enum:['ongoing','completed'], 
        default:'ongoing',
    },
   
    deadline: {
        type: Date,
        default: () => {
        const now = new Date(Date.now());
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
    },
    // mobile field
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    },
    assignedEmployees:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    
    radius:{
        type:Number
    },
    workingHours: String,

    // webfields
    addressName:{
        type: String
    },
    homeOwnerName:{
        type: String
    },
    email:{
        type:String
    },
    phone:{
        type: String
    },
    

},{timestamps:true});


module.exports=mongoose.model('Project',projectSchema);