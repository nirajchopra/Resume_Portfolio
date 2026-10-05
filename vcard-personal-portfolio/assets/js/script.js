'use strict';

const elementToggleFunc = (element) => element.classList.toggle('active');

// Sidebar toggle on small screens.
const sidebar = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener('click', () => elementToggleFunc(sidebar));
}

// Switch pages using each navigation button's explicit page target.
const navigationLinks = document.querySelectorAll('[data-nav-link]');
const pages = document.querySelectorAll('[data-page]');
navigationLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const target = link.dataset.pageTarget;
    pages.forEach((page) => page.classList.toggle('active', page.dataset.page === target));
    navigationLinks.forEach((item) => item.classList.toggle('active', item === link));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Enable the contact form only when its required fields are valid.
const contactForm = document.querySelector('[data-form]');
if (contactForm) {
  const contactButton = contactForm.querySelector('[data-form-btn]');
  const updateContactButton = () => {
    if (contactButton) contactButton.disabled = !contactForm.checkValidity();
  };
  contactForm.addEventListener('input', updateContactButton);
}

// Save added certificate details in this browser and restore them on reload.
const certificateForm = document.querySelector('[data-cert-form]');
const certificateList = document.querySelector('[data-cert-list]');
const certificateStatus = document.querySelector('[data-cert-status]');
const certificateStorageKey = 'niraj-portfolio-certificates';

const readCertificates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(certificateStorageKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveCertificates = (certificates) => {
  try {
    localStorage.setItem(certificateStorageKey, JSON.stringify(certificates));
    return true;
  } catch {
    return false;
  }
};

const renderCertificates = () => {
  if (!certificateList) return;
  certificateList.querySelectorAll('[data-user-certificate]').forEach((item) => item.remove());

  readCertificates().forEach((certificate, index) => {
    const item = document.createElement('li');
    item.className = 'blog-post-item';
    item.dataset.userCertificate = 'true';
    const content = document.createElement('div');
    content.className = 'blog-content';
    const title = document.createElement('h3');
    title.className = 'h3 blog-item-title';
    title.textContent = certificate.name;
    const details = document.createElement('p');
    details.className = 'blog-text';
    details.textContent = [certificate.issuer, certificate.id].filter(Boolean).join(' · ');
    content.append(title, details);
    if (certificate.url) {
      const link = document.createElement('a');
      link.href = certificate.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.className = 'certificate-link';
      link.textContent = 'View certificate';
      content.append(link);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'form-btn';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${certificate.name}`);
    remove.addEventListener('click', () => {
      const certificates = readCertificates();
      certificates.splice(index, 1);
      saveCertificates(certificates);
      renderCertificates();
    });
    content.append(remove);
    item.append(content);
    certificateList.append(item);
  });
};

if (certificateForm) {
  certificateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!certificateForm.reportValidity()) return;

    const data = new FormData(certificateForm);
    const certificate = {
      name: String(data.get('certificateName') || '').trim(),
      issuer: String(data.get('certificateIssuer') || '').trim(),
      id: String(data.get('certificateId') || '').trim(),
      url: String(data.get('certificateUrl') || '').trim()
    };
    if (!certificate.name || !certificate.issuer) return;

    const certificates = readCertificates();
    certificates.push(certificate);
    const saved = saveCertificates(certificates);
    renderCertificates();
    certificateForm.reset();
    if (certificateStatus) {
      certificateStatus.style.display = 'block';
      certificateStatus.textContent = saved
        ? 'Certificate added. It is saved in this browser.'
        : 'Certificate added for this session, but browser storage is unavailable.';
    }
  });
}
renderCertificates();
