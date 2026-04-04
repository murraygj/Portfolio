// ===== PAGE LOAD =====
document.body.classList.add('loaded');

// ===== STARFIELD CANVAS =====
// Implementation matches the reference site (murraygj.github.io/my-repo/)
// Key: canvas CSS opacity:0.5 forces a compositing layer in Safari —
// this is why it renders correctly on both Chrome and Safari.
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = Array.from({ length: 180 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.008 + 0.002,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      // Plain sin — allows alpha to go to ~0, creating true appear/disappear effect
      s.alpha = 0.3 + 0.5 * Math.sin(t * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(193, 127, 58, ${s.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  resize();
  initStars();
  requestAnimationFrame(drawStars);
  window.addEventListener('resize', () => { resize(); initStars(); }, { passive: true });
})();

// ===== NAVIGATION SCROLL EFFECT =====
const nav = document.getElementById('nav');

let lastScroll = 0;
function handleNavScroll() {
  const scrollY = window.scrollY;

  if (scrollY > 60) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }

  lastScroll = scrollY;
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== SCROLL REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll('.fade-in, .reveal, .reveal-stagger');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 24;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== HERO ORNAMENT SCROLL FADE =====
// The compact ornament fades out as the user scrolls away from the hero
const heroOrnament = document.querySelector('.hero__ornament');

if (heroOrnament) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const opacity = Math.max(0, 1 - scrollY / 600);
    heroOrnament.style.opacity = opacity;
  }, { passive: true });
}

// ===== MAGNETIC HOVER ON BUTTONS =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ===== WORK CARD IMAGE PARALLAX =====
document.querySelectorAll('.work-card').forEach(card => {
  const image = card.querySelector('.work-card__image .placeholder, .work-card__image img');
  if (!image) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    image.style.transform = `scale(1.03) translate(${x * -8}px, ${y * -8}px)`;
  });

  card.addEventListener('mouseleave', () => {
    image.style.transform = '';
  });
});

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

function highlightNav() {
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('nav__link--active');
        const href = link.getAttribute('href');
        if (href === `#${id}` || href === `index.html#${id}`) {
          link.classList.add('nav__link--active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });

// ===== COUNTER ANIMATION FOR METRICS =====
const metricValues = document.querySelectorAll('.metric-card__value');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateValue(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

metricValues.forEach(el => counterObserver.observe(el));

function animateValue(el) {
  const text = el.textContent;
  const hasPrefix = text.startsWith('$');
  const hasSuffix = text.endsWith('%');
  const hasComma = text.includes(',');

  let numStr = text.replace(/[$%,]/g, '');
  const isFloat = numStr.includes('.');
  const target = parseFloat(numStr);

  const duration = 1200;
  const start = performance.now();

  el.textContent = hasPrefix ? '$0' : '0';

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    let current = target * eased;

    let formatted;
    if (isFloat) {
      formatted = current.toFixed(2);
    } else {
      formatted = Math.round(current).toString();
      if (hasComma && formatted.length > 3) {
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
    }

    el.textContent = (hasPrefix ? '$' : '') + formatted + (hasSuffix ? '%' : '');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== DOCTRINE SLIDESHOW (handles all instances) =====
document.querySelectorAll('.doctrine-slideshow').forEach(slideshow => {
  const slides = slideshow.querySelectorAll('.doctrine-slide');
  const dots   = slideshow.querySelectorAll('.doctrine-dot');
  const prev   = slideshow.querySelector('.doctrine-arrow--prev');
  const next   = slideshow.querySelector('.doctrine-arrow--next');
  let current  = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Swipe support
  let touchStartX = 0;
  slideshow.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slideshow.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goTo(delta > 0 ? current + 1 : current - 1);
  });

  // Keyboard support when focused within
  slideshow.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });
});
