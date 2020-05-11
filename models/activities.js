const mongoose = require('mongoose');

const actSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'accounts'
  },
  code: {
    type: String,
    required: true
  },
  numTPI: {
    type: Number,
    default: 0
  },
  listCheckin: [{
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'Không có tên'
    },
    checkinAt: {
      type: Date,
    },
    createAt: {
      type: Date,
    },
    token: {
      type: String,
      required: true
    },
    ipCheckin: {
      type: String,
    },
    timezone: {
      type: String,
    },
    loc: {
      type: String,
    },
    isChecked: {
      type: Boolean,
      default: false
    }
  }],
  isHaveFile: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
});
module.exports = mongoose.model('activities', actSchema);

