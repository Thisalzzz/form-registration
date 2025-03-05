import express from 'express';
import { handleWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Define the webhook endpoint
router.post('/webhook', handleWebhook);

export default router;
