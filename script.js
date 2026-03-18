const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');
const yearEl = document.getElementById('year');
const form = document.getElementById('appointmentForm');
const formStatus = document.getElementById('formStatus');
const doctorPhoto = document.getElementById('doctorPhoto');

if (yearEl) yearEl.textContent = new Date().getFullYear();

if (menuBtn && mainNav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      formStatus.textContent = 'Please fill all required fields correctly.';
      return;
    }

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value.trim();
    const message = document.getElementById('message').value.trim() || 'No additional notes';

    const waText = encodeURIComponent(
      `Appointment Request\nName: ${name}\nPhone: ${phone}\nService: ${service}\nNotes: ${message}\n\nHello Dr. Rohit Jakhar`
    );

    formStatus.textContent = 'Opening WhatsApp...';
    window.open(`https://wa.me/919461275518?text=${waText}`, '_blank', 'noopener');
  });
}

if (doctorPhoto) {
  doctorPhoto.addEventListener('error', () => {
    doctorPhoto.style.display = 'none';
    const placeholder = doctorPhoto.nextElementSibling;
    if (placeholder) placeholder.style.display = 'flex';
  });
}
