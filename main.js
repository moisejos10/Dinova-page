/* ══════════════════════════════════════════
   DINOVA AGENCY — Main JavaScript
   Interactividad, FAQ, animaciones
   ══════════════════════════════════════════ */

// ─── Estado global ───
let currentStep = 1;

// ─── Inicialización ───
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initCounterAnimations();
  initParticles();
  initFAQ();
  initVideoPlayer();
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
// FAQ ACCORDION
// ══════════════════════════════════════════
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherBtn = otherItem.querySelector('.faq__question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      question.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
    });
  });
}

// ══════════════════════════════════════════
// REPRODUCTOR DE VIDEO
// ══════════════════════════════════════════
function initVideoPlayer() {
  const overlay = document.getElementById('video-overlay');
  const video = document.getElementById('intro-video');

  if (!overlay || !video) return;

  overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    video.play();
  });

  video.addEventListener('pause', () => {
    if (!video.seeking) {
      overlay.classList.remove('hidden');
    }
  });

  video.addEventListener('ended', () => {
    overlay.classList.remove('hidden');
  });
}
