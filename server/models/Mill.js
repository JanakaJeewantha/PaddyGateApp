const mongoose = require('mongoose');

const riceVarieties = [
  "Samba",
  "Nadu",
  "Kekulu",
  "Red Rice",
  "White Rice",
  "Basmati",
  "Brown Rice",
  "Ponni",
  "Jasmine",
  "Suwandel",
  "Rathdel",
  "Kalu Heenati"
];

const MillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  location: {
    district: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Please provide a valid phone number']
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    }
  },
  specializations: {
    type: [String],
    enum: riceVarieties,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Pending', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mill', MillSchema);