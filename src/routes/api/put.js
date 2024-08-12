const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model');
const logger = require('../../logger');

module.exports.putById = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    logger.warn(`${req.get('Content-Type')} can't be changed after created`);
    return res
      .status(400)
      .json(createErrorResponse(415, `${req.get('Content-Type')} can't be changed after created`));
  }

  try {
    const { id } = req.params;
    const ownerId = req.user;
    const fragment = await Fragment.byId(ownerId, id);

    await fragment.setData(req.body);
    await fragment.save();
    logger.info(`Updated fragment + data ${fragment.id}`);
    logger.debug('Updated fragment', { fragment });

    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error updating a fragment');
    res.status(500).json(createErrorResponse(500, `Error updating a fragment, ${err.message}`));
  }
};
