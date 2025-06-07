const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    console.log('im in project');
    console.log(req.body);
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    console.log('error babe');
    res.status(400).json({ message: 'Project creation failed', error: err });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;         // current page
    const limit = parseInt(req.query.limit) || 10;      // items per page
    const skip = (page - 1) * limit;
    const {search='',status, date}=req.query;
    const filter={};
    if(search){
      filter.name={$regex: search,$options:'i'};
    }
    if(status){
      filter.status=status;
    }
    if(date){
      filter.deadline={$lte: new Date(date)};
    }

    const total = await Project.countDocuments();        // total items
    const projects = await Project.find(filter)
      .populate('assignedEmployees', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first (optional)

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      projects,
    });
  } catch (err) {
    console.error('Pagination Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    console.log(req.body);
    const {name,
      description,
      center,
      radius,
      workingHours,
      status,
      startTime,
      endTime,
      addressName,
      assignedEmails,deadline}=req.body;
      const assignedEmployees=assignedEmails;
    const users = await User.find(
      { email: { $in: assignedEmployees } },
      '_id'
    );
    // console.log(users,'users')
    const userIds = users.map(u => u._id);
    // console.log(userIds);

    const project = await Project.findByIdAndUpdate(req.params.id,
       {name,
      description,
      center,
      radius,
      workingHours,
      status,
      deadline,
      startTime,
      endTime,
      addressName,
      assignedEmployees:userIds}, { new: true });
    console.log(project,'project in backend');
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: 'Update failed' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};
