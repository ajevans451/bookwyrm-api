const express = require('express')
const passport = require('passport')

const Listing = require('../models/listing')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// index
router.get('/listings', requireToken, (req, res, next) => {
  Listing.find()
    .populate('owner')
    .populate('bids.owner')
    .then(listings => {
      return listings.map(listing => listing.toObject())
    })
    .then(listings => res.status(200).json({ listings: listings }))
    .catch(next)
})

// show
router.get('/listings/:id', requireToken, (req, res, next) => {
  Listing.findById(req.params.id)
    .populate('owner')
    .populate('bids.owner')
    .then(handle404)
    .then(listing => res.status(200).json({ listing: listing.toObject() }))
    .catch(next)
})

// create
router.post('/listings', requireToken, (req, res, next) => {
  req.body.listing.owner = req.user.id

  Listing.create(req.body.listing)
    .then(listing => {
      res.status(201).json({ listing: listing.toObject() })
    })
    .catch(next)
})

// update
router.patch('/listings/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.listing.owner

  Listing.findById(req.params.id)
    .then(handle404)
    .then(listing => {
      requireOwnership(req, listing)

      return listing.updateOne(req.body.listing)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// delete
router.delete('/listings/:id', requireToken, (req, res, next) => {
  Listing.findById(req.params.id)
    .then(handle404)
    .then(listing => {
      requireOwnership(req, listing)
      listing.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
