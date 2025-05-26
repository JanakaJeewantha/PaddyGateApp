const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Mill = require('./models/Mill');
const Price = require('./models/Price');

dotenv.config();

const users = [
  {
    username: 'admin',
    email: 'admin@paddygate.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'Admin',
    accountStatus: 'Active',
    profile: {}
  },
  {
    username: 'miller1',
    email: 'miller1@paddygate.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'Miller',
    accountStatus: 'Active',
    profile: {}
  },
  {
    username: 'farmer1',
    email: 'farmer1@paddygate.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'Farmer',
    accountStatus: 'Active',
    profile: {}
  }
];

const mills = [
  {
    name: 'Sample Mill',
    owner: null, // to be filled with userId of miller1
    location: {
      province: 'Central',
      district: 'Kandy',
      town: 'Peradeniya'
    },
    verificationStatus: 'Verified'
  }
];

const prices = [
  {
    mill: null, // to be filled with millId
    riceType: 'Nadu',
    price: 120.00
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Mill.deleteMany();
    await Price.deleteMany();

    const createdUsers = await User.insertMany(users);
    const miller = createdUsers.find(u => u.role === 'Miller');
    mills[0].owner = miller._id;
    const createdMills = await Mill.insertMany(mills);
    prices[0].mill = createdMills[0]._id;
    await Price.insertMany(prices);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Mill.deleteMany();
    await Price.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}