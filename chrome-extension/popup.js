document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("jobForm");
  const titleInput = document.getElementById("title");
  const companyInput = document.getElementById("companyName");
  const locationInput = document.getElementById("location");
  const salaryInput = document.getElementById("salaryRange");
  const statusInput = document.getElementById("status");
  const urlInput = document.getElementById("jobUrl");
  const descInput = document.getElementById("description");
  const hostInput = document.getElementById("hostUrl");
  const apiTokenInput = document.getElementById("apiToken");
  const statusBox = document.getElementById("statusBox");
  const settingsDetails = document.getElementById("settingsDetails");

  // Load Saved Settings from chrome.storage
  try {
    const settings = await chrome.storage.sync.get(["hostUrl", "apiToken"]);
    if (settings.hostUrl) {
      hostInput.value = settings.hostUrl;
    } else {
      // Default fallback
      hostInput.value = "http://localhost:3000";
    }
    if (settings.apiToken) {
      apiTokenInput.value = settings.apiToken;
    }
  } catch (err) {
    console.error("Failed to load settings:", err);
  }

  // Query Current Tab info
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      urlInput.value = tab.url;

      // Extract basic title heuristics from Tab title
      const tabTitle = tab.title || "";
      let inferredTitle = tabTitle;
      let inferredCompany = "";

      // Standard splitters: " | ", " - ", " at "
      const splitters = [" | ", " - ", " at ", " @ "];
      for (const splitter of splitters) {
        if (tabTitle.includes(splitter)) {
          const parts = tabTitle.split(splitter);
          inferredTitle = parts[0].trim();
          inferredCompany = parts[1].trim();
          break;
        }
      }

      titleInput.value = inferredTitle;
      companyInput.value = inferredCompany;

      // Send extraction request to Content Script
      if (tab.id) {
        // We wait a tiny bit to make sure content script is active, and then send a message
        chrome.tabs.sendMessage(tab.id, { action: "extractJobDetails" }, (response) => {
          // Check for errors or empty response
          if (chrome.runtime.lastError) {
            console.log("Content script connection not ready yet, using basic title parsing.");
            return;
          }

          if (response?.ok) {
            const data = response.data;
            if (data.title) titleInput.value = data.title;
            if (data.company) companyInput.value = data.company;
            if (data.location) locationInput.value = data.location;
            if (data.salary) salaryInput.value = data.salary;
            if (data.description) descInput.value = data.description;
          }
        });
      }
    }
  } catch (err) {
    console.error("Failed to extract tab information:", err);
  }

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hostUrl = hostInput.value.trim().replace(/\/$/, ""); // Strip trailing slash
    const apiToken = apiTokenInput.value.trim();

    // Check settings validation
    if (!hostUrl || !apiToken) {
      settingsDetails.open = true;
      showFeedback("Please configure your Tracker Host URL and API Token in settings.", "error");
      return;
    }

    // Save Settings
    try {
      await chrome.storage.sync.set({ hostUrl, apiToken });
    } catch (err) {
      console.error("Failed to save settings:", err);
    }

    // Build payload
    const payload = {
      title: titleInput.value.trim(),
      companyName: companyInput.value.trim(),
      location: locationInput.value.trim(),
      salaryRange: salaryInput.value.trim(),
      status: statusInput.value,
      jobUrl: urlInput.value.trim() || null,
      description: descInput.value.trim(),
    };

    showFeedback("Saving to Tracker...", "success");

    try {
      const response = await fetch(`${hostUrl}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || `HTTP error ${response.status}`);
      }

      showFeedback("SUCCESS! Job application clipped.", "success");
      setTimeout(() => {
        window.close();
      }, 1200);
    } catch (err) {
      console.error(err);
      showFeedback(err instanceof Error ? err.message : "Failed to clip job posting.", "error");
    }
  });

  // Copy AI Prompt click handler
  const copyPromptBtn = document.getElementById("btnCopyPrompt");
  copyPromptBtn.addEventListener("click", async () => {
    const hostUrl = hostInput.value.trim().replace(/\/$/, "");
    const apiToken = apiTokenInput.value.trim();

    if (!hostUrl || !apiToken) {
      settingsDetails.open = true;
      showFeedback("Please configure Host URL and API Token in settings.", "error");
      return;
    }

    const jobUrl = urlInput.value.trim() || "";

    const promptText = `Analyze the job description on this page. Generate a ready-to-run curl command to POST this job application to my Job Tracker backend.

Use this exact endpoint, headers, and JSON structure, filling in all the placeholder values (except the jobUrl, which is already filled) with details you extract from this page:

curl -X POST "${hostUrl}/api/jobs" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiToken}" \\
  -d '{
    "title": "[Extracted Job Title]",
    "companyName": "[Extracted Company Name]",
    "location": "[Extracted Location or empty string]",
    "salaryRange": "[Extracted Salary Range or empty string]",
    "status": "SAVED",
    "jobUrl": "${jobUrl}",
    "description": "[Extracted Brief Description / Summary]"
  }'

Output only the code block containing the curl command and nothing else.`;

    try {
      await navigator.clipboard.writeText(promptText);
      showFeedback("AI Prompt copied to clipboard!", "success");
    } catch (clipErr) {
      console.error("Clipboard copy failed:", clipErr);
      showFeedback("Clipboard write permission blocked.", "error");
    }
  });

  function showFeedback(message, type) {
    statusBox.textContent = message;
    statusBox.className = `status-msg status-${type}`;
    statusBox.style.display = "block";
  }
});
