const express = require('express');
const pushTokenController = require('../../controllers/pushToken.controller');
const pushTokenValidation = require('../../validations/pushToken.validation');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');

const router = express.Router();

router
  .route('/save')
  .post(auth(), validate(pushTokenValidation.savePushToken), pushTokenController.savePushToken);

router
  .route('/send')
  .post(auth('manageUsers'), validate(pushTokenValidation.sendNotification), pushTokenController.sendNotification);

router
  .route('/remove')
  .delete(auth(), validate(pushTokenValidation.removePushToken), pushTokenController.removePushToken);

router
  .route('/remove-all')
  .delete(auth(), pushTokenController.removeAllTokens);

module.exports = router;
