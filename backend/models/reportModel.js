const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Pothole', 'Garbage Overflow', 'Broken Streetlight', 'Water Logging', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please upload an image'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
      },
    },
    status: {
      type: String,
      required: true,
      enum: ['Reported', 'Acknowledged', 'In Progress', 'Resolved'],
      default: 'Reported',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;