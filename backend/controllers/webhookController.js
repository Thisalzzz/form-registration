import { addApplicationToSheet } from '../utils/googleSheets.js'; // Re-import if needed

// Webhook handler for new job applications
export const handleWebhook = async (req, res) => {
    try {
        const { name, email, phone, cvLink } = req.body;

        // Ensure that data exists
        if (!name || !email || !phone || !cvLink) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Add data to Google Sheets via the already defined function
        await addApplicationToSheet(name, email, phone, cvLink);

        // Respond back to indicate successful handling
        res.status(200).json({ message: "Webhook handled successfully!" });
    } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).json({ message: "Something went wrong with the webhook!" });
    }
};
