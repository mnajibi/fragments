// src/routes/api/get.js
const logger = require('../../logger');
const Fragment = require('../../model');
const { createSuccessResponse, createErrorResponse } = require('../../response');
/**
 * Get a list of fragments for the current user
 */
module.exports.get = (req, res) => {
  // this is just a placeholder to get something working
  res.status(200).json(createSuccessResponse({ fragments: [] }));
};

module.exports.getById = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, `Error getting fragment with id ${id}`);
    if (err.code === 404) {
      res.status(err.code).json(createErrorResponse(err.status, err.message));
    } else {
      res.status(500).json(createErrorResponse(500, err.message));
    }
  }
};
