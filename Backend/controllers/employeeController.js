const User= require('../models/User');
const protect =require('../middleware/authMiddleware');
const { getProfile } = require('./authController');
const e = require('express');
const Project=require('../models/Project');

exports.getEmployee= async (req,res)=>{
    // console.log('hii');
    try{
        // console.log(req.params);
        const {employeeId}=req.params;
        const employee=await User.findById(employeeId);
        if(!employee) return res.status(400).json({message:'Employee Id is not Found'});
        // console.log(employee);
        return res.status(200).json({employee});
    }
    catch(err){
         console.error('getEmployee error:', err);
        return res.status(500).json({ message: 'Failed to fetch employee' });
    }
}

exports.removeEmployeeFromProject =async(req,res)=>{
    try{
        const {projectId,employeeId}=req.params;
    const project=await Project.findById(projectId);
    if(!project){
        return res.status(400).json({message: "Project Not Found"});
    }
    project.assignedEmployees=project.assignedEmployees.filter((id)=>id.toString()!==employeeId);
    await project.save();

    return res.status(200).json({message: 'employee removed from the project',project});

    }
    catch(err){
         console.error('Remove Employee Error:', err);
        return res.status(500).json({ message: 'Failed to remove employee from project' });
    }
}

exports.getEmails=async(req,res)=>{
    try{
        const {email}=req.body;
        const lowerEmail=email.toLowerCase();
        // console.log(email,'emailssss');
        if(!lowerEmail || lowerEmail.length<2) return res.json({emails:[]});

        const user=await User
        .find({email:{$regex: '^'+lowerEmail,$options: 'i'}})
        .limit(10)
        .select('email -_id');

        res.json({emails:user.map(u=>u.email)});

    }
    catch(err){
        console.error(err);
        return res.status(400).json({message:'Cannot find the Emails'});
    }
}