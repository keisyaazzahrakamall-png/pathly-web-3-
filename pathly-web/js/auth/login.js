import { supabase } from "../lib/supabase.js";
import { getLoginErrorMessage } from "../lib/auth-error-messages.js";
import { getEmailTypoMessage } from "../lib/email-validation.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const message = document.getElementById("loginMessage");
const submitButton = document.getElementById("loginButton");
const submitLabel = submitButton.querySelector(".button-label");
const protectedDestinations = new Set([
  "onboarding.html",
  "career-stage.html",
  "career.html",
  "assessment.html",
  "results.html",
  "readiness.html",
  "roadmap.html",
  "my-path.html"
]);

function getRequestedDestination() {
  const destination = new URLSearchParams(window.location.search).get("next");
  return protectedDestinations.has(destination) ? destination : "";
}

function showMessage(text) {
  message.textContent = text;
  message.className = "auth-message show error";
}

function clearMessage() {
  message.textContent = "";
  message.className = "auth-message";
  emailInput.setAttribute("aria-invalid", "false");
  passwordInput.setAttribute("aria-invalid", "false");
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitLabel.textContent = isLoading ? "Checking Account..." : "Sign In";
}

async function getDestination(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, education_level, major, semester, graduation_year")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return "onboarding.html?missing=fullName%2CeducationLevel%2Cmajor%2Csemester%2CgraduationYear";
  }

  const missingFields = [];

  if (!data.full_name?.trim()) missingFields.push("fullName");
  if (!data.education_level) missingFields.push("educationLevel");
  if (!data.major?.trim()) missingFields.push("major");
  if (!data.semester) missingFields.push("semester");
  if (!data.graduation_year) missingFields.push("graduationYear");

  if (missingFields.length) {
    return `onboarding.html?missing=${encodeURIComponent(missingFields.join(","))}`;
  }

  return getRequestedDestination() || "career-stage.html";
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  clearMessage();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email && !password) {
    emailInput.setAttribute("aria-invalid", "true");
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage("Please enter your email and password.");
    emailInput.focus();
    return;
  }

  if (!emailInput.validity.valid) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage("Enter a valid email address.");
    return;
  }

  const emailTypoMessage = getEmailTypoMessage(email);

  if (emailTypoMessage) {
    emailInput.setAttribute("aria-invalid", "true");
    showMessage(emailTypoMessage);
    emailInput.focus();
    return;
  }

  if (!password) {
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage("Enter your account password.");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    setLoading(false);
    emailInput.setAttribute("aria-invalid", "true");
    passwordInput.setAttribute("aria-invalid", "true");
    showMessage(getLoginErrorMessage(error));
    return;
  }

  const destination = await getDestination(data.user.id);
  window.location.replace(destination);
});

const { data: sessionData } = await supabase.auth.getSession();

if (sessionData.session) {
  const destination = await getDestination(sessionData.session.user.id);
  window.location.replace(destination);
}
