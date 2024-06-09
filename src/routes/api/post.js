const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const Fragment = require('../../model');
require('dotenv').config();

module.exports = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(415).json(createErrorResponse(415, `${req.get('Content-Type')} is not supported`));
  } else {
    try {
      const fragment = new Fragment({
        ownerId: req.user,
        type: req.get('Content-Type'),
      });
      await fragment.save();
      logger.info(`Saved fragment ${fragment.id}`);

      // if req.body => setData() will throw
      await fragment.setData(req.body);

      res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
      res.status(201).json(createSuccessResponse({ fragment }));
    } catch (err) {
      logger.error({ err }, 'Error posting a fragment');
      res.status(500).json(createErrorResponse(500, `Error posting a fragment: ${err.message}`));
    }
  }
};
