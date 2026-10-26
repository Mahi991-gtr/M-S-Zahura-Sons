(function () {
  'use strict';
  var CFG = window.ZAHURA_CONFIG || {};
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var isMobile = window.matchMedia('(max-width: 860px)');

  /* ---------- Mobile menu ---------- */
  var menu = document.querySelector('.menu');
  var links = document.getElementById('site-nav');
  if (menu && links) {
    menu.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Sticky navigation: solid bar, hides on scroll down, returns on scroll up ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var lastY = window.pageYOffset, tick = false;
    var onNav = function () {
      var y = window.pageYOffset;
      var open = links && links.classList.contains('open');
      nav.classList.toggle('stuck', y > 90);
      nav.classList.toggle('hide', y > 400 && y > lastY + 4 && !open);
      if (y < lastY - 4 || y <= 400) nav.classList.remove('hide');
      lastY = y;
      tick = false;
    };
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(onNav); }
    }, { passive: true });
    onNav();
  }

  /* ---------- Hero: full-screen photo with a slow upward drift while scrolling (all pages) ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    /* Resolve the hero photo relative to the SITE ROOT, not the css folder,
       so the image always loads no matter which page or folder you are on. */
    var root = (location.pathname.replace(/[^\/]*$/, ''));
    var abs = function (p) { return root + p.replace(/^\//, ''); };
    var desktopImg = hero.getAttribute('data-hero');
    var mobileImg = hero.getAttribute('data-hero-mobile');
    var applyHero = function () {
      var src = (isMobile.matches && mobileImg) ? mobileImg : (desktopImg || '');
      hero.style.setProperty('--hero-img', src ? 'url(' + abs(src) + ')' : '');
    };
    if (desktopImg) {
      applyHero();
      if (mobileImg && window.matchMedia) isMobile.addEventListener ? isMobile.addEventListener('change', applyHero) : isMobile.addListener(applyHero);
    }
    /* Slow drift: photo moves up gradually as you scroll down (Harper-style). */
    if (!reduce) {
      var pt = false;
      var drift = function () {
        if (pt) return; pt = true;
        requestAnimationFrame(function () {
          var y = window.pageYOffset;
          var h = hero.offsetHeight || 1;
          if (y < h * 1.6) hero.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
          pt = false;
        });
      };
      window.addEventListener('scroll', drift, { passive: true });
      window.addEventListener('resize', drift);
    }
  }

  /* ---------- Lightbox gallery: arrows, keyboard, swipe, counter ---------- */
  var box = document.createElement('div');
  box.className = 'lb';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML =
    '<button class="lb-x" type="button" aria-label="Close photo">&times;</button>' +
    '<button class="lb-n lb-p" type="button" aria-label="Previous photo">&#8249;</button>' +
    '<img alt="">' +
    '<button class="lb-n lb-f" type="button" aria-label="Next photo">&#8250;</button>' +
    '<div class="lb-c"></div>';
  document.body.appendChild(box);
  var big = box.querySelector('img'), closeBtn = box.querySelector('.lb-x');
  var prevBtn = box.querySelector('.lb-p'), nextBtn = box.querySelector('.lb-f'), cap = box.querySelector('.lb-c');
  var group = [], idx = 0, lastFocus = null;
  var SEL = '.pg .ph, .cs, .ws, .gal .gs';

  function show(i) {
    idx = (i + group.length) % group.length;
    var img = group[idx];
    big.classList.remove('swap'); void big.offsetWidth; big.classList.add('swap');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = (img.alt || '') + (group.length > 1 ? '  ·  ' + (idx + 1) + ' / ' + group.length : '');
    var one = group.length < 2;
    prevBtn.hidden = nextBtn.hidden = one;
    [group[(idx + 1) % group.length], group[(idx - 1 + group.length) % group.length]].forEach(function (n) {
      var pre = new Image(); pre.src = n.currentSrc || n.src;
    });
  }
  function openBox(img) {
    lastFocus = img;
    var scope = img.closest('.pg, .gal, .cg, .wg') || img.parentNode;
    group = Array.prototype.slice.call(scope.querySelectorAll(SEL));
    box.hidden = false;
    document.body.classList.add('noscroll');
    show(group.indexOf(img));
    closeBtn.focus();
  }
  function closeBox() {
    box.hidden = true;
    big.removeAttribute('src');
    document.body.classList.remove('noscroll');
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(SEL).forEach(function (img) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', function () { openBox(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(img); }
    });
  });
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target === closeBtn) closeBox(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') closeBox();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });

  /* ---------- Projects: filter chips + deep links (projects.html#shasha-denims) ---------- */
  function slug(s) { return s.toLowerCase().replace(/&amp;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var arts = document.querySelectorAll('article.pjt');
  if (arts.length) {
    var items = [];
    arts.forEach(function (a) {
      var h = a.querySelector('h3'); if (!h) return;
      var name = h.textContent.trim();
      var base = slug(name).replace(/-ltd$/, '').replace(/-bd$/, '');
      a.id = a.id || base;
      items.push({ el: a, name: name, short: name.replace(/\s+Ltd\.?$/i, '').replace(/\s+BD$/i, '') });
    });
    var lede = document.querySelector('#projects .lede');
    var bar = document.createElement('div');
    bar.className = 'chips';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter projects');
    var mk = function (label, key) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = label; b.dataset.key = key;
      b.setAttribute('aria-pressed', 'false');
      bar.appendChild(b); return b;
    };
    mk('All projects', 'all');
    items.forEach(function (it) { mk(it.short, it.el.id); });
    lede.parentNode.insertBefore(bar, lede.nextSibling);

    var apply = function (key, scroll) {
      bar.querySelectorAll('.chip').forEach(function (c) {
        var on = c.dataset.key === key;
        c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on));
      });
      items.forEach(function (it) {
        var hide = key !== 'all' && it.el.id !== key;
        it.el.hidden = hide;
        if (!hide) { it.el.classList.remove('rv', 'in'); it.el.classList.add('flt'); }
      });
      if (scroll) {
        var target = document.getElementById('projects');
        if (target && !reduce) window.scrollTo({ top: target.offsetTop - 8, behavior: 'smooth' });
        else if (target) window.scrollTo(0, target.offsetTop - 8);
      }
      try { history.replaceState(null, '', key === 'all' ? location.pathname : '#' + key); } catch (e) {}
    };
    bar.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (c) apply(c.dataset.key, false);
    });
    var hash = decodeURIComponent((location.hash || '').slice(1));
    var valid = items.some(function (it) { return it.el.id === hash; });
    apply(valid ? hash : 'all', valid);
    window.addEventListener('hashchange', function () {
      var h = decodeURIComponent(location.hash.slice(1));
      if (items.some(function (it) { return it.el.id === h; })) apply(h, true);
    });
  }

  /* ---------- Home page project cards link to their project ---------- */
  document.querySelectorAll('figure.pz').forEach(function (fig) {
    var cap = fig.querySelector('figcaption'); if (!cap) return;
    var name = cap.childNodes[0].textContent.trim();
    var id = slug(name).replace(/-ltd$/, '').replace(/-bd$/, '');
    var a = document.createElement('a');
    a.href = 'projects.html#' + id;
    a.className = 'pz-l';
    a.setAttribute('aria-label', 'View ' + name + ' project');
    fig.appendChild(a);
  });

  /* ---------- Contact details + form (no backend needed) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var tel = document.getElementById('ct-phone'), mail = document.getElementById('ct-email');
    if (CFG.PHONE && tel) {
      var pa = document.getElementById('ct-phone-a');
      pa.textContent = CFG.PHONE; pa.href = 'tel:' + CFG.PHONE.replace(/[^\d+]/g, ''); tel.hidden = false;
    }
    if (CFG.EMAIL && mail) {
      var ma = document.getElementById('ct-email-a');
      ma.textContent = CFG.EMAIL; ma.href = 'mailto:' + CFG.EMAIL; mail.hidden = false;
    }
    var note = document.getElementById('form-note');
    if (!CFG.WEB3FORMS_KEY && CFG.EMAIL && note) {
      note.textContent = 'Sending will open your email app with the message ready to go.';
      note.hidden = false;
    }

    var status = document.getElementById('form-status');
    var submit = form.querySelector('button[type="submit"]');
    var say = function (cls, msg) { status.className = cls; status.textContent = msg; };

    form.querySelectorAll('input[required], textarea[required]').forEach(function (f) {
      f.addEventListener('blur', function () { f.classList.toggle('bad', !f.checkValidity()); });
      f.addEventListener('input', function () { if (f.checkValidity()) f.classList.remove('bad'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      if (d.botcheck) { say('ok', 'Thank you. Your message has been sent.'); form.reset(); return; }

      if (CFG.WEB3FORMS_KEY) {
        say('', 'Sending…'); submit.disabled = true; submit.classList.add('loading');
        fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: CFG.WEB3FORMS_KEY,
            subject: 'New website enquiry from ' + d.name,
            from_name: "Zahura & Son's website",
            name: d.name, email: d.email, phone: d.phone || '-', message: d.message
          })
        })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (j && j.success) { form.reset(); say('ok', 'Thank you. Your message has been sent and we will get back to you soon.'); }
            else say('err', (j && j.message) || 'Something went wrong. Please try again.');
          })
          .catch(function () { say('err', 'We could not send your message. Please check your connection and try again' + (CFG.EMAIL ? ', or email us at ' + CFG.EMAIL + '.' : '.')); })
          .then(function () { submit.disabled = false; submit.classList.remove('loading'); });
      } else if (CFG.EMAIL) {
        var body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nPhone: ' + (d.phone || '-') + '\n\n' + d.message;
        window.location.href = 'mailto:' + CFG.EMAIL + '?subject=' + encodeURIComponent('Website enquiry from ' + d.name) + '&body=' + encodeURIComponent(body);
        say('ok', 'Your email app should now open with the message ready to send.');
      } else {
        say('err', 'The contact form has not been connected yet. Open js/config.js and add an email address or a Web3Forms key.');
      }
    });
  }
})();
