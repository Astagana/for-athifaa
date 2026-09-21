/* =========================================================================
   Untuk Athifa — logic halaman
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  var HEARTS = ['❤', '💖', '💗', '💞', '💘', '💝', '✨', '🌷'];


  /* =====================================================================
     2. NAVIGASI (halaman, bukan scroll)
     ===================================================================== */
  var pages = $$('.page');

  function goTo(name) {
    var target = $('#page-' + name);
    if (!target) return;

    pages.forEach(function (p) { p.classList.toggle('active', p === target); });
    $$('.side-nav button').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.page === name);
    });

    var scroller = target.querySelector('.page-scroll');
    if (scroller) scroller.scrollTop = 0;

    if (location.hash !== '#' + name) {
      history.replaceState(null, '', '#' + name);
    }

    if (envelope && envelope.classList.contains('open')) closeEnv();

    closeSidebar();
  }

  $$('[data-page]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(el.dataset.page);
    });
  });

  function openSidebar() {
    $('#sidebar').classList.add('open');
    $('#sidebarBackdrop').classList.add('show');
  }
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#sidebarBackdrop').classList.remove('show');
  }
  $$('.menu-toggle').forEach(function (b) { b.addEventListener('click', openSidebar); });
  $('#sidebarBackdrop').addEventListener('click', closeSidebar);

  // buka halaman sesuai hash kalau ada
  (function () {
    var h = location.hash.replace('#', '');
    if (h && $('#page-' + h)) goTo(h);
  })();

  /* =====================================================================
     3. MUSIK (song.mp3)
     ===================================================================== */
  var bgMusic = $('#bgMusic');
  var musicBtns = $$('.music-btn');

  function startMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.55;
    var p = bgMusic.play();
    if (p && p.catch) p.catch(function () {});
  }
  function toggleMusic() {
    if (!bgMusic) return;
    if (bgMusic.paused) startMusic();
    else bgMusic.pause();
  }
  function updateMusicUI() {
    var playing = bgMusic && !bgMusic.paused;
    musicBtns.forEach(function (b) {
      b.classList.toggle('playing', !!playing);
      b.setAttribute('aria-pressed', String(!!playing));
    });
  }
  musicBtns.forEach(function (b) { b.addEventListener('click', toggleMusic); });

  // browser butuh gesture pertama dulu sebelum audio boleh jalan
  function firstTouch() {
    if (bgMusic && bgMusic.paused) startMusic();
  }
  document.addEventListener('pointerdown', firstTouch, { once: true });
  document.addEventListener('keydown', firstTouch, { once: true });

  /* =====================================================================
     5. OPENING / GERBANG MASUK
     ===================================================================== */
  var gate    = $('#gate');
  var gateBtn = $('#gateBtn');

  if (gate && gateBtn) {
    gateBtn.addEventListener('click', function () {
      startMusic();                 // ← lagu mulai pas tombol diklik

      gate.classList.add('hide');   // fade out gerbang
      document.body.classList.add('entered');

      setTimeout(function () {
        gate.style.display = 'none'; // buang dari layout setelah transisi
      }, 700);
    });
  }


  /* =====================================================================
     4. HITUNG HARI & TIMER LIVE
     ===================================================================== */
  var startDate = new Date('2026-07-11T00:00:00');
  var daysEl = $('#daysTogether');
  var clockEls = {
    d: $('[data-clock="d"]'),
    h: $('[data-clock="h"]'),
    m: $('[data-clock="m"]'),
    s: $('[data-clock="s"]')
  };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tickTime() {
    var diff = Date.now() - startDate.getTime();
    if (diff < 0) diff = 0;

    var totalSec = Math.floor(diff / 1000);
    var days = Math.floor(totalSec / 86400);
    var hours = Math.floor((totalSec % 86400) / 3600);
    var mins = Math.floor((totalSec % 3600) / 60);
    var secs = totalSec % 60;

    if (daysEl) daysEl.textContent = days;
    if (clockEls.d) clockEls.d.textContent = days;
    if (clockEls.h) clockEls.h.textContent = pad(hours);
    if (clockEls.m) clockEls.m.textContent = pad(mins);
    if (clockEls.s) clockEls.s.textContent = pad(secs);
  }
  tickTime();
  setInterval(tickTime, 1000);

  /* =====================================================================
     5. LOVE METER
     ===================================================================== */
  var meterValue = $('#meterValue');
  var progressBar = $('#progressBar');
  var percent = 99;

  function renderMeter() {
    meterValue.textContent = percent + '%';
    progressBar.style.width = percent + '%';
  }
  renderMeter();

  $('#plusLoveBtn').addEventListener('click', function (e) {
    percent = Math.min(100, percent + 1);
    renderMeter();
    burst(e.currentTarget, 14);
    playMelody();
    if (percent >= 100) {
      meterValue.textContent = '100% (maksimal ❤)';
    }
  });

  /* =====================================================================
     6. ALASAN ACAK
     ===================================================================== */
  var reasons = [
    'karena cara kamu ketawa bikin hari aku ikut cerah.',
    'karena kamu selalu jadi orang pertama yang aku pengen ceritain semuanya.',
    'karena kamu sabar sama aku, padahal aku kadang bikin ribeut sendiri.',
    'karena kamu bikin hal-hal biasa jadi terasa spesial.',
    'karena kamu nggak pernah minta aku jadi orang lain, cukup jadi diri aku.',
    'karena kamu tetap milih aku di hari-hari yang nggak gampang.',
    'karena suara kamu itu rumah, bukan cuma suara.',
    'karena kamu peduli sama hal-hal kecil yang orang lain suka lewat gitu aja.',
    'karena kamu bikin aku pengen jadi versi terbaik dari diri aku.',
    'karena kamu cantik, tapi bukan cuma itu — kamu baik, dan itu yang bikin bertahan.'
  ];
  var reasonText = $('#reasonText');
  var reasonCount = $('#reasonCount');
  var lastReason = -1;
  var reasonIndex = 0;

  $('#reasonBtn').addEventListener('click', function (e) {
    var i = Math.floor(Math.random() * reasons.length);
    while (reasons.length > 1 && i === lastReason) i = Math.floor(Math.random() * reasons.length);
    lastReason = i;
    reasonIndex++;
    reasonText.textContent = 'Aku sayang kamu ' + reasons[i];
    reasonText.classList.remove('pop');
    void reasonText.offsetWidth;
    reasonText.classList.add('pop');
    reasonCount.textContent = pad(reasonIndex);
    burst(e.currentTarget, 10);
  });

  /* =====================================================================
     7. HOLD TO LOVE
     ===================================================================== */
  var holdBtn = $('#holdBtn');
  var holdFill = $('#holdFill');
  var holdResult = $('#holdResult');
  var holdTimer = null;
  var holdProgress = 0;
  var holdDone = false;

  var holdMessages = [
    'Cinta terkirim, dan kamu tahu itu cuma buat kamu 💗',
    'Kebaca sampai hati aku, serius. 🤍',
    'Udah masuk, jangan dilepas ya. 💞',
    'Tahan terus, aku nggak akan kemana-mana. ❤'
  ];

  function startHold() {
    if (holdDone) return;
    holdResult.textContent = '';
    holdTimer = setInterval(function () {
      holdProgress = Math.min(100, holdProgress + 2.4);
      holdFill.style.width = holdProgress + '%';
      if (holdProgress >= 100) {
        clearInterval(holdTimer);
        holdDone = true;
        holdResult.textContent = pick(holdMessages);
        burst(holdBtn, 22);
        playMelody();
        setTimeout(function () {
          holdDone = false;
          holdProgress = 0;
          holdFill.style.width = '0%';
        }, 2200);
      }
    }, 40);
  }
  function endHold() {
    clearInterval(holdTimer);
    if (!holdDone) {
      holdProgress = 0;
      holdFill.style.width = '0%';
    }
  }
  holdBtn.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    startHold();
  });
  holdBtn.addEventListener('pointerup', endHold);
  holdBtn.addEventListener('pointerleave', endHold);
  holdBtn.addEventListener('pointercancel', endHold);

  /* =====================================================================
     8. BURST HATI (DOM)
     ===================================================================== */
  function burst(anchor, count) {
    count = count || 14;
    var el = typeof anchor === 'string' ? $(anchor) : anchor;
    var rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    var baseX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    var baseY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    for (var i = 0; i < count; i++) {
      var h = document.createElement('span');
      h.className = 'heart-pop';
      h.textContent = pick(HEARTS);
      h.style.left = (baseX + rand(-100, 100)) + 'px';
      h.style.top = (baseY + rand(-30, 30)) + 'px';
      h.style.fontSize = rand(16, 34) + 'px';
      h.style.animationDuration = rand(3.2, 5.8) + 's';
      h.style.setProperty('--dx', rand(-70, 70) + 'px');
      document.body.appendChild(h);
      setTimeout(function (node) {
        return function () { node.remove(); };
      }(h), 6200);
    }
  }

  /* =====================================================================
     9. SURPRISE MODAL
     ===================================================================== */
  var surpriseModal = $('#surpriseModal');

  function openModal() {
    surpriseModal.classList.add('open');
    surpriseModal.setAttribute('aria-hidden', 'false');
    burst('#surpriseBtn', 20);
    playMelody();
  }
  function closeModalWindow() {
    surpriseModal.classList.remove('open');
    surpriseModal.setAttribute('aria-hidden', 'true');
  }

  $('#surpriseBtn').addEventListener('click', openModal);
  $('#loveBtn').addEventListener('click', openModal);
  $('#closeModal').addEventListener('click', closeModalWindow);
  surpriseModal.addEventListener('click', function (e) {
    if (e.target === surpriseModal) closeModalWindow();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModalWindow();
      closeEnv();
    }
  });

  $('#modalLoveBtn').addEventListener('click', function () {
    percent = Math.min(100, percent + 1);
    renderMeter();
    burst(surpriseModal, 18);
    closeModalWindow();
  });

  /* =====================================================================
     10. GALERI (edit URL di array bawah ini)
     ===================================================================== */
  var galleryLinks = [
    'https://cdn.phototourl.com/free/2026-08-23-91bb3278-8f02-4a7f-b2c8-52f252ed8575.jpg', // Foto 1
    'https://videotourl.com/videos/1787455901826-16589960-4408-4409-b749-7c8e5e7d21a1.mp4', // Video 2
    'https://cdn.phototourl.com/free/2026-08-23-a46ad76c-e1e3-414d-8ac4-c5f70bd7dca0.jpg', // Foto 3
    'https://videotourl.com/videos/1787455656100-d2386848-0e90-40fa-b51e-8ef0f57e3c58.mp4', // Video 4
    'https://cdn.phototourl.com/free/2026-08-23-00354284-62cf-436b-b919-fa0d3a782810.jpg', // Foto 5
    'https://videotourl.com/videos/1787455612018-58c209ff-fa51-4fbd-970b-7ec415877d10.mp4', // Video 6
    '', // Foto 7
    '', // Foto 8
    '', // Foto 9
    ''  // Foto 10
  ];

  var galleryGrid = $('#galleryGrid');

  function isVideoUrl(url) {
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || /video/i.test(url);
  }

  galleryLinks.forEach(function (url, index) {
    var item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML =
      '<div class="gallery-placeholder"><span>🖼️</span><span>Foto ' + (index + 1) + '</span></div>';
    galleryGrid.appendChild(item);

    if (!url) return;

    var placeholder = item.querySelector('.gallery-placeholder');
    var isVideo = isVideoUrl(url);
    var media = isVideo ? document.createElement('video') : document.createElement('img');

    media.src = url;
    media.alt = 'Galeri ' + (index + 1);
    media.style.width = '100%';
    media.style.height = '100%';
    media.style.objectFit = 'cover';

    if (isVideo) {
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      media.muted = true;
      media.playsInline = true;
      media.preload = 'auto';
      media.setAttribute('playsinline', 'true');
      media.setAttribute('webkit-playsinline', 'true');
      media.addEventListener('ended', function () {
        media.currentTime = 0;
        media.play().catch(function () {});
      });
      media.onloadeddata = function () {
        if (placeholder) placeholder.style.display = 'none';
        item.style.cursor = 'pointer';
        media.play().catch(function () {});
      };
      media.onerror = function () {
        media.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      };
    } else {
      media.onload = function () {
        if (placeholder) placeholder.style.display = 'none';
        item.style.cursor = 'pointer';
      };
      media.onerror = function () {
        media.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      };
    }

    item.appendChild(media);
  });

  /* =====================================================================
     11. AMPLOP SURAT
     ===================================================================== */
  var envelope = $('#envelope');
  var envTimers = [];

  function clearEnvTimers() {
    envTimers.forEach(clearTimeout);
    envTimers = [];
  }

  function openEnv() {
    if (!envelope) return;
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');          // flap buka + kertas keluar
    burst(envelope, 18);
    playMelody();
    var letter = envelope.querySelector('.env-letter');
    if (letter) letter.scrollTop = 0;

    // setelah kertas keluar, amplop memudar & kertas mengambil alih tempatnya
    envTimers.push(setTimeout(function () {
      envelope.classList.add('gone');
    }, 780));
  }

  function closeEnv() {
    if (!envelope || !envelope.classList.contains('open')) return;
    clearEnvTimers();
    envelope.classList.remove('gone');       // kertas turun dulu...
    var letter = envelope.querySelector('.env-letter');
    if (letter) letter.scrollTop = 0;

    envTimers.push(setTimeout(function () {  // ...baru amplop muncul lagi
      envelope.classList.remove('open');
    }, 450));
  }

  // ---- INI YANG TADI HILANG: pasang interaksi amplop ----
  if (envelope) {
    envelope.addEventListener('click', openEnv);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnv();
      }
    });
  }
  var envCloseBtn = $('#envClose');
  if (envCloseBtn) {
    envCloseBtn.addEventListener('click', function (e) {
      e.stopPropagation();            // biar nggak ikut mentrigger klik amplop
      closeEnv();
    });
  }

  /* =====================================================================
     12. NADA ROMANTIS (Web Audio, tanpa file)
     ===================================================================== */
  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var audioCtx = null;
  if (AudioCtx) {
    try { audioCtx = new AudioCtx(); } catch (err) { audioCtx = null; }
  }

  function playTone(freq, duration, type, volume) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = volume || 0.045;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  }

  function playMelody() {
    var melody = [440, 554.37, 659.25, 554.37, 659.25, 783.99];
    melody.forEach(function (freq, idx) {
      setTimeout(function () { playTone(freq, 0.22, 'triangle', 0.045); }, idx * 170);
    });
  }

  /* =====================================================================
     13. BACKGROUND HATI INTERAKTIF (canvas)
     ===================================================================== */
  var canvas = $('#heartCanvas');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var hearts = [];
  var pointer = { x: -9999, y: -9999, active: false };

  var palette = [
    'rgba(255,110,182,',
    'rgba(255,158,201,',
    'rgba(215,201,255,',
    'rgba(255,209,102,',
    'rgba(255,214,231,'
  ];

  function drawHeartPath(c, x, y, s, rot, alpha, color) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.scale(s, s);
    c.globalAlpha = alpha;
    c.beginPath();
    c.moveTo(0, 0.45);
    c.bezierCurveTo(-0.75, -0.13, -0.62, -0.62, -0.29, -0.62);
    c.bezierCurveTo(-0.1, -0.62, 0, -0.5, 0, -0.42);
    c.bezierCurveTo(0, -0.5, 0.1, -0.62, 0.29, -0.62);
    c.bezierCurveTo(0.62, -0.62, 0.75, -0.13, 0, 0.45);
    c.closePath();
    c.fillStyle = color + '0.9)';
    c.shadowColor = color + '0.75)';
    c.shadowBlur = 16;
    c.fill();
    c.restore();
  }

  function makeHeart(spawnBottom) {
    var size = rand(10, 26);
    return {
      x: rand(0, W),
      y: spawnBottom ? H + rand(10, 120) : rand(0, H),
      size: size,
      speed: rand(0.25, 0.95) * (size / 18),
      drift: rand(-0.4, 0.4),
      rot: rand(-0.5, 0.5),
      vr: rand(-0.006, 0.006),
      alpha: rand(0.28, 0.72),
      color: pick(palette),
      phase: rand(0, Math.PI * 2),
      wobble: rand(0.4, 1.1)
    };
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var target = Math.max(28, Math.min(80, Math.round(W / 16)));
    hearts = [];
    for (var i = 0; i < target; i++) hearts.push(makeHeart(false));
  }

  function animateHearts() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < hearts.length; i++) {
      var h = hearts[i];
      h.phase += 0.012 * h.wobble;
      h.x += h.drift + Math.sin(h.phase) * 0.55;
      h.y -= h.speed;
      h.rot += h.vr;

      // reaksi ke kursor
      if (pointer.active) {
        var dx = h.x - pointer.x;
        var dy = h.y - pointer.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0.01) {
          var force = (140 - dist) / 140;
          h.x += (dx / dist) * force * 1.7;
          h.y += (dy / dist) * force * 1.7;
        }
      }

      if (h.y + h.size < -30 || h.x < -80 || h.x > W + 80) {
        hearts[i] = makeHeart(true);
        continue;
      }

      drawHeartPath(ctx, h.x, h.y, h.size / 22, h.rot, h.alpha, h.color);
    }
    requestAnimationFrame(animateHearts);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    spawnTrail(e.clientX, e.clientY);
  });
  window.addEventListener('pointerleave', function () { pointer.active = false; });
  window.addEventListener('pointerdown', function (e) {
    // tambahkan sedikit hati yang nongol dari titik klik
    for (var i = 0; i < 6; i++) {
      var nh = makeHeart(false);
      nh.x = e.clientX + rand(-20, 20);
      nh.y = e.clientY + rand(-20, 20);
      nh.speed = rand(0.7, 1.6);
      nh.alpha = 0.85;
      hearts.push(nh);
    }
    if (hearts.length > 160) hearts.splice(0, hearts.length - 160);
  });

  // jejak kursor (dibatasi biar ringan)
  var lastTrail = 0;
  function spawnTrail(x, y) {
    var now = Date.now();
    if (now - lastTrail < 90) return;
    lastTrail = now;
    var t = document.createElement('span');
    t.className = 'trail-heart';
    t.textContent = pick(['❤', '💗', '💖', '✨']);
    t.style.left = x + 'px';
    t.style.top = y + 'px';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 900);
  }

  resizeCanvas();
  animateHearts();

  /* =====================================================================
     14. sentuhan terakhir
     ===================================================================== */
  window.addEventListener('load', function () {
    updateMusicUI();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) burst(window, 0);
  });
})();