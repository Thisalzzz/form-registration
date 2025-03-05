import axios from 'axios';  // HTTP requests
import cloudinary from '../config/cloudinaryConfig.js';  // Cloudinary setup
import { addApplicationToSheet } from '../config/googleSheets.js'; // Google Sheets integration
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Function to schedule email
const scheduleEmail = async (recipientEmail, recipientName, scheduleTime) => {
    const mailData = {
        Messages: [
            {
                From: {
                    Email: process.env.MAILJET_SENDER_EMAIL,
                    Name: "Your Company Name",
                },
                To: [
                    {
                        Email: recipientEmail,
                        Name: recipientName,
                    },
                ],
                Subject: "Job Application Received",
                TextPart: `Dear ${recipientName}, your job application has been received. We will review it shortly.`,
                HTMLPart: `<h3>Job Application Received</h3><p>Dear ${recipientName}, your job application has been successfully received. Thank you for applying!</p>`,
                SendAt: scheduleTime,  // Future scheduled time in ISO 8601 format
            },
        ],
    };

    try {
        const response = await axios.post('https://api.mailjet.com/v3.1/send', mailData, {
            auth: {
                username: process.env.MAILJET_API_KEY,
                password: process.env.MAILJET_API_SECRET,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log("Scheduled email response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error scheduling email:", error.response?.data || error.message);
    }
};

// Job application controller
export const submitJobApplication = async (req, res) => {
    const { name, email, phone } = req.body;
    const cvFile = req.file;

    // Check if the CV file exists
    if (!cvFile) {
        console.error("No CV file uploaded!");
        return res.status(400).json({ message: 'CV file is required!' });
    }

    try {
        // Upload CV to Cloudinary
        const cloudinaryRes = await cloudinary.uploader.upload(cvFile.path);
        console.log("Cloudinary File URL:", cloudinaryRes.secure_url);

        // Add application details to Google Sheets
        await addApplicationToSheet(name, email, phone, cloudinaryRes.secure_url);

        // Schedule email for 3 minutes later
        const scheduledTime = new Date();
        scheduledTime.setMinutes(scheduledTime.getHours() + 10); 
        await scheduleEmail(email, name, scheduledTime.toISOString());

        // Send Webhook Request
        const webhookPayload = {
            cv_data: {
                personal_info: { name, email, phone },
                cv_public_link: cloudinaryRes.secure_url,
            },
            metadata: {
                applicant_name: name,
                email,
                status: "prod",
                cv_processed: true,
                processed_timestamp: new Date().toISOString(),
            }
        };

        await axios.post('https://rnd-assignment.automations-3d6.workers.dev/', webhookPayload, {
            headers: {
                'X-Candidate-Email': email,
                'Content-Type': 'application/json',
            },
        });

        console.log("Webhook request sent successfully.");

        // Respond with Cloudinary link of CV
        res.status(200).json({
            message: "Job application submitted successfully. Confirmation email scheduled!",
            cloudinaryLink: cloudinaryRes.secure_url,
        });

    } catch (error) {
        console.error("Error in job application process:", error);
        res.status(500).json({ message: "Something went wrong!" });
    } finally {
        // Delete the local file after uploading to Cloudinary
        if (cvFile && fs.existsSync(cvFile.path)) {
            try {
                console.log("Deleting temporary CV file:", cvFile.path);
                fs.unlinkSync(cvFile.path);
            } catch (deleteError) {
                console.error("Error deleting temporary CV file:", deleteError);
            }
        }
    }
};
