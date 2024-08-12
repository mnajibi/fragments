const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model');
const logger = require('../../logger');

module.exports.putById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user;
    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, `Fragment ${id} not found  `));
    }
    if (fragment.mimeType !== req.get('Content-Type')) {
      logger.warn(`${req.get('Content-Type')} can't be changed after created`);
      return res
        .status(400)
        .json(
          createErrorResponse(415, `${req.get('Content-Type')} can't be changed after created`)
        );
    }

    await fragment.setData(req.body);
    await fragment.save();
    logger.info(`Updated fragment + data ${fragment.id}`);
    logger.debug('Updated fragment', { fragment });

    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'Error updating a fragment');
    if (err.code === 404) {
      return res.status(404).json(createErrorResponse(404, err));
    }
    res.status(500).json(createErrorResponse(500, `Error updating a fragment, ${err.message}`));
  }
};
