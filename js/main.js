/**
 * Bhopal Roti Services — Main Interactions & Logic
 */

(function () {
  'use strict';

  /* ── Custom Cursor ────────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  (function followLoop() {
    fx += (mx - fx) * 0.13;
    fy += (my - fy) * 0.13;
    follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
    requestAnimationFrame(followLoop);
  })();

  /* ── Nav scroll behavior ──────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* ── Mobile menu ─────────────────────────────────── */
  const navToggle   = document.getElementById('navToggle');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  navToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Scroll reveal ───────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.step-card, .plan-card, .testi-card, .order-configurator, .order-summary, .cta-banner h2, .cta-banner p, .section-title, .section-label, .section-desc'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  /* Stagger siblings */
  const staggerGroups = ['.steps-grid', '.plans-grid', '.order-wrapper'];
  staggerGroups.forEach(sel => {
    const group = document.querySelector(sel);
    if (!group) return;
    [...group.children].forEach((child, i) => {
      child.dataset.delay = i * 100;
    });
  });

  revealEls.forEach(el => observer.observe(el));

  /* ── Meal toggle → price update ────────────────────── */
  const toggleBtns   = document.querySelectorAll('.toggle-btn');
  const priceAmounts = document.querySelectorAll('.price-amount');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const meal = btn.dataset.meal;

      priceAmounts.forEach(el => {
        const newPrice = el.dataset[meal];
        if (!newPrice) return;

        /* Animate number roll */
        const from = parseInt(el.textContent.replace(/,/g, ''));
        const to   = parseInt(newPrice);
        animateNumber(el, from, to, 400);
      });
    });
  });

  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString('en-IN');
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Order configurator ───────────────────────────── */
  const PRICES = { plain: 15, ghee: 18, missi: 20, multigrain: 22 };
  let selectedType = 'plain';
  let qtyValue     = 6;
  let deliveryTime = 'lunch';
  let activeAddons = {};

  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus  = document.getElementById('qtyPlus');
  const qtyEl    = document.getElementById('qtyValue');

  /* Type pills */
  document.querySelectorAll('.option-pills .pill[data-type]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.option-pills .pill[data-type]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedType = pill.dataset.type;
      updateOrder();
    });
  });

  /* Time pills */
  document.querySelectorAll('.option-pills .pill[data-time]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.option-pills .pill[data-time]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      deliveryTime = pill.dataset.time;
    });
  });

  /* Quantity */
  qtyMinus.addEventListener('click', () => {
    if (qtyValue <= 2) return;
    qtyValue = Math.max(2, qtyValue - 1);
    animateQty(qtyEl, qtyValue);
    updateOrder();
  });

  qtyPlus.addEventListener('click', () => {
    if (qtyValue >= 50) return;
    qtyValue = Math.min(50, qtyValue + 1);
    animateQty(qtyEl, qtyValue);
    updateOrder();
  });

  function animateQty(el, val) {
    el.style.transform = 'scale(1.3)';
    el.style.color = '#E8811A';
    el.textContent = val;
    setTimeout(() => {
      el.style.transform = 'scale(1)';
      el.style.color = '';
    }, 200);
  }

  /* Add-ons */
  document.querySelectorAll('.addon-check').forEach(check => {
    check.addEventListener('change', () => {
      const name  = check.dataset.name;
      const price = parseInt(check.dataset.price);
      if (check.checked) {
        activeAddons[name] = price;
      } else {
        delete activeAddons[name];
      }
      updateOrder();
    });
  });

  function updateOrder() {
    const basePrice  = PRICES[selectedType] * qtyValue;
    const addonTotal = Object.values(activeAddons).reduce((a, b) => a + b, 0);
    const total      = basePrice + addonTotal;

    /* Update summary type label */
    const typeLabels = {
      plain: 'Plain Roti', ghee: 'Ghee Roti',
      missi: 'Missi Roti', multigrain: 'Multigrain Roti'
    };
    const summaryType  = document.getElementById('summaryType');
    const summaryRotis = document.getElementById('summaryRotis');
    const totalPriceEl = document.getElementById('totalPrice');
    const perRotiEl    = document.getElementById('perRoti');
    const addonsEl     = document.getElementById('summaryAddons');

    summaryType.textContent  = typeLabels[selectedType];
    summaryRotis.textContent = `×${qtyValue}`;

    /* Animate total */
    const currentTotal = parseInt(totalPriceEl.textContent.replace('₹', '').replace(/,/g, ''));
    animateNumber(
      { textContent: '', set(v) { totalPriceEl.textContent = '₹' + parseInt(v).toLocaleString('en-IN'); } },
      currentTotal, total, 300
    );

    perRotiEl.textContent = `₹${PRICES[selectedType]}/roti`;

    /* Addon lines */
    addonsEl.innerHTML = '';
    for (const [name, price] of Object.entries(activeAddons)) {
      const div = document.createElement('div');
      div.className = 'summary-addon-line';
      div.innerHTML = `<span>${name}</span><span>+₹${price}</span>`;
      addonsEl.appendChild(div);
    }
  }

  /* Better animateNumber that works with proxy objects */
  function animateNumber(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      if (el.textContent !== undefined && !el.set) {
        el.textContent = val.toLocaleString('en-IN');
      } else if (el.set) {
        el.set(val);
      }
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Order CTA ───────────────────────────────────── */
  const orderCta    = document.getElementById('orderCta');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');

  orderCta.addEventListener('click', () => {
    /* Ripple effect */
    orderCta.classList.add('loading');
    orderCta.querySelector('span').textContent = 'Placing Order...';
    setTimeout(() => {
      orderCta.classList.remove('loading');
      orderCta.querySelector('span').textContent = 'Place Order';
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }, 1400);
  });

  modalClose.addEventListener('click', () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── CTA Countdown timer ─────────────────────────── */
  const countdownEl = document.getElementById('ctaCountdown');
  if (countdownEl) {
    const saved = localStorage.getItem('brs_offer_end');
    let endTime;
    if (saved && parseInt(saved) > Date.now()) {
      endTime = parseInt(saved);
    } else {
      endTime = Date.now() + 23 * 3600 * 1000 + 47 * 60 * 1000 + 12 * 1000;
      localStorage.setItem('brs_offer_end', endTime);
    }

    function updateTimer() {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        countdownEl.textContent = 'Expired';
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent =
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
    }
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* ── Testimonials carousel ────────────────────────── */
  const track    = document.getElementById('testimonialsTrack');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');

  if (track && prevBtn && nextBtn) {
    let testiIndex = 0;
    const cards    = track.querySelectorAll('.testi-card');
    const visible  = () => window.innerWidth >= 768 ? 3 : window.innerWidth >= 480 ? 2 : 1;
    const maxIndex = () => Math.max(0, Math.ceil(cards.length / 2) - visible());

    function getCardWidth() {
      return cards[0].offsetWidth + 24;
    }

    function scrollTo(idx) {
      testiIndex = Math.max(0, Math.min(idx, maxIndex()));
      track.style.transform = `translateX(-${testiIndex * getCardWidth()}px)`;
    }

    prevBtn.addEventListener('click', () => scrollTo(testiIndex - 1));
    nextBtn.addEventListener('click', () => scrollTo(testiIndex + 1));

    /* Auto-advance */
    let autoAdv = setInterval(() => {
      if (testiIndex >= maxIndex()) {
        scrollTo(0);
      } else {
        scrollTo(testiIndex + 1);
      }
    }, 4500);

    [prevBtn, nextBtn].forEach(b => {
      b.addEventListener('click', () => {
        clearInterval(autoAdv);
      });
    });
  }

  /* ── Smooth scroll for CTA links ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── Plan card tilt on hover (desktop) ────────────── */
  document.querySelectorAll('.plan-card, .step-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-${card.classList.contains('plan-featured') ? 18 : 8}px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear';
    });
  });

  /* ── Initial order update ─────────────────────────── */
  updateOrder();

  /* ── Console easter egg ───────────────────────────── */
  console.log('%c 🫓 Bhopal Roti Services ', 'font-size:20px; background:#1C0A00; color:#F5A84B; padding:12px 24px; border-radius:8px;');
  console.log('%c Crafted with ❤️ for fresh roti lovers ', 'font-size:12px; color:#8B6E5A;');
})();
