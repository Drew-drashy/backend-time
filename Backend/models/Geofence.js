const mongoose=require('mongoose');
const geofenceSchema=new mongoose.Schema({
    
    project:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project'
    },
    center:{
        latitude: Number,
        longitude: Number,
    },
    radius:{
        type:Number
    }

},{
    timeseries: true
})
module.exports=mongoose.model('Geofence',geofenceSchema)