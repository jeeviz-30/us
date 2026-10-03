/* =======================================================
   BOYFRIEND'S DAY SURPRISE - JAVASCRIPT
   Interactions, Audio Handling, 3D Flips, Canvas Confetti & Certificate
   ======================================================= */

(function () {
  'use strict';

  // --- CONFIG & STATE ---
  const state = {
    currentStep: 1, // 1: Envelope, 2: Hero & Music, 3: Wall, 4: Cert, 5: Note
    sender: 'Jeevitha',
    receiver: 'My Love',
    songTitle: 'Rathinamo (Female Version)',
    songArtist: 'Tanisha Gnanavel • Saurav Srisan',
    noteMessage: `I'm not always great at saying everything out loud, so I built this special page instead.\n\nHaving you in my life makes every ordinary moment sweeter. You make me laugh when I'm stressed, you listen to me with endless patience, and you make me feel so safe and cherished.\n\nI hope today reminds you how deeply valued and loved you are. Whatever comes our way in life, remember that you've got a girl permanently in your corner — cheering for you, loving you, and proud of you every single day.`,
    isPlaying: false
  };

  // DOM Elements
  const $ = id => document.getElementById(id);
  const aud = $('aud');
  const envelopeBox = $('envelopeBox');
  const pg1 = $('pg1');
  const nav = $('nav');
  const backBtn = $('back');
  const nextBtn = $('next');
  const pplay = $('pplay');
  const pbar = $('pbar');
  const pfill = $('pfill');
  const ptime = $('ptime');
  const musicToggleBtn = $('musicToggleBtn');
  const musicLabel = $('musicLabel');
  const customAudioInput = $('customAudioInput');
  const burstBtn = $('burstBtn');
  const dlCertBtn = $('dlCert');
  const toCertBtn = $('toCertBtn');
  const toLetterBtn = $('toLetterBtn');
  const albumBtn = $('albumBtn');
  const restartBtn = $('restartBtn');

  // Settings Modal Elements
  const openSettingsBtn = $('openSettingsBtn');
  const settingsModal = $('settingsModal');
  const closeSettingsModal = $('closeSettingsModal');
  const saveSettingsBtn = $('saveSettingsBtn');
  const inputSender = $('inputSender');
  const inputReceiver = $('inputReceiver');
  const inputSongTitle = $('inputSongTitle');
  const inputNoteMessage = $('inputNoteMessage');

  // Load saved preferences if any
  function loadSavedData() {
    try {
      const saved = localStorage.getItem('us_boyfriend_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sender) state.sender = parsed.sender;
        if (parsed.receiver) state.receiver = parsed.receiver;
        if (parsed.songTitle) state.songTitle = parsed.songTitle;
        if (parsed.noteMessage) state.noteMessage = parsed.noteMessage;
      }
    } catch (e) {
      console.warn('Storage read error:', e);
    }
    applyDataToUI();
  }

  function saveData() {
    try {
      localStorage.setItem('us_boyfriend_data', JSON.stringify({
        sender: state.sender,
        receiver: state.receiver,
        songTitle: state.songTitle,
        noteMessage: state.noteMessage
      }));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    applyDataToUI();
  }

  function applyDataToUI() {
    // Page 2
    $('vTitle').textContent = `To ${state.receiver}`;
    $('vRibbon').textContent = `from ${state.sender} ✿`;
    $('heroSignName').textContent = state.sender;
    $('songTitle').textContent = state.songTitle;
    musicLabel.textContent = state.songTitle.split('(')[0].trim() || 'Music';

    // Page 4: Cert
    $('cWho').textContent = state.receiver;
    $('cFrom').textContent = state.sender;

    // Page 5: Note
    $('noteReceiver').textContent = state.receiver;
    $('noteBody').innerHTML = state.noteMessage.replace(/\n/g, '<br>');
    $('noteSender').textContent = `${state.sender} ♥`;

    // Inputs
    inputSender.value = state.sender;
    inputReceiver.value = state.receiver;
    inputSongTitle.value = state.songTitle;
    inputNoteMessage.value = state.noteMessage;
  }

  // --- FLOATING HEARTS GENERATOR ---
  function initFloatingHearts() {
    const container = $('hearts-bg');
    const hearts = ['♥', '✿', '★', '💖', '✨', '💕'];
    
    setInterval(() => {
      if (document.hidden) return;
      const el = document.createElement('div');
      el.className = 'floating-heart';
      el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (Math.random() * 18 + 14) + 'px';
      el.style.animationDuration = (Math.random() * 5 + 6) + 's';
      container.appendChild(el);

      setTimeout(() => {
        el.remove();
      }, 11000);
    }, 1200);
  }

  // --- AUDIO LOGIC ---
  let audioContext = null;
  let synthFallbackPlaying = false;
  let synthInterval = null;

  // Gentle fallback synth melody if song.mp3 is not loaded yet
  function playSynthFallback() {
    if (synthFallbackPlaying) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();

      synthFallbackPlaying = true;
      state.isPlaying = true;
      updatePlayControls();

      // Soft romantic pentatonic arpeggio notes
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 440.00, 329.63];
      let stepIdx = 0;

      synthInterval = setInterval(() => {
        if (!synthFallbackPlaying) return;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[stepIdx % notes.length], audioContext.currentTime);

        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 1.25);
        stepIdx++;
      }, 700);
    } catch (e) {
      console.warn('Synth playback failed:', e);
    }
  }

  function stopSynthFallback() {
    synthFallbackPlaying = false;
    if (synthInterval) clearInterval(synthInterval);
  }

  function playAudio() {
    // First try HTML5 audio element (song.mp3 or custom uploaded audio)
    const playPromise = aud.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        state.isPlaying = true;
        stopSynthFallback();
        updatePlayControls();
      }).catch(err => {
        console.log('Direct audio play error, using gentle romantic ambiance fallback:', err);
        playSynthFallback();
      });
    }
  }

  function pauseAudio() {
    aud.pause();
    stopSynthFallback();
    state.isPlaying = false;
    updatePlayControls();
  }

  function toggleAudio() {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  function updatePlayControls() {
    const playText = state.isPlaying ? '❚❚' : '▶';
    pplay.textContent = playText;
    musicToggleBtn.classList.toggle('playing', state.isPlaying);
    $('musicIcon').textContent = state.isPlaying ? '🎶' : '🎵';
  }

  // Audio Time Formatting
  const fmt = t => (isFinite(t) && !isNaN(t)) 
    ? Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0') 
    : '0:00';

  aud.ontimeupdate = () => {
    if (aud.duration) {
      const pct = (aud.currentTime / aud.duration) * 100;
      pfill.style.width = pct + '%';
      ptime.textContent = fmt(aud.currentTime) + ' / ' + fmt(aud.duration);
    }
  };

  aud.onloadedmetadata = () => {
    ptime.textContent = fmt(aud.currentTime) + ' / ' + fmt(aud.duration);
  };

  aud.onplay = () => {
    state.isPlaying = true;
    updatePlayControls();
  };

  aud.onpause = () => {
    if (!synthFallbackPlaying) {
      state.isPlaying = false;
      updatePlayControls();
    }
  };

  // Seek bar click
  pbar.onclick = e => {
    if (!aud.duration) return;
    const rect = pbar.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    aud.currentTime = clickRatio * aud.duration;
  };

  // Custom audio upload support
  customAudioInput.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      stopSynthFallback();
      const url = URL.createObjectURL(file);
      aud.src = url;
      aud.play().then(() => {
        state.isPlaying = true;
        updatePlayControls();
      });
      state.songTitle = file.name.replace(/\.[^/.]+$/, '');
      applyDataToUI();
      saveData();
      triggerConfetti();
    }
  };

  // --- NAVIGATION LOGIC ---
  function showStep(n) {
    if (n < 1 || n > 5) return;
    state.currentStep = n;

    // Toggle pages
    for (let i = 1; i <= 5; i++) {
      const pageEl = $('pg' + i);
      if (pageEl) {
        pageEl.classList.toggle('hidden', i !== n);
      }
    }

    // Nav Bar
    nav.classList.toggle('hidden', n < 1);
    backBtn.classList.toggle('show', n > 1);
    nextBtn.classList.toggle('show', n >= 1 && n < 5);
    nextBtn.textContent = n === 1 ? 'Open ✉' : 'Next →';

    // Dots
    document.querySelectorAll('#dots .dot').forEach((dot, idx) => {
      dot.classList.toggle('on', idx === n - 1);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState({ step: n }, '', '#s' + n);
  }

  function go(delta) {
    const target = state.currentStep + delta;
    if (target >= 1 && target <= 5) {
      showStep(target);
    }
  }

  // --- ENVELOPE OPENING ---
  function openEnvelope() {
    if (envelopeBox.classList.contains('open')) {
      showStep(2);
      return;
    }
    envelopeBox.classList.add('open');
    playAudio();
    triggerHeartExplosion();

    setTimeout(() => {
      showStep(2);
    }, 850);
  }

  envelopeBox.onclick = openEnvelope;
  pg1.onclick = e => {
    // Only open if clicking envelope or background
    if (state.currentStep === 1) openEnvelope();
  };

  // Flip cards in memory wall
  document.querySelectorAll('.flip').forEach(card => {
    card.onclick = e => {
      e.stopPropagation();
      card.classList.toggle('on');
    };
  });

  // Buttons navigation
  nextBtn.onclick = () => {
    if (state.currentStep === 1) {
      openEnvelope();
    } else {
      go(1);
    }
  };

  backBtn.onclick = () => go(-1);
  albumBtn.onclick = () => showStep(3);
  toCertBtn.onclick = () => showStep(4);
  toLetterBtn.onclick = () => showStep(5);
  restartBtn.onclick = () => showStep(1);

  // Dot navigation
  document.querySelectorAll('#dots .dot').forEach(dot => {
    dot.onclick = () => {
      const s = parseInt(dot.getAttribute('data-step'), 10);
      if (s) showStep(s);
    };
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!settingsModal.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  // Popstate
  window.addEventListener('popstate', e => {
    const s = e.state?.step;
    if (s && s >= 1 && s <= 5) {
      showStep(s);
    }
  });

  // --- CONFETTI BURSTS ---
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  function triggerHeartExplosion() {
    if (typeof confetti === 'function') {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#e07a5f', '#e8a44e', '#3f9482']
      });
      fire(0.2, {
        spread: 60,
        colors: ['#e07a5f', '#cfe6df']
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });
    }
  }

  burstBtn.onclick = () => {
    triggerHeartExplosion();
  };

  // --- CERTIFICATE DOWNLOAD (HTML2CANVAS) ---
  dlCertBtn.onclick = async () => {
    const certBox = $('certBox');
    const origText = dlCertBtn.textContent;
    dlCertBtn.disabled = true;
    dlCertBtn.textContent = 'Generating Certificate… ✿';

    try {
      if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas not loaded');
      }

      const canvas = await html2canvas(certBox, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
        onclone: doc => {
          const el = doc.getElementById('certBox');
          if (el) el.style.transform = 'none';
        }
      });

      const link = document.createElement('a');
      link.download = `Boyfriend-Certificate-${state.receiver.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      triggerConfetti();
    } catch (err) {
      console.error('Certificate capture failed:', err);
      alert('Could not download image directly. You can take a screenshot of this cute certificate anytime!');
    } finally {
      dlCertBtn.disabled = false;
      dlCertBtn.textContent = origText;
    }
  };

  // --- SETTINGS MODAL ---
  openSettingsBtn.onclick = () => {
    settingsModal.classList.remove('hidden');
  };

  closeSettingsModal.onclick = () => {
    settingsModal.classList.add('hidden');
  };

  settingsModal.onclick = e => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  };

  saveSettingsBtn.onclick = () => {
    state.sender = inputSender.value.trim() || 'Jeevitha';
    state.receiver = inputReceiver.value.trim() || 'My Love';
    state.songTitle = inputSongTitle.value.trim() || 'Rathinamo (Female Version)';
    if (inputNoteMessage.value.trim()) {
      state.noteMessage = inputNoteMessage.value.trim();
    }
    saveData();
    settingsModal.classList.add('hidden');
    triggerConfetti();
  };

  // Top bar music button
  musicToggleBtn.onclick = toggleAudio;
  pplay.onclick = toggleAudio;

  // --- INIT ---
  loadSavedData();
  initFloatingHearts();

  // Check URL hash if opening direct step e.g. #s4
  const hash = window.location.hash;
  const match = hash.match(/#s([1-5])/);
  if (match) {
    showStep(parseInt(match[1], 10));
  } else {
    showStep(1);
  }

})();
