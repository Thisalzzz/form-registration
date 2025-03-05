import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Google Sheets API Setup
const googleSheetsClient = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_CREDENTIALS_PATH,  // Path to credentials file
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

export const addApplicationToSheet = async (name, email, phone, cvLink) => {
    const sheets = await googleSheetsClient();

    // Prepare the data to add to the Google Sheet
    const data = [
        [name, email, phone, cvLink]
    ];

    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:D', 
        valueInputOption: 'RAW',
        resource: {
            values: data,
        },
    });

    console.log('Added data to Google Sheets:', response.data);
};
