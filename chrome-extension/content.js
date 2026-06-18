// Companion Chrome Extension - Content Script Scraper
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobDetails") {
    try {
      const data = parsePage();
      sendResponse({ ok: true, data });
    } catch (err) {
      console.error("Extraction error:", err);
      sendResponse({ ok: false, error: err.message });
    }
  }
  return true; // Keep channel open for async response
});

function parsePage() {
  const url = window.location.href;
  const selection = window.getSelection().toString().trim();

  let title = "";
  let company = "";
  let location = "";
  let salary = "";
  let description = selection || ""; // Default description to highlighted text

  // 1. Platform-Specific Scrapers
  if (url.includes("lever.co")) {
    title = document.querySelector(".posting-header h2")?.innerText || "";
    // Lever title is usually "Company - Title | Location"
    company = document.title.split("-")[0]?.trim() || "";
    location = document.querySelector(".posting-categories .location")?.innerText || "";
  } 
  else if (url.includes("greenhouse.io")) {
    title = document.querySelector("#app-title")?.innerText || "";
    company = document.querySelector(".company-name")?.innerText || "";
    if (!company) {
      const match = document.title.match(/at\s+(.+)$/i);
      if (match) company = match[1].trim();
    }
    location = document.querySelector(".location")?.innerText || "";
  } 
  else if (url.includes("ashbyhq.com") || document.querySelector("[class*='ashby']")) {
    title = document.querySelector("h1")?.innerText || "";
    company = document.title.split("-")[0]?.trim() || "";
    // Ashby common location classes
    const locEl = document.querySelector("[class*='location']") || 
                  document.querySelector("[class*='JobPostingHeader'] p");
    location = locEl?.innerText || "";
  } 
  else if (url.includes("bamboohr.com") || url.includes("bamboohr.co")) {
    title = document.querySelector("h2")?.innerText || document.querySelector("h1")?.innerText || "";
    const logoImg = document.querySelector(".Logo img");
    company = logoImg?.alt || document.title.split("-")[1]?.trim() || "";
    location = document.querySelector(".location")?.innerText || 
               document.querySelector("[class*='location']")?.innerText || "";
  } 
  else if (url.includes("rippling.com") || url.includes("rippling-ats")) {
    title = document.querySelector("h1")?.innerText || "";
    company = document.title.split("-")[0]?.trim() || "";
    location = document.querySelector("[class*='location']")?.innerText || "";
  } 
  else if (url.includes("linkedin.com/jobs")) {
    title = document.querySelector(".job-details-jobs-unified-top-card__job-title h1")?.innerText || 
            document.querySelector(".topcard__title")?.innerText || 
            document.querySelector(".top-card-layout__title")?.innerText || "";
    company = document.querySelector(".job-details-jobs-unified-top-card__company-name a")?.innerText || 
              document.querySelector(".topcard__flavor a")?.innerText || 
              document.querySelector(".top-card-layout__subtitle a")?.innerText || "";
    location = document.querySelector(".job-details-jobs-unified-top-card__primary-description span")?.innerText || 
               document.querySelector(".topcard__flavor--bullet")?.innerText || "";
  }

  // 2. Generic Fallbacks for Unmatched URLs
  if (!title) {
    title = document.querySelector("h1")?.innerText || "";
  }

  if (!company) {
    // Check common meta tags
    const metaOgSite = document.querySelector("meta[property='og:site_name']");
    if (metaOgSite) company = metaOgSite.getAttribute("content") || "";

    // Parse from tab title fallback
    if (!company && document.title.includes(" - ")) {
      company = document.title.split(" - ")[0].trim();
    }
  }

  if (!location) {
    // Look for location keywords in small text
    const locationTags = Array.from(document.querySelectorAll("span, p, div")).filter(el => {
      const txt = el.innerText.trim();
      return txt.length > 2 && txt.length < 40 && (
        txt.includes("Remote") || 
        txt.includes("Hybrid") || 
        txt.includes("On-site") || 
        txt.includes("Onsite") ||
        /^[A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2}$/.test(txt) // Match "City, ST"
      );
    });
    if (locationTags.length > 0) {
      location = locationTags[0].innerText.trim();
    }
  }

  // 3. Smart Salary Extraction via Regular Expressions
  if (!salary) {
    const textToSearch = document.body.innerText;
    // Matches patterns like "$120,000 - $160,000", "$140k to $180k", "$80/hr", "$90,000/yr"
    const salaryRegex = /\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*[kK])?\s*(?:-|to)\s*\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*[kK])?/g;
    const matches = textToSearch.match(salaryRegex);
    if (matches && matches.length > 0) {
      salary = matches[0].trim();
    }
  }

  // 4. Description Fallback (if user didn't select text)
  if (!description) {
    const descriptionSelectors = [
      "[class*='description']",
      "[id*='desc']",
      ".job-description",
      "#job-description",
      "main article",
      "[class*='content']"
    ];
    for (const sel of descriptionSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.trim().length > 100) {
        description = el.innerText.trim();
        break;
      }
    }
    // Truncate to avoid payload bloat
    if (description.length > 1200) {
      description = description.substring(0, 1200) + "...";
    }
  }

  // Final Sanitization
  return {
    title: sanitize(title),
    company: sanitize(company),
    location: sanitize(location),
    salary: sanitize(salary),
    description: description.trim()
  };
}

function sanitize(str) {
  return str ? str.replace(/\n/g, " ").replace(/\s+/g, " ").trim() : "";
}
