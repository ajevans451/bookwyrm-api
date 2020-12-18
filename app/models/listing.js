const mongoose = require('mongoose')
const bidSchema = require('./bid')

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  sellPrice: {
    type: Number,
    required: true
  },
  minStartingBid: {
    type: Number
  },
  bids: [bidSchema],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Listing', listingSchema)
