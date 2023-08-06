const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');

router.post('/posts/:postId', authController.verifyJwt, reportController.reportPost);

router.post('/users/:userId', authController.verifyJwt, reportController.reportUser);

router.get('/', authController.verifyJwt, reportController.getReports);

router.delete('/:reportId', authController.verifyJwt, reportController.deleteReport);

module.exports = router;
