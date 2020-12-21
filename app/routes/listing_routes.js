// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

const Listing = require('../models/listing')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /listings
router.get('/listings', requireToken, (req, res, next) => {
  Listing.find()
    .populate('owner')
    .populate('bids.owner')
    .then(listings => {
      return listings.map(listing => listing.toObject())
    })
    // respond with status 200 and JSON of the listings
    .then(listings => res.status(200).json({ listings: listings }))
    .catch(next)
})

// SHOW
// GET /listings/5a7db6c74d55bc51bdf39793
router.get('/listings/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Listing.findById(req.params.id)
    .populate('owner')
    .populate('bids.owner')
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "listing" JSON
    .then(listing => res.status(200).json({ listing: listing.toObject() }))
    .catch(next)
})

// CREATE
// POST /listings
router.post('/listings', requireToken, (req, res, next) => {
  // set owner of new listing to be current user
  req.body.listing.owner = req.user.id

  Listing.create(req.body.listing)
    // respond to succesful `create` with status 201 and JSON of new "listing"
    .then(listing => {
      res.status(201).json({ listing: listing.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /listings/5a7db6c74d55bc51bdf39793
router.patch('/listings/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.listing.owner

  Listing.findById(req.params.id)
    .then(handle404)
    .then(listing => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, listing)

      // pass the result of Mongoose's `.update` to the next `.then`
      return listing.updateOne(req.body.listing)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /listings/5a7db6c74d55bc51bdf39793
router.delete('/listings/:id', requireToken, (req, res, next) => {
  Listing.findById(req.params.id)
    .then(handle404)
    .then(listing => {
      // throw an error if current user doesn't own `listing`
      requireOwnership(req, listing)
      // delete the listing ONLY IF the above didn't throw
      listing.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
