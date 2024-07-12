// src/routes/api/get.js
const logger = require('../../logger');
const Fragment = require('../../model');
const { createSuccessResponse, createErrorResponse } = require('../../response');
/**
 * Get a list of fragments for the current user
 */
module.exports.get = async (req, res) => {
  const expand = parseInt(req.query.expand);

  try {
    const fragments = expand
      ? await Fragment.byUser(req.user, true)
      : await Fragment.byUser(req.user);
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (err) {
    logger.error({ err }, 'Error getting fragments');
    res.status(500).json(createErrorResponse(500, err));
  }
};

module.exports.getById = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const fragmentData = await fragment.getData();
    const convertedData = Fragment.convertFromBuffer('text/plain', fragmentData);
    res.status(200).json(createSuccessResponse({ data: convertedData }));
  } catch (err) {
    logger.error({ err }, `Error getting fragment with id ${id}`);
    if (err.code === 404) {
      res.status(err.code).json(createErrorResponse(err.status, err.message));
    } else {
      res.status(500).json(createErrorResponse(500, err.message));
    }
  }
};

module.exports.getInfoById = async (req, res) => {
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
