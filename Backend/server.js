const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');



dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/projectRoutes'));
app.use('/api', require('./routes/timeRoutes'));
app.use('/api', require('./routes/geoRoutes'));
app.use('/api', require('./routes/employeeRoutes'))



const server = require('http').createServer(app);
const { setupSocket } = require('./socket/socketServer');
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
