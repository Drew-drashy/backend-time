const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
