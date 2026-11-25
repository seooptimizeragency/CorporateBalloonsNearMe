// Shared interactivity: FAQ accordion, scroll-spy nav, mobile nav,
// and in-page Order Inquiry submission (hidden-iframe FormSubmit pattern).
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion (with aria-expanded)
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Scroll-spy for nav highlight (nav hrefs are /#corporate and /#yt)
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            (l.getAttribute('href') || '').endsWith('#' + e.target.id)));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  /* Order Inquiry forms: submit in-page through a hidden iframe.
     FormSubmit redirects the iframe to /form-sent/ on success; the success
     or error message shows below the Send button and the form clears after
     a successful send. No AJAX route (it hangs), no _captcha=false. */
  (function () {
    var forms = document.querySelectorAll('form.inquiry-form');
    if (!forms.length) return;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var SUCCESS = 'Thank you! Your inquiry has been submitted successfully. We will contact you soon.';
    var FAILURE = 'Sorry, your inquiry could not be sent. Please try again or contact us by phone.';
    forms.forEach(function (form, idx) {
      var note = form.querySelector('.form-note');
      var btn = form.querySelector('button[type="submit"]');
      function setNote(text, kind) {
        if (!note) return;
        note.textContent = text;
        note.className = 'form-note' + (kind ? ' ' + kind : '');
      }
      form.addEventListener('submit', function (e) {
        var honey = form.querySelector('[name="_honey"]');
        if (honey && honey.value) { e.preventDefault(); return; }
        var human = form.querySelector('[name="human_verified"]');
        if (human && !human.checked) {
          e.preventDefault();
          setNote('Please verify you are human before sending.', 'error');
          human.focus();
          return;
        }
        var email = form.querySelector('[name="email"]');
        var date = form.querySelector('[name="event_date"]');
        var zip = form.querySelector('[name="delivery_zip"]');
        var msg = form.querySelector('[name="message"]');
        var bad = null;
        if (!email || !emailRe.test(email.value.trim())) bad = email;
        else if (!date || !date.value) bad = date;
        else if (!zip || !zip.value.trim()) bad = zip;
        else if (!msg || !msg.value.trim()) bad = msg;
        if (bad) {
          e.preventDefault();
          setNote('Please complete the required fields.', 'error');
          bad.focus();
          return;
        }
        var file = form.querySelector('[name="attachment"]');
        if (file && file.files && file.files[0] && file.files[0].size > 10 * 1024 * 1024) {
          e.preventDefault();
          setNote('Please attach a file smaller than 10 MB.', 'error');
          file.focus();
          return;
        }
        e.preventDefault();
        setNote('', '');
        var btnText = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        var frameName = 'formsubmit-frame-' + idx + '-' + Date.now();
        var iframe = document.createElement('iframe');
        iframe.name = frameName;
        iframe.style.display = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(iframe);
        var done = false;
        var loads = 0;
        function finish(ok) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (btn) { btn.disabled = false; btn.textContent = btnText; }
          if (ok) { setNote(SUCCESS, 'success'); form.reset(); }
          else { setNote(FAILURE, 'error'); }
          setTimeout(function () { iframe.remove(); }, 500);
        }
        var timer = setTimeout(function () { finish(false); }, 30000);
        iframe.addEventListener('load', function () {
          loads++;
          var path = '';
          try { path = iframe.contentWindow.location.pathname || ''; } catch (err) { path = ''; }
          if (path.indexOf('/form-sent') !== -1) { finish(true); return; }
          if (loads >= 2) { setTimeout(function () { finish(true); }, 1200); }
        });
        form.target = frameName;
        form.submit();
      });
    });
  })();
});

/* Mobile nav: hamburger toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();
