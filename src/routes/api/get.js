// src/routes/api/get.js
const path = require('path');
const logger = require('../../logger');
const Fragment = require('../../model');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const mime = require('mime-types');
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

/**
 * GET /fragments/:id/info returns an existing fragment's metadata
 *
 * GET /fragments/:id.ext returns an existing fragment's data converted to a supported type.
 *
 * @param {*} req
 * @param {*} res
 */
module.exports.getById = async (req, res) => {
  const { name: id, ext } = path.parse(req.params.id);
  const ownerId = req.user;

  // get mime type from id.ext
  const mime_type = mime.lookup(ext);
  if (ext && !mime_type) {
    logger.error(`Invalid mime_type with extension ${ext}`);
    return res
      .status(404)
      .json(createErrorResponse(404, `Invalid mime_type with extension ${ext}`));
  }
  try {
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found`));
    }
    const fragmentData = await fragment.getData();

    if (ext && mime_type) {
      const convertedData = await fragment.convertBuffer(ext, fragmentData);
      res.setHeader('Content-Type', mime_type);
      return res.status(200).send(convertedData);
    }

    logger.info(`Got fragment ${fragment.id}'s data, no conversion needed`);
    res.setHeader('Content-Type', fragment.mimeType);
    return res.status(200).send(fragmentData);
  } catch (err) {
    logger.error({ err }, `Error getting fragment with id ${id}`);
    if (err.code === 404 || err.code === 400) {
      return res.status(err.code).json(createErrorResponse(err.status, err.message));
    }
    res.status(500).json(createErrorResponse(500, err.message));
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
