// src/routes/index.js

const express = require('express');
const { authenticate } = require('../auth');
const { hostname } = require('os');

// Create a router that we can use to mount our API
const router = express.Router();

const { createSuccessResponse } = require('../response');

// version and author from package.json
const { version, author } = require('../../package.json');

// Expose all of our API routes on /v1/* to include an API version
// Protect them all with middleware so you have to be authenticated to access things
router.use('/v1', authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  // Send a 200 'OK' response
  res.status(200).json(
    createSuccessResponse({
      author,
      githubUrl: 'https://github.com/mnajibi/fragments',
      version,
      // Include the hostname in the response
      hostname: hostname(),
    })
  );
});

module.exports = router;
