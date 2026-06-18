# Job Tracker Companion - Chrome Extension

This companion extension allows you to clip job application details from popular platforms (including **Ashby, Greenhouse, Lever, Rippling, BambooHR, LinkedIn**, and more) and save them directly to your local or deployed **Job Tracker** app.

## Features
- **Auto-scraping**: Custom selectors parse key fields like Job Title, Company, Location, and Salary.
- **Smart Salary Finder**: Uses regex to extract salary ranges automatically from page body text.
- **Active Snippet Capture**: Highlight any text on the job page to auto-fill it as the job description snippet in the popup.
- **Neo-Brutalist UI**: Designed to match the aesthetic of the main dashboard.

---

## Installation Instructions

1. Open **Google Chrome** and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `chrome-extension` folder inside this project's root directory.

The **Job Tracker Companion** icon will now appear in your browser toolbar!

---

## Configuration

1. In your Next.js project's `.env` file, ensure you have configured the `API_TOKEN` environment variable:
   ```env
   API_TOKEN="your-secure-access-token"
   ```
   *(Ensure you restart your Next.js development server after adding/updating `.env` variables)*

2. Click the extension icon in your browser toolbar to open the popup.
3. Click the **Settings & Connection** header to expand connection configuration:
   - **Tracker Host URL**: E.g. `http://localhost:3000` (for local development) or your deployed production URL.
   - **API Access Token**: Enter the exact `API_TOKEN` value set in your `.env` file (e.g. `jobtracker-companion-token-2026`).
4. These connection settings are saved automatically in your browser's sync storage, so you only need to configure them once!

---

## Usage

1. Navigate to a job posting on any supported board (e.g., a Greenhouse board, Lever post, Ashby job listing, or LinkedIn page).
2. *(Optional)* **Highlight text** on the page (e.g., job requirements or description) before opening the extension.
3. Click the extension icon. The extension will:
   - Autofill the **Job Title**, **Company**, **Location**, and **Salary** using platform-specific rules or smart page-wide fallback scrapers.
   - Autofill the **Job URL** using the tab's current web address.
   - Autofill the **Description** using the text you highlighted.
4. Review or edit the fields.
5. Select an initial status (e.g., `Saved`, `Applied`).
6. Click **Clip Application**.
7. The popup will show a success notification, close automatically, and the new application will appear instantly on your Job Tracker dashboard!
