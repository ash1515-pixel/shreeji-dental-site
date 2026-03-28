const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/TC9RNZsGxoKpAH9f7";
const WHATSAPP_NUMBER = "919461275518";
const CLINIC_ADDRESS = "Shreeji Dental Hospital, C-213, Magra Punjala Main Rd, Bhadwasiya, KIRTI NAGAR, Maderana Colony, Jodhpur, Rajasthan 342001";
const REVIEWS_ENDPOINT = "/api/reviews";

const cursor = document.querySelector(".cursor");
const follower = document.querySelector(".cursor-follower");
const menuItems = document.querySelectorAll(".menu-list li");
const doctorPhoto = document.getElementById("doctorPhoto");
const doctorFallback = document.getElementById("doctorFallback");

function getTopOffset() {
  const header = document.querySelector(".menu-horizontal");
  return (header ? header.offsetHeight : 70) + 26;
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - getTopOffset();
  window.scrollTo({ top, behavior: "smooth" });
}

function setActiveMenuByScroll() {
  const scrollPosition = window.scrollY + getTopOffset() + 20;
  let activeSection = "hero";

  menuItems.forEach((item) => {
    const sectionId = item.getAttribute("data-section");
    const section = document.getElementById(sectionId);
    if (!section) return;

    const start = section.offsetTop;
    const end = start + section.offsetHeight;
    if (scrollPosition >= start && scrollPosition < end) {
      activeSection = sectionId;
    }
  });

  menuItems.forEach((item) => {
    item.classList.toggle("active-menu", item.getAttribute("data-section") === activeSection);
  });
}

function safeOpen(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function openMaps() {
  safeOpen(GOOGLE_MAPS_URL);
}

function sendWhatsAppMessage(message) {
  const encoded = encodeURIComponent(message.trim());
  safeOpen(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

function formatReviewDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function initCursor() {
  const supportsCursor =
    window.matchMedia("(min-width: 821px)").matches &&
    window.matchMedia("(hover: hover)").matches;

  if (!supportsCursor || !cursor || !follower) {
    if (cursor) cursor.style.display = "none";
    if (follower) follower.style.display = "none";
    return;
  }

  const gsapAvailable = typeof window.gsap !== "undefined";
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (gsapAvailable) {
      window.gsap.to(cursor, { duration: 0.06, x: mouseX, y: mouseY });
      window.gsap.to(follower, { duration: 0.16, x: mouseX, y: mouseY });
    } else {
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
      follower.style.left = `${mouseX}px`;
      follower.style.top = `${mouseY}px`;
    }
  });

  const hoverTargets = document.querySelectorAll("a, button, .menu-list li, .card, .faq-question");
  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      if (gsapAvailable) {
        window.gsap.to(follower, { scale: 1.45, duration: 0.18, borderColor: "#0a5c7e" });
      } else {
        follower.style.transform = "translate(-50%, -50%) scale(1.45)";
      }
    });

    target.addEventListener("mouseleave", () => {
      if (gsapAvailable) {
        window.gsap.to(follower, { scale: 1, duration: 0.18, borderColor: "rgba(10, 92, 126, 0.32)" });
      } else {
        follower.style.transform = "translate(-50%, -50%) scale(1)";
      }
    });
  });
}

function initMenuNavigation() {
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      const sectionId = item.getAttribute("data-section");
      scrollToSection(sectionId);
    });
  });

  window.addEventListener("scroll", setActiveMenuByScroll, { passive: true });
  setActiveMenuByScroll();
}

function initFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => openItem.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

function initLocationButtons() {
  const locationButtons = [
    document.getElementById("locationMapBtn"),
    document.getElementById("locationBtnFull")
  ];

  locationButtons.forEach((button) => {
    if (!button) return;

    if (button.tagName === "A") {
      button.setAttribute("href", GOOGLE_MAPS_URL);
      button.setAttribute("target", "_blank");
      button.setAttribute("rel", "noopener noreferrer");
    } else {
      button.addEventListener("click", openMaps);
    }
  });

  const copyAddressBtn = document.getElementById("copyAddressBtn");
  if (!copyAddressBtn) return;

  copyAddressBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CLINIC_ADDRESS);
      copyAddressBtn.textContent = "Address Copied";
    } catch (_error) {
      copyAddressBtn.textContent = "Copy Manually";
    }

    setTimeout(() => {
      copyAddressBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Address';
    }, 1700);
  });
}

