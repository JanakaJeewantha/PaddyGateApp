const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // --- ADMIN SEEDING START ---
    const User = require('./models/User');
    const adminData = {
      username: "admin",
      email: "admin@paddygate.com",
      password: "Admin@123",
      role: "Admin",
      profile: {
        name: "Admin",
        contact: { phone: "0111111111" },
        location: {
          district: "Colombo",
          geoLocation: { type: "Point", coordinates: [79.8612, 6.9271] }
        }
      },
      accountStatus: "Active"
    };

    const adminExists = await User.findOne({ email: adminData.email, role: "Admin" });
    if (!adminExists) {
      const adminUser = new User(adminData);
      await adminUser.save();
      console.log("Default admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
    // --- ADMIN SEEDING END ---

  })
  .catch(err => console.log('MongoDB Connection Error:', err));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('priceUpdate', (data) => {
    io.emit('newPrice', data);
  });
});

// --- ROUTES REGISTRATION ORDER MATTERS ---
// Always require and use routes after DB connection and middleware

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prices', require('./routes/prices')); // <-- Make sure this file exists!
app.use('/api/mills', require('./routes/mills'));
app.use('/api/admin', require('./routes/admin'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

app.get('/', (req, res) => {
  res.send('Paddy Gate API is running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));