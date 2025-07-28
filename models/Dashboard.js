const mongoose = require('mongoose');
const { Schema } = mongoose;

const dashboardInnerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  defines: [
    {
      key: { type: String, required: true },
      title: {type: String, required: true},
      type: { 
        type: String, 
        required: true,
        enum: ['user', 'text', 'date', 'status'],
      },
      required: { type: Boolean, default: false },
    },
  ],
  groups: [
    {
      name: { type: String, required: true },
      color: { type: String, required: true },
      items: [
        {
          type: Map,
          of: Schema.Types.Mixed,
        },
      ],
    },
  ],
});

const dashboardSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dashboards: [dashboardInnerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dashboard', dashboardSchema);
