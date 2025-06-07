const Geofence = require('../models/Geofence');

exports.createGeofence = async (req, res) => {
  try {
    const { project, center, radius } = req.body;
    const geo = await Geofence.create({ project, center, radius });
    res.status(201).json(geo);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create geofence', error: err });
  }
};

exports.getGeofences = async (req, res) => {
  try {
    const fences = await Geofence.find().populate('project', 'name');
    res.json(fences);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching geofences' });
  }
};

exports.getGeofenceByProject = async (req, res) => {
  try {
    const fence = await Geofence.findOne({ project: req.params.projectId });
    res.json(fence);
  } catch (err) {
    res.status(404).json({ message: 'Geofence not found' });
  }
};
