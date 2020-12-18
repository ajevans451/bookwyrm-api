// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for bids
const Bid = require('../models/bid')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { bid: { title: '', text: 'foo' } } -> { bid: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /bids
router.get('/bids', requireToken, (req, res, next) => {
  Bid.find()
    .then(bids => {
      // `bids` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return bids.map(bid => bid.toObject())
    })
    // respond with status 200 and JSON of the bids
    .then(bids => res.status(200).json({ bids: bids }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /bids
router.post('/bids', requireToken, (req, res, next) => {
  // set owner of new bid to be current user
  req.body.bid.owner = req.user.id

  Bid.create(req.body.bid)
    // respond to succesful `create` with status 201 and JSON of new "bid"
    .then(bid => {
      res.status(201).json({ bid: bid.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// DESTROY
// DELETE /bids/5a7db6c74d55bc51bdf39793
router.delete('/bids/:id', requireToken, (req, res, next) => {
  Bid.findById(req.params.id)
    .then(handle404)
    .then(bid => {
      // throw an error if current user doesn't own `bid`
      requireOwnership(req, bid)
      // delete the bid ONLY IF the above didn't throw
      bid.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
