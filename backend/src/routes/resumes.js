const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/resumeController');

router.post('/auto-generate', controller.autoGenerate);

// Apply auth only after this
router.use(auth);

router.get('/', controller.list);
router.post('/', controller.create);
// Specific routes MUST come before parameterized routes
router.post('/auto-generate', controller.autoGenerate);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

router.post('/:id/ai-populate', controller.aiPopulate)
router.post('/:id/generate-pdf', controller.generatePdfHandler);
router.post('/:id/ats-check', controller.atsCheck);

module.exports = router;
