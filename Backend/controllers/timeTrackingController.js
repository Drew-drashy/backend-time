const TimeLog = require('../models/Timelog');
const Project =require('../models/Project');
const { checkIfInsideGeofence } = require('../utils/geoUtils');

// exports.startSession = async (req, res) => {
//   try {
//     const { projectId, latitude, longitude } = req.body;
//     // checking if the location is not under 50 m it wont start.
//     // console.log(latitude, longitude);
//     const project=await Project.findById(projectId);
//     if(!project){
//       return res.status(400).json({message:'Assigned Project Cannot Be Found!'});
//     }
//     if (!project.center || !project.radius) {
//       return res.status(400).json({ message: 'Geofence is not defined for this project.' });
//     }
//     console.log(projectId,' ');
//     const isInside = checkIfInsideGeofence(
//       latitude,
//       longitude,
//       project.center.latitude,
//       project.center.longitude,
//       project.radius
//     );

//     if(!isInside) {
//       return res.status(400).json({message:'You are not at the Project Location'});
//     }

//     const now = new Date();
//     // console.log(now);
//     // console.log(project.startTime);
//     if (project.startTime && project.endTime && (now < project.startTime ||  now>project.endTime)) {
//       // format project.startTime for clearer error (optional)
//       const formatted = project.startTime.toLocaleTimeString([], {
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//       console.log('failed')
//       return res.status(400).json({
//         message: `Cannot start before the designated start time of ${formatted}.`,
//       });
//     }

//     const timeLog = await TimeLog.create({
//       user: req.user.id,
//       project: projectId,
//       startTime: new Date(),
//       startLocation: { latitude, longitude },
//     });
//     res.status(201).json(timeLog);
//   } catch (err) {
//     res.status(400).json({ message: 'Start session failed' });
//   }
// };
exports.startSession = async (req, res) => {
  try {
    const { projectId, latitude, longitude } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: 'Assigned Project Cannot Be Found!' });
    }
    if (!project.center || !project.radius) {
      return res.status(400).json({ message: 'Geofence is not defined for this project.' });
    }

    // Geofence check
    const isInside = checkIfInsideGeofence(
      latitude,
      longitude,
      project.center.latitude,
      project.center.longitude,
      project.radius
    );
    if (!isInside) {
      return res.status(400).json({ message: 'You are not at the Project Location' });
    }

    const now = new Date();

    // Time‐window checks
    if (project.startTime && now < project.startTime) {
      const fmt = project.startTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      return res.status(400).json({ message: `Cannot start before ${fmt}` });
    }
    if (project.endTime && now > project.endTime) {
      const fmt = project.endTime.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      return res.status(400).json({ message: `Cannot start after ${fmt}` });
    }

    // Create the TimeLog
    const timeLog = await TimeLog.create({
      user: req.user.id,
      project: projectId,
      startTime: now,
      startLocation: { latitude, longitude },
    });

    // ► Schedule auto‐end at project.endTime if one is set and in the future
    if (project.endTime) {
      const msUntilEnd = project.endTime.getTime() - now.getTime();
      if (msUntilEnd > 0) {
        setTimeout(async () => {
          try {
            const session = await TimeLog.findById(timeLog._id);
            if (session && !session.endTime) {
              session.endTime = project.endTime;
              session.endLocation = session.startLocation;    // or null
              session.totalHours = (session.endTime - session.startTime) / 3_600_000;
              await session.save();
              console.log(`Auto-ended session ${session._id}`);
            }
          } catch (e) {
            console.error('Auto-end failed for session', timeLog._id, e);
          }
        }, msUntilEnd);
      } else {
        // If endTime is already passed, end immediately
        timeLog.endTime = project.endTime;
        timeLog.endLocation = { latitude, longitude };
        timeLog.totalHours = (project.endTime - now) / 3_600_000;
        await timeLog.save();
      }
    }

    return res.status(201).json(timeLog);
  } catch (err) {
    console.error('startSession error:', err);
    return res.status(400).json({ message: 'Start session failed' });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId, latitude, longitude } = req.body;
    const session = await TimeLog.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const project = await Project.findById(session.project);
    if (!project) return res.status(400).json({ message: 'Assigned Project Cannot Be Found!' });

    // Geofence check...
    const isInside = checkIfInsideGeofence(
      latitude, longitude,
      project.center.latitude, project.center.longitude,
      project.radius
    );
    if (!isInside) {
      return res.status(400).json({ message: 'You are not at the Project Location' });
    }

    // End the session
    // session.endTime = new Date();
    if (session.endTime) {
      return res
        .status(409)
        .json({ msg: 'Session has already ended.' });
    }

    session.endLocation = { latitude, longitude };

    // Calculate hours, rounded to 2 decimals
    const diffMs = session.endTime.getTime() - session.startTime.getTime();
    const hours = diffMs / 3600000;
    session.totalHours = Number(hours.toFixed(2));

    await session.save();
    res.status(200).json(session);

  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ message: 'End session failed' });
  }
};




exports.getLogs = async (req, res) => {
  try {
    const { projectId, groupByDate } = req.query;
    const userId = req.user.id;

    const filter = { user: userId };
    if (projectId) filter.project = projectId;

    const logs = await TimeLog.find(filter).populate('project', 'name');

    // If grouping is requested (e.g., for calendar view)
    if (groupByDate === 'true') {
      const grouped = logs.reduce((acc, log) => {
        const date = log.startTime.toISOString().split('T')[0];

        if (!acc[date]) {
          acc[date] = {
            date,
            totalHours: 0,
            images: [],
            project: log.project.name,
          };
        }

        acc[date].totalHours += log.totalHours || 0;

        if (log.uploads && Array.isArray(log.uploads)) {
          acc[date].images.push(...log.uploads);
        }

        return acc;
      }, {});

      return res.json(Object.values(grouped));
    }

    // Basic flat list return
    return res.json(logs);
  } catch (err) {
    console.error('Log fetch error:', err);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

// const TimeLog = require('../models/TimeLog');

/**
 * GET /api/time/logs/admin/:employeeId
 * Query params:
 *   - groupByDate=true  → returns [{ date, totalHours, images: [] }, …]
 * Otherwise returns flat array of TimeLog documents.
 */
exports.getLogsByAdmin = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { groupByDate } = req.query;

    // Fetch all logs for that user, plus project name and any uploads array
    const logs = await TimeLog.find({ user: employeeId })
      .populate('project', 'name')
      .sort({ startTime: -1 });

    if (groupByDate === 'true') {
      // Group logs by day
      const grouped = logs.reduce((acc, log) => {
        const date = log.startTime.toISOString().split('T')[0]; 
        if (!acc[date]) {
          acc[date] = { date, totalHours: 0, images: [] };
        }
        acc[date].totalHours += log.totalHours || 0;
        if (Array.isArray(log.uploads)) {
          acc[date].images.push(...log.uploads);
        }
        return acc;
      }, {});
      return res.status(200).json(Object.values(grouped));
    }

    // Flat list fallback
    return res.status(200).json(logs);
  } catch (err) {
    console.error('Admin log fetch error:', err);
    return res.status(500).json({ message: 'Error fetching employee logs' });
  }
};