function initAppointmentActions() {
  const quickBookButton = document.getElementById("bookAppointmentBtn");
  const formBookButton = document.getElementById("bookApptFormBtn");

  if (quickBookButton) {
    quickBookButton.addEventListener("click", () => {
      sendWhatsAppMessage(
        "Hello Dr. Rohit Jakhar, I want to book an appointment at Shreeji Dental Hospital. Please share available slot."
      );
    });
  }

  if (!formBookButton) return;

  formBookButton.addEventListener("click", () => {
    const name = document.getElementById("apptName")?.value.trim() || "Patient";
    const phone = document.getElementById("apptPhone")?.value.trim() || "";
    const date = document.getElementById("apptDate")?.value.trim() || "Not specified";

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    const msg = [
      "Hello Dr. Rohit Jakhar, I want to book an appointment.",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Preferred Date: ${date}`,
      "Kindly confirm available time slot."
    ].join("\n");

    sendWhatsAppMessage(msg);
  });
}

function initReviews() {
  const submitReviewBtn = document.getElementById("submitReviewBtn");
  const reviewList = document.getElementById("reviewList");

  if (!submitReviewBtn || !reviewList) return;

  function renderReviews(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return;

    reviewList.innerHTML = reviews
      .map((review) => {
        const name = escapeHtml(review.name || "Anonymous");
        const text = escapeHtml(review.text || "");
        const date = formatReviewDate(review.createdAt);
        return `
          <article class="card review-card">
            <div class="stars">★★★★★</div>
            <p>"${text}"</p>
            <span>- ${name}${date ? ` (${date})` : ""}</span>
          </article>
        `;
      })
      .join("");
  }

  async function loadReviews() {
    try {
      const response = await fetch(REVIEWS_ENDPOINT, { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        renderReviews(data.reviews);
      }
    } catch (_error) {
      // Keep static fallback reviews if API is temporarily unavailable.
    }
  }

  submitReviewBtn.addEventListener("click", async () => {
    const nameInput = document.getElementById("reviewName");
    const textInput = document.getElementById("reviewText");

    const reviewerName = nameInput?.value.trim() || "Anonymous";
    const reviewText = textInput?.value.trim() || "";

    if (!reviewText) {
      alert("Please write your review first.");
      return;
    }

    submitReviewBtn.disabled = true;
    const oldLabel = submitReviewBtn.textContent;
    submitReviewBtn.textContent = "Submitting...";

    try {
      const response = await fetch(REVIEWS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewerName,
          text: reviewText
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Review submit failed.");
      }

      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        renderReviews(data.reviews);
      }

      if (nameInput) nameInput.value = "";
      if (textInput) textInput.value = "";

      const firstReview = reviewList.querySelector(".review-card");
      if (firstReview && typeof window.gsap !== "undefined") {
        window.gsap.from(firstReview, { opacity: 0, y: 18, duration: 0.35, ease: "power2.out" });
      }
    } catch (error) {
      alert(error.message || "Could not save review.");
    } finally {
      submitReviewBtn.disabled = false;
      submitReviewBtn.textContent = oldLabel || "Submit Review";
    }
  });

  loadReviews();
}

function initDoctorPhotoFallback() {
  if (!doctorPhoto || !doctorFallback) return;

  doctorPhoto.addEventListener("error", () => {
    doctorPhoto.style.display = "none";
    doctorFallback.style.display = "flex";
  });
}

function initAnimations() {
  if (typeof window.gsap === "undefined") return;

  const gsap = window.gsap;
  const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

  if (hasScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  gsap.from(".menu-container", {
    y: -24,
    opacity: 0,
    duration: 0.55,
    ease: "power2.out"
  });

  gsap.from(".hero-title", {
    y: 32,
    opacity: 0,
    duration: 0.8,
    delay: 0.1,
    ease: "power3.out"
  });

  gsap.from(".hero-sub, .hero-actions, .hero-details", {
    y: 24,
    opacity: 0,
    duration: 0.62,
    stagger: 0.09,
    delay: 0.23,
    ease: "power2.out"
  });

  gsap.from(".hero-img", {
    x: 36,
    opacity: 0,
    duration: 0.82,
    delay: 0.18,
    ease: "power2.out"
  });

  if (!hasScrollTrigger) return;

  gsap.utils.toArray(".section-title").forEach((title) => {
    gsap.from(title, {
      x: -20,
      opacity: 0,
      duration: 0.45,
      scrollTrigger: {
        trigger: title,
        start: "top 88%"
      }
    });
  });

  gsap.utils.toArray(".card, .gallery-item").forEach((element) => {
    gsap.from(element, {
      y: 28,
      opacity: 0,
      duration: 0.45,
      scrollTrigger: {
        trigger: element,
        start: "top 90%"
      }
    });
  });
}

initCursor();
initMenuNavigation();
initFAQ();
initLocationButtons();
initAppointmentActions();
initReviews();
initDoctorPhotoFallback();
initAnimations();
