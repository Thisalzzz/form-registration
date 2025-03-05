import express from 'express';
import multer from 'multer';
import { submitJobApplication } from '../controllers/jobApplicationController.js';

//initialize router
const router = express.Router();

//configure multer
const upload = multer({dest:"uploads/"})

//define post route
router.post("/", upload.single("cv"),submitJobApplication)

export const jobApplicationRoutes = router; 