/* ══════════════════════════════════════════
   DINOVA AGENCY — Main JavaScript
   Interactividad, formularios, Supabase
   ══════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js';

// ─── Configuración Supabase ───
// Reemplaza estos valores con los de tu proyecto Supabase
// (ver SETUP.md para instrucciones)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-CLAVE-ANON';
const GOOGLE_SHEETS_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEBHOOK_URL || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Estado global del formulario ───
let currentStep = 1;
let uploadedFiles = {
  id_photo: null,
  selfie_photo: null
};

// ─── Inicialización ───
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initCounterAnimations();
  initParticles();
  initFileUploads();
  initFormSubmission();
});

// ══════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav__link');

  // Toggle menú móvil
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Cerrar menú al hacer click en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (toggle && menu) {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Header scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    lastScroll = scrollY;
  }, { passive: true });

  // Smooth scroll para anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ══════════════════════════════════════════
// ANIMACIONES DE SCROLL
// ══════════════════════════════════════════
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger delay para hijos
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('animate');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('[data-animate]').forEach((el, index) => {
    el.dataset.delay = index * 100;
    observer.observe(el);
  });
}

// ══════════════════════════════════════════
// ANIMACIÓN DE CONTADORES
// ══════════════════════════════════════════
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat__number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target) || 0;
  const duration = 2000;
  const startTime = performance.now();

  // Obtener el prefijo del hermano
  const prefix = element.parentElement.querySelector('.stat__prefix');
  const prefixText = prefix ? prefix.textContent : '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ══════════════════════════════════════════
// PARTÍCULAS FLOTANTES (Hero)
// ══════════════════════════════════════════
function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 2; // 2px a 6px
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 15 + 15; // 15s a 30s
    const opacity = Math.random() * 0.25 + 0.08;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -${size}px;
      --particle-opacity: ${opacity};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;

    container.appendChild(particle);
  }
}

// ══════════════════════════════════════════
// FORMULARIO MULTI-PASO
// ══════════════════════════════════════════
function showStep(step) {
  // Ocultar todos los pasos
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));

  // Mostrar paso actual
  const stepEl = document.getElementById(`step-${step}`);
  if (stepEl) stepEl.classList.add('active');

  // Actualizar barra de progreso
  document.querySelectorAll('.form-progress__step').forEach(s => {
    const stepNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');

    if (stepNum === step) {
      s.classList.add('active');
    } else if (stepNum < step) {
      s.classList.add('completed');
    }
  });

  currentStep = step;
}

window.nextStep = function(step) {
  // Validar paso actual antes de avanzar
  if (validateStep(currentStep)) {
    showStep(step);
    // Scroll al top del formulario
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

window.prevStep = function(step) {
  showStep(step);
};

// ══════════════════════════════════════════
// VALIDACIÓN DE FORMULARIO
// ══════════════════════════════════════════
function validateStep(stepNumber) {
  clearErrors();
  let isValid = true;

  switch(stepNumber) {
    case 1:
      isValid = validateStep1();
      break;
    case 2:
      isValid = validateStep2();
      break;
    case 3:
      isValid = validateStep3();
      break;
  }

  return isValid;
}

function validateStep1() {
  let valid = true;

  const oliveId = document.getElementById('olive-id');
  const firstName = document.getElementById('first-name');
  const lastName = document.getElementById('last-name');
  const age = document.getElementById('age');

  if (!oliveId.value.trim()) {
    showError('olive-id-error', 'El ID de App Olive es requerido');
    markInvalid(oliveId);
    valid = false;
  } else {
    markValid(oliveId);
  }

  if (!firstName.value.trim() || firstName.value.trim().length < 2) {
    showError('first-name-error', 'El nombre debe tener al menos 2 caracteres');
    markInvalid(firstName);
    valid = false;
  } else {
    markValid(firstName);
  }

  if (!lastName.value.trim() || lastName.value.trim().length < 2) {
    showError('last-name-error', 'El apellido debe tener al menos 2 caracteres');
    markInvalid(lastName);
    valid = false;
  } else {
    markValid(lastName);
  }

  const ageValue = parseInt(age.value);
  if (!age.value || isNaN(ageValue) || ageValue < 18) {
    showError('age-error', 'Debes tener al menos 18 años');
    markInvalid(age);
    valid = false;
  } else if (ageValue > 99) {
    showError('age-error', 'Ingresa una edad válida');
    markInvalid(age);
    valid = false;
  } else {
    markValid(age);
  }

  return valid;
}

function validateStep2() {
  let valid = true;

  const phone = document.getElementById('phone');
  const country = document.getElementById('country');

  if (!phone.value.trim()) {
    showError('phone-error', 'El número de teléfono es requerido');
    markInvalid(phone);
    valid = false;
  } else {
    markValid(phone);
  }

  if (!country.value) {
    showError('country-error', 'Selecciona tu país');
    markInvalid(country);
    valid = false;
  } else {
    markValid(country);
  }

  return valid;
}

function validateStep3() {
  let valid = true;

  if (!uploadedFiles.id_photo) {
    showError('photos-error', 'Debes subir la foto de tu cédula');
    valid = false;
  }

  if (!uploadedFiles.selfie_photo) {
    showError('photos-error', 'Debes subir la selfie sosteniendo tu cédula');
    valid = false;
  }

  return valid;
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) errorEl.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function markInvalid(input) {
  input.classList.remove('valid');
  input.classList.add('invalid');
}

function markValid(input) {
  input.classList.remove('invalid');
  input.classList.add('valid');
}

// Limpiar errores al escribir
document.querySelectorAll('#register-form input, #register-form select').forEach(input => {
  input.addEventListener('input', () => {
    input.classList.remove('invalid');
    const errorEl = input.closest('.form-group')?.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';
  });
});

// ══════════════════════════════════════════
// SUBIDA DE ARCHIVOS
// ══════════════════════════════════════════
function initFileUploads() {
  setupUploadArea('upload-id', 'id-photo', 'preview-id', 'upload-id-content', 'remove-id', 'id_photo');
  setupUploadArea('upload-selfie', 'selfie-photo', 'preview-selfie', 'upload-selfie-content', 'remove-selfie', 'selfie_photo');
}

function setupUploadArea(areaId, inputId, previewId, contentId, removeId, fileKey) {
  const area = document.getElementById(areaId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const removeBtn = document.getElementById(removeId);

  if (!area || !input) return;

  // Click para abrir selector de archivo
  area.addEventListener('click', (e) => {
    if (e.target === removeBtn || e.target.closest('.upload-area__remove')) return;
    input.click();
  });

  // Drag & Drop
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('drag-over');
  });

  area.addEventListener('dragleave', () => {
    area.classList.remove('drag-over');
  });

  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, area, preview, fileKey);
  });

  // Input change
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (file) handleFile(file, area, preview, fileKey);
  });

  // Botón eliminar
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      area.classList.remove('has-file');
      preview.style.display = 'none';
      preview.src = '';
      input.value = '';
      uploadedFiles[fileKey] = null;

      // Limpiar error de fotos
      const photosError = document.getElementById('photos-error');
      if (photosError) photosError.textContent = '';
    });
  }
}

function handleFile(file, area, preview, fileKey) {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    showError('photos-error', 'Solo se permiten imágenes (JPG, PNG)');
    return;
  }

  // Validar tamaño (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError('photos-error', 'La imagen no debe superar 5MB');
    return;
  }

  // Guardar archivo
  uploadedFiles[fileKey] = file;

  // Mostrar preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    area.classList.add('has-file');
  };
  reader.readAsDataURL(file);

  // Limpiar error
  const photosError = document.getElementById('photos-error');
  if (photosError) photosError.textContent = '';
}

// ══════════════════════════════════════════
// ENVÍO DEL FORMULARIO
// ══════════════════════════════════════════
function initFormSubmission() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar último paso
    if (!validateStep(3)) return;

    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');

    // Estado de carga
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';
    submitSpinner.hidden = false;

    try {
      // 1. Subir fotos a Supabase Storage
      let idPhotoUrl = '';
      let selfiePhotoUrl = '';

      if (uploadedFiles.id_photo) {
        const timestamp = Date.now();
        const idFileName = `${timestamp}_cedula_${uploadedFiles.id_photo.name}`;

        const { data: idData, error: idError } = await supabase.storage
          .from('registrations')
          .upload(idFileName, uploadedFiles.id_photo);

        if (idError) throw new Error(`Error subiendo cédula: ${idError.message}`);

        const { data: idUrlData } = supabase.storage
          .from('registrations')
          .getPublicUrl(idFileName);

        idPhotoUrl = idUrlData.publicUrl;
      }

      if (uploadedFiles.selfie_photo) {
        const timestamp = Date.now();
        const selfieFileName = `${timestamp}_selfie_${uploadedFiles.selfie_photo.name}`;

        const { data: selfieData, error: selfieError } = await supabase.storage
          .from('registrations')
          .upload(selfieFileName, uploadedFiles.selfie_photo);

        if (selfieError) throw new Error(`Error subiendo selfie: ${selfieError.message}`);

        const { data: selfieUrlData } = supabase.storage
          .from('registrations')
          .getPublicUrl(selfieFileName);

        selfiePhotoUrl = selfieUrlData.publicUrl;
      }

      // 2. Guardar datos en Supabase
      const registrationData = {
        olive_id: document.getElementById('olive-id').value.trim(),
        first_name: document.getElementById('first-name').value.trim(),
        last_name: document.getElementById('last-name').value.trim(),
        age: parseInt(document.getElementById('age').value),
        phone: document.getElementById('phone').value.trim(),
        country: document.getElementById('country').value,
        id_photo_url: idPhotoUrl,
        selfie_photo_url: selfiePhotoUrl,
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('registrations')
        .insert([registrationData]);

      if (insertError) throw new Error(`Error guardando datos: ${insertError.message}`);

      // 3. Sincronizar con Google Sheets (no bloquea)
      sendToGoogleSheets(registrationData);

      // 4. Mostrar éxito
      showSuccessState();

    } catch (error) {
      console.error('Error en registro:', error);
      showError('photos-error', error.message || 'Hubo un error. Por favor intenta de nuevo.');

      // Restaurar botón
      submitBtn.disabled = false;
      submitText.textContent = 'Enviar Registro';
      submitSpinner.hidden = true;
    }
  });
}

function showSuccessState() {
  // Ocultar pasos del formulario
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));

  // Ocultar barra de progreso
  const progress = document.getElementById('form-progress');
  if (progress) progress.style.display = 'none';

  // Mostrar estado de éxito
  const success = document.getElementById('form-success');
  if (success) success.hidden = false;
}

// ══════════════════════════════════════════
// GOOGLE SHEETS SYNC
// ══════════════════════════════════════════
async function sendToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn('Google Sheets webhook URL no configurada');
    return;
  }

  try {
    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('✅ Datos enviados a Google Sheets');
  } catch (error) {
    console.warn('⚠️ No se pudo sincronizar con Google Sheets:', error);
    // No bloqueamos el flujo principal
  }
}
