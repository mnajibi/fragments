const logger = require('../../logger');
const Fragment = require('../../model');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user;
    // throw if no fragment found
    await Fragment.byId(ownerId, id);
    await Fragment.delete(ownerId, id);
    logger.info(`Deleted fragment ${id}`);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error(err);
    const errCode = err.code ? err.code : 500;
    res.status(errCode).json(createErrorResponse(errCode, err.message));
  }
};
