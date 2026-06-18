// Companion Chrome Extension - Content Script Scraper
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
  } else if (url.includes("greenhouse.io")) {
    title = document.querySelector("#app-title")?.innerText || "";
    company = document.querySelector(".company-name")?.innerText || "";
    if (!company) {
      const match = document.title.match(/at\s+(.+)$/i);
      if (match) company = match[1].trim();
    }
    location = document.querySelector(".location")?.innerText || "";
  } else if (url.includes("ashbyhq.com") || document.querySelector("[class*='ashby']")) {
    title = document.querySelector("h1")?.innerText || "";
    company = inferCompanyFromPageTitle(document.title, title);
    location = findLocationCandidate(title, company);
  } else if (url.includes("bamboohr.com") || url.includes("bamboohr.co")) {
    title =
      document.querySelector("h2")?.innerText || document.querySelector("h1")?.innerText || "";
    const logoImg = document.querySelector(".Logo img");
    company = logoImg?.alt || document.title.split("-")[1]?.trim() || "";
    location =
      document.querySelector(".location")?.innerText ||
      document.querySelector("[class*='location']")?.innerText ||
      "";
  } else if (url.includes("rippling.com") || url.includes("rippling-ats")) {
    title = document.querySelector("h1")?.innerText || "";
    company = document.title.split("-")[0]?.trim() || "";
    location = document.querySelector("[class*='location']")?.innerText || "";
  } else if (url.includes("linkedin.com/jobs")) {
    title =
      document.querySelector(".job-details-jobs-unified-top-card__job-title h1")?.innerText ||
      document.querySelector(".topcard__title")?.innerText ||
      document.querySelector(".top-card-layout__title")?.innerText ||
      "";
    company =
      document.querySelector(".job-details-jobs-unified-top-card__company-name a")?.innerText ||
      document.querySelector(".topcard__flavor a")?.innerText ||
      document.querySelector(".top-card-layout__subtitle a")?.innerText ||
      "";
    location =
      document.querySelector(".job-details-jobs-unified-top-card__primary-description span")
        ?.innerText ||
      document.querySelector(".topcard__flavor--bullet")?.innerText ||
      "";
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
    const locationTags = Array.from(document.querySelectorAll("span, p, div")).filter((el) => {
      const txt = el.innerText.trim();
      return (
        txt.length > 2 &&
        txt.length < 40 &&
        (txt.includes("Remote") ||
          txt.includes("Hybrid") ||
          txt.includes("On-site") ||
          txt.includes("Onsite") ||
          /^[A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2}$/.test(txt)) // Match "City, ST"
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
    const salaryRegex =
      /\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*[kK])?\s*(?:-|to)\s*\$[0-9]{2,3}(?:,[0-9]{3})*(?:\s*[kK])?/g;
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
      "[class*='content']",
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
      description = `${description.substring(0, 1200)}...`;
    }
  }

  // Final Sanitization
  title = sanitize(title);
  company = sanitize(company);
  location = sanitize(location);

  if (company && title && company.toLowerCase().includes(title.toLowerCase())) {
    company = inferCompanyFromPageTitle(company, title);
  }

  if (location && title && location.toLowerCase().includes(title.toLowerCase())) {
    location = "";
  }

  return {
    title,
    company,
    location,
    salary: sanitize(salary),
    description: description.trim(),
  };
}

function sanitize(str) {
  return str ? str.replace(/\n/g, " ").replace(/\s+/g, " ").trim() : "";
}

function inferCompanyFromPageTitle(pageTitle, jobTitle) {
  const normalizedTitle = sanitize(pageTitle);
  const normalizedJobTitle = sanitize(jobTitle);

  if (!normalizedTitle) return "";

  const atMatch = normalizedTitle.match(/\s[@]\s(.+?)(?:\s[-|]\s|$)/);
  if (atMatch) return sanitize(atMatch[1]);

  const atWordMatch = normalizedTitle.match(/\sat\s(.+?)(?:\s[-|]\s|$)/i);
  if (atWordMatch) return sanitize(atWordMatch[1]);

  if (normalizedJobTitle && normalizedTitle.startsWith(normalizedJobTitle)) {
    return sanitize(
      normalizedTitle
        .slice(normalizedJobTitle.length)
        .replace(/^(\s*[-|@]\s*|\s+at\s+)/i, ""),
    );
  }

  return "";
}

function findLocationCandidate(jobTitle, company) {
  const normalizedTitle = sanitize(jobTitle).toLowerCase();
  const normalizedCompany = sanitize(company).toLowerCase();
  const selectors = [
    "[class*='location']",
    "[data-testid*='location']",
    "[aria-label*='location' i]",
    "span",
    "p",
    "div",
  ];

  const seen = new Set();

  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll(selector));

    for (const element of elements) {
      const text = sanitize(element.innerText);
      const lowerText = text.toLowerCase();

      if (
        !text ||
        seen.has(text) ||
        text.length > 80 ||
        (normalizedTitle && lowerText.includes(normalizedTitle)) ||
        (normalizedCompany && normalizedTitle && lowerText.includes(normalizedCompany) && lowerText.includes(normalizedTitle))
      ) {
        continue;
      }

      seen.add(text);

      if (looksLikeLocation(text)) {
        return text;
      }
    }
  }

  return "";
}

function looksLikeLocation(text) {
  return (
    text.includes("Remote") ||
    text.includes("Hybrid") ||
    text.includes("On-site") ||
    text.includes("Onsite") ||
    /^[A-Z][a-zA-Z\s.'-]+,\s*[A-Z]{2}(?:,\s*[A-Za-z\s]+)?$/.test(text) ||
    /^[A-Z][a-zA-Z\s.'-]+,\s*[A-Z][a-zA-Z\s.'-]+$/.test(text)
  );
}
