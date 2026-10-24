// ===== Contact Form Validation & Topic Chips =====

var contactForm = document.getElementById("contact-form");
var successBox = document.getElementById("success");
var messageInput = document.getElementById("message");

// Topic chip selector
document.querySelectorAll(".topic-chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    var wasActive = chip.classList.contains("active");
    document.querySelectorAll(".topic-chip").forEach(function (c) { c.classList.remove("active"); });

    if (!wasActive) {
      chip.classList.add("active");
      var topic = chip.getAttribute("data-topic") || "";
      if (messageInput && topic) {
        var current = messageInput.value.trim();
        if (current === "" || current.startsWith("Regarding:")) {
          messageInput.value = "Regarding: " + topic + "\n\n";
          messageInput.focus();
        }
      }
    }
  });
});

function setError(input, message) {
  var err = document.getElementById(input.id + "-error");
  if (err) err.textContent = message;
  if (message) {
    input.classList.add("invalid");
  } else {
    input.classList.remove("invalid");
  }
}

function validateField(input) {
  var value = input.value.trim();
  if (input.id === "phone") {
    // Phone is optional, but if entered, should be digits only
    if (value !== "" && !/^[+\d\s\-()]+$/.test(value)) {
      setError(input, "Please enter a valid phone number format.");
      return false;
    }
    setError(input, "");
    return true;
  }

  if (value === "") {
    setError(input, "Please fill in this field.");
    return false;
  }

  if (input.id === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(input, "Please provide a valid email address (e.g. name@domain.com).");
      return false;
    }
  }

  if (input.id === "message" && value.length < 10) {
    setError(input, "Please share a few more details (at least 10 characters).");
    return false;
  }

  setError(input, "");
  return true;
}

var formFields = ["name", "email", "phone", "message"].map(function (id) {
  return document.getElementById(id);
}).filter(Boolean);

formFields.forEach(function (f) {
  f.addEventListener("blur", function () { validateField(f); });
  f.addEventListener("input", function () {
    if (f.classList.contains("invalid")) validateField(f);
  });
});

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var allValid = formFields.map(validateField).every(Boolean);

    if (allValid) {
      var nameVal = formFields[0].value.trim();
      successBox.innerHTML = "<strong>Thank you, " + nameVal + "!</strong> Your message has been received. I will review it and get back to you shortly.";
      successBox.classList.add("show");
      contactForm.reset();
      document.querySelectorAll(".topic-chip").forEach(function (c) { c.classList.remove("active"); });
      successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      successBox.classList.remove("show");
      var firstInvalid = formFields.find(function (f) { return f.classList.contains("invalid"); });
      if (firstInvalid) firstInvalid.focus();
    }
  });
}
