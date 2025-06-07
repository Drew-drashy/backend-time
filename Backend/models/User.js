const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
    name:String,
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase:true,
    },
    avatar:{
        type: String // setted for the uploading the image of user.
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type:String,
        default:'Idle',
        enum:['Idle','Working']

    },
    role:{
        type: String,
        enum:['admin','employee'],
        default:'employee'
    },
    position: String,
    phone: String,
    resetPasswordToken:   String,
    resetPasswordExpires: Date
},{timestamps: true});

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
    next();
})

userSchema.methods.comparePassword=function (candidatePassword){
    return bcrypt.compare(candidatePassword,this.password);
}

module.exports=mongoose.model("User",userSchema);