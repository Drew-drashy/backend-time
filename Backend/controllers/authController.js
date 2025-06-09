const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer=require('nodemailer');
const crypto=require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const  lowerEmail=email.toLowerCase();
    const userExists = await User.findOne({ email:lowerEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email:lowerEmail, password, role });
    res.status(201).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.position) user.position = req.body.position;

    if (req.file) {
      // Assuming you use multer for file upload middleware
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Profile update failed' });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email,password);
  try {
    const lowerEmail=email.toLowerCase();
    const user = await User.findOne({ email:lowerEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// exports.forgotPassword=async (req,res)=>{


//   const {email}=req.body;
//   if(!email) return  res.status(400).json({message:'No account with that email'});
//   try{
//     const user=User.find({email});
//     if(!user)  return res.status(404).json({message:'No account with that email'});
//     const token=crypto.randomBytes(20).toString('hex');
//     user.resetPasswordToken=token;
//     user.resetPasswordExpires=Date.now()+60000;
//     await user.save();

//     const transporter=nodemailer.createTransport({
//       host:process.env.SMTP_HOST,
//       port:process.env.SMTP_PORT,
//       secure:  false,
//       auth:{
//         user:process.env.SMTP_HOST,
//         pass:process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       to:  user.email,
//       from : 'info@elfihomes.com',
//       subject: 'your password   reset token',
//       text: 'here is your password reset token:\n\n${token}  \n\nIt will expire in  15 min '
//     });
//     return res.status(200).json({message:'Token has been  sent  over mail'});
//   }
//   catch(error){
//     console.log(error);
//     return res.status(400).json({message:  'Error in Forgot Passowrd'});
//   }
// }

// exports.resetPassword = async (req, res) => {
//   const { token, password } = req.body;
//   if (!token || !password) {
//     return res.status(400).json({ message: 'Token and new password are required' });
//   }

//   try {
//     // find user with this unexpired token
//     const user = await User.findOne({
//       resetPasswordToken:   token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired token' });
//     }

//     // set the new password (will get hashed by your pre('save'))
//     user.password             = password;
//     user.resetPasswordToken   = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.json({ message: 'Your password has been reset' });
//   } catch (err) {
//     console.error('ResetPassword Error:', err);
//     res.status(500).json({ message: 'ResetPassword Error' });
//   }
// };

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // 1) Generate token & expiry
    const token   = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600_000; // 1 hour

    // 2) Atomically update the user document
    const user = await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken:   token,
        resetPasswordExpires: expires,
      },
      { new: true }    // return the updated doc
    ).exec();

    if (!user) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    // 3) Send the token in email
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    transporter.verify((err,success)=>{
      if(err){
        console.log(`SMTP Error ${err}`);
      }
      else{
        console.log('SMTP server is ready to take messages');
      }
    })

    try {
      await transporter.sendMail({
        to:      user.email,
        from:    'udayrn3@gmail.com',
        subject: 'Your Password Reset Token',
        text:    `Here is your password reset token:\n\n${token}\n\nIt expires in 1 hour.`,
      });
    } catch (error) {
      console.log('send Email',error);

    }

    res.json({ message: 'Reset token sent to your email' });
  } catch (err) {
    console.error('ForgotPassword Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/authController.js
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // 1) Fetch the user by token and expiry
    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() },
    }).exec();

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // 2) Assign and save so that your pre('save') hook hashes the password
    user.password             = password;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();  // <-- this will trigger your bcrypt hash in pre('save')

    res.json({ message: 'Your password has been reset' });
  } catch (err) {
    console.error('ResetPassword Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
