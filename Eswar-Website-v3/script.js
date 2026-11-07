/* =========================================================
   ESWAR MATHEMATICS TUITION CENTRE - CONCEPT PREVIEW
   Plain JavaScript. No libraries. Nothing is sent to any server.
   ========================================================= */

/* ---------------------------------------------------------
   1. BUSINESS DETAILS  <-- EDIT HERE ONCE THE OWNER APPROVES
   ---------------------------------------------------------
   Leave a value as "" and the page keeps showing "to be confirmed".
   The floating buttons follow these values too: WhatsApp shows only when
   whatsappNumber is valid, Call only when phone is set, and Location
   only when mapsUrl is set.

   whatsappNumber: digits only, with country code, no "+", spaces or dashes.
     Example format for an Indian number: "91XXXXXXXXXX"
     (91 is India's country code, then the 10-digit number).
   phone:          how the number should be shown, e.g. "+91 XXXXX XXXXX".
   address:        the full address as text.
   mapsUrl:        a Google Maps link to the business (opens in a new tab).
   mapEmbedUrl:    optional. The "src" web address from Google Maps >
                   Share > Embed a map.
--------------------------------------------------------- */
const CONFIG = {
  whatsappNumber: "",   // <-- REPLACE with the approved number, e.g. "91XXXXXXXXXX"
  phone: "",
  address: "",
  mapsUrl: "",
  mapEmbedUrl: ""
};

/* ---------------------------------------------------------
   2. SMALL HELPERS
--------------------------------------------------------- */
// True only if the WhatsApp number looks real: 8 to 15 digits.
function hasValidWhatsAppNumber() {
  return /^\d{8,15}$/.test(CONFIG.whatsappNumber);
}

// Fill every element marked data-contact="name" with text, or a link if href is given.
function fillContact(name, text, href) {
  document.querySelectorAll('[data-contact="' + name + '"]').forEach(function (el) {
    el.textContent = "";
    if (href) {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      if (href.indexOf("http") === 0) { link.target = "_blank"; link.rel = "noopener"; }
      el.appendChild(link);
    } else {
      el.textContent = text;
    }
  });
}

// Reveal one floating button and point it at its link.
function showDockLink(id, href) {
  const button = document.getElementById(id);
  if (!button) return;
  button.href = href;
  button.hidden = false;
}

/* ---------------------------------------------------------
   3. SHOW CONFIGURED CONTACT DETAILS
   Also reveals the matching floating buttons.
--------------------------------------------------------- */
function applyConfig() {
  if (CONFIG.phone) {
    const phoneHref = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
    fillContact("phone", CONFIG.phone, phoneHref);
    showDockLink("fab-call", phoneHref);
  }
  if (hasValidWhatsAppNumber()) {
    const whatsappHref = "https://wa.me/" + CONFIG.whatsappNumber;
    fillContact("whatsapp", "Message on WhatsApp", whatsappHref);
    showDockLink("fab-whatsapp", whatsappHref);
  }
  if (CONFIG.address) {
    fillContact("address", CONFIG.address);
  }
  if (CONFIG.mapsUrl) {
    showDockLink("fab-location", CONFIG.mapsUrl);
  }

  const mapArea = document.getElementById("map-area");
  if (mapArea && (CONFIG.mapEmbedUrl || CONFIG.mapsUrl)) {
    mapArea.classList.remove("placeholder-card");
    mapArea.textContent = "";
    if (CONFIG.mapEmbedUrl) {
      const frame = document.createElement("iframe");
      frame.src = CONFIG.mapEmbedUrl;
      frame.title = "Map showing the location of Eswar Mathematics Tuition Centre";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      mapArea.appendChild(frame);
    }
    if (CONFIG.mapsUrl) {
      const link = document.createElement("a");
      link.href = CONFIG.mapsUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open in Google Maps";
      mapArea.appendChild(link);
    }
  }
}

/* ---------------------------------------------------------
   4. MOBILE NAVIGATION
   The button toggles the "open" class on the menu.
--------------------------------------------------------- */
function setupNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("open"));
  });
  // Close the menu after choosing a link
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setOpen(false); });
  });
  // Close with the Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------------------------------------------------------
   5. PARENT ENQUIRY FORM
   Steps: validate -> build message -> show preview ->
   the parent chooses "Copy Message" or "Open WhatsApp".
   (Smooth scrolling is handled by CSS: html { scroll-behavior: smooth }.)
--------------------------------------------------------- */
// Fields that must be filled in. Each id matches the HTML.
const REQUIRED_FIELDS = ["studentClass", "subject", "arrangement", "parentName"];

// The message that is currently previewed ("" when there is none).
let currentMessage = "";

// --- Safe helpers: they do nothing (instead of crashing) if an element is missing from the HTML ---
function getField(id) {
  return document.getElementById(id);
}

function fieldValue(id) {
  const field = getField(id);
  return field ? field.value.trim() : "";
}

// Writes text into a status element. type is "success", "error", "note", or "" for plain text.
function setStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove("is-success", "is-error", "is-note");
  if (type) el.classList.add("is-" + type);
}

function showFieldError(id, message) {
  const field = getField(id);
  const error = document.getElementById("err-" + id);
  if (field) field.setAttribute("aria-invalid", "true");
  if (error) { error.hidden = false; if (message) error.textContent = message; }
}

function clearFieldError(id) {
  const field = getField(id);
  const error = document.getElementById("err-" + id);
  if (field) field.removeAttribute("aria-invalid");
  if (error) error.hidden = true;
}

// Returns true if every required field has a value. Focuses the first problem.
function validateForm() {
  let firstInvalid = null;
  REQUIRED_FIELDS.forEach(function (id) {
    const field = getField(id);
    if (!field) return;
    if (field.value.trim() === "") {
      showFieldError(id);
      if (!firstInvalid) firstInvalid = field;
    } else {
      clearFieldError(id);
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return firstInvalid === null;
}

// Builds the text parents will send. *text* makes bold text in WhatsApp.
function buildMessage(values) {
  const lines = [
    "Hello, I would like to enquire about tuition at Eswar Mathematics Tuition Centre.",
    "",
    "*Student's class:* " + values.studentClass,
    "*Subject:* " + values.subject,
    "*Preferred arrangement:* " + values.arrangement,
    "*Parent's name:* " + values.parentName
  ];
  if (values.requirements) {
    lines.push("*Additional requirements:* " + values.requirements);
  }
  lines.push("", "Please let me know the next steps. Thank you.");
  return lines.join("\n");
}

// Copies text to the clipboard. Resolves to true on success, false on failure.
// 1st choice: the modern Clipboard API. 2nd choice: a hidden text box (works on older browsers and some phones).
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Permission refused or not available: try the fallback below.
    }
  }
  const previousFocus = document.activeElement;
  const box = document.createElement("textarea");
  box.value = text;
  box.setAttribute("readonly", "");
  box.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px;"; // 16px stops iPhones zooming in
  document.body.appendChild(box);
  box.select();
  box.setSelectionRange(0, text.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  document.body.removeChild(box);
  if (previousFocus && previousFocus.focus) previousFocus.focus();
  return copied;
}

// Highlights all the text inside an element, so the person can copy it by hand if automatic copying fails.
function selectElementText(el) {
  const selection = window.getSelection && window.getSelection();
  if (!el || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}

function setupForm() {
  const form = document.getElementById("enquiry-form");
  if (!form) {
    console.warn("Enquiry form (#enquiry-form) not found, so the enquiry feature is switched off.");
    return;
  }

  const status = document.getElementById("form-status");
  const result = document.getElementById("message-result");
  const preview = document.getElementById("message-preview");
  const copyButton = document.getElementById("copy-message");
  const openButton = document.getElementById("open-whatsapp");
  const actionStatus = document.getElementById("action-status");

  // Check that everything this feature needs is really in the HTML.
  const missing = REQUIRED_FIELDS.filter(function (id) { return !getField(id); });
  const parts = { "form-status": status, "message-result": result, "message-preview": preview,
                  "copy-message": copyButton, "open-whatsapp": openButton, "action-status": actionStatus };
  Object.keys(parts).forEach(function (id) { if (!parts[id]) missing.push(id); });
  if (missing.length) {
    console.warn("Enquiry form: these HTML elements are missing: " + missing.join(", "));
  }

  // Clears the preview and both status messages.
  function resetOutput() {
    currentMessage = "";
    if (result) result.hidden = true;
    setStatus(status, "");
    setStatus(actionStatus, "");
  }

  // Remove an error as soon as the person fixes the field
  REQUIRED_FIELDS.forEach(function (id) {
    const field = getField(id);
    if (!field) return;
    field.addEventListener("input", function () {
      if (field.value.trim() !== "") clearFieldError(id);
    });
  });

  // If the person edits the form after a preview was made, hide the old preview
  // so that Copy Message can never copy out-of-date text.
  form.addEventListener("input", function () {
    if (currentMessage) resetOutput();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();            // stop the page from reloading
    resetOutput();

    if (missing.length) {
      setStatus(status, "The enquiry preview is not available on this page right now.", "note");
      return;
    }
    if (!validateForm()) {
      setStatus(status, "Please fill in the highlighted fields.");
      return;
    }

    currentMessage = buildMessage({
      studentClass: fieldValue("studentClass"),
      subject: fieldValue("subject"),
      arrangement: fieldValue("arrangement"),
      parentName: fieldValue("parentName"),
      requirements: fieldValue("requirements")
    });
    preview.textContent = currentMessage;
    result.hidden = false;

    // "Open WhatsApp" only works when an approved number is set in CONFIG.
    const canOpenWhatsApp = hasValidWhatsAppNumber();
    openButton.setAttribute("aria-disabled", String(!canOpenWhatsApp));
    if (canOpenWhatsApp) {
      setStatus(status, "Your message is ready. Copy it, or open WhatsApp to send it.", "note");
    } else {
      setStatus(status, "Demo mode: no approved WhatsApp number has been added, so Open WhatsApp is switched off. You can still copy the message.", "note");
    }
    result.scrollIntoView({ block: "nearest" }); // keeps the preview in view on phones
  });

  // Both actions need every part of the preview area, so only attach them when nothing is missing.
  if (missing.length) return;

  // ACTION 1: Copy Message (works in demo mode too)
  copyButton.addEventListener("click", async function () {
    if (!currentMessage) return;
    const copied = await copyText(currentMessage);
    if (copied) {
      setStatus(actionStatus, "Message copied. You can paste it into WhatsApp or any other app.", "success");
    } else {
      selectElementText(preview);
      setStatus(actionStatus, "Could not copy automatically. The message is selected above. Press Ctrl+C, or touch and hold and choose Copy.", "error");
    }
  });

  // ACTION 2: Open WhatsApp (only with an approved number)
  openButton.addEventListener("click", function () {
    if (!currentMessage) return;
    if (!hasValidWhatsAppNumber()) {
      setStatus(actionStatus, "Demo mode: WhatsApp was not opened because no approved number has been added.", "error");
      return;
    }
    // wa.me opens WhatsApp on phones and WhatsApp Web / the desktop app on computers.
    const url = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(currentMessage);
    const opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null; // the new tab cannot control this page
      setStatus(actionStatus, "WhatsApp is opening with your message ready. Press send there to complete the enquiry.", "success");
    } else {
      // Pop-up blocked: give a link instead
      setStatus(actionStatus, "Your browser blocked the new tab. ", "error");
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open WhatsApp with your message";
      actionStatus.appendChild(link);
    }
  });
}

/* ---------------------------------------------------------
   6. FLOATING CONTACT BUTTONS
   - Enquire is a plain link to #enquiry (CSS handles the smooth scroll).
   - Back to top appears once the visitor has scrolled down.
   - The whole dock hides while the enquiry section is on screen,
     so it never covers the form.
--------------------------------------------------------- */
function setupDock() {
  const dock = document.getElementById("fab-dock");
  const topButton = document.getElementById("fab-top");
  const enquiry = document.getElementById("enquiry");
  if (!dock || !topButton) return;

  // Show the back-to-top button after scrolling 400px.
  // requestAnimationFrame keeps the scroll handler light.
  let waiting = false;
  function updateTopButton() {
    topButton.classList.toggle("is-visible", window.scrollY > 400);
    waiting = false;
  }
  window.addEventListener("scroll", function () {
    if (!waiting) {
      waiting = true;
      window.requestAnimationFrame(updateTopButton);
    }
  }, { passive: true });
  updateTopButton(); // handles a page that is reloaded part-way down

  // scrollTo uses the page's CSS scroll-behavior, so reduced-motion users get an instant jump.
  topButton.addEventListener("click", function () {
    window.scrollTo(0, 0);
    // The button hides itself at the top, so move keyboard focus to the logo.
    document.querySelector(".brand").focus({ preventScroll: true });
  });

  // Hide the dock while any part of the enquiry section is visible.
  if (enquiry && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-hidden", entries[0].isIntersecting);
    }).observe(enquiry);
  }
}

/* ---------------------------------------------------------
   7. START EVERYTHING
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  applyConfig();
  setupNav();
  setupForm();
  setupDock();
});
