/**
 * APLICACIÓN PRINCIPAL DE "SOROBÍN Y EL ÁBACO MÁGICO"
 *  - Interfaz Duolingo Kids / Montessori con adaptación horizontal nativa.
 *  - Menú clásico de configuración para ajustar volumen general, voz y efectos de sonido (SFX).
 *  - Botones superiores compactos en 1 sola línea (sin saltos de texto molestos en móvil).
 *  - Pantallita mágica en 1 fila horizontal fija (sin corte de Unidades).
 *  - Avance seguro y fluido: botón "¡Siguiente! ➡️" y temporizador de seguridad anticaída.
 *  - Pedagogía auténtica: ayuda solo en tutorial o al tocar "💡 Pista".
 */

class ProgressDB {
  static KEY = 'sorobin_game_save_v2';

  static save(data) {
    try {
      localStorage.setItem(ProgressDB.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Error al guardar progreso:', e);
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(ProgressDB.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}

class SorobinGameApp {
  constructor() {
    // 1. Cargar progreso de la base de datos local
    const saved = ProgressDB.load();
    this.currentLevelIndex = saved?.levelIndex || 0;
    this.currentChallengeIndex = saved?.challengeIndex || 0;
    this.stars = saved?.stars || 0;
    this.completedLevelIds = saved?.completedLevelIds || [];
    this.maxUnlockedLevel = saved?.maxUnlockedLevel !== undefined 
      ? saved.maxUnlockedLevel 
      : Math.max(0, ...this.completedLevelIds.map(id => id + 1));

    if (this.currentLevelIndex > this.maxUnlockedLevel) {
      this.maxUnlockedLevel = this.currentLevelIndex;
    }

    // Estado interno
    this.idleTimer = null;
    this.hintTimer = null;
    this.autoAdvanceTimer = null;
    this.isAdvancing = false;
    this.isSpeakingPrompt = false;
    this.isFreeMode = false;
    this.freeModeSpeechDebounce = null;

    // 2. Elementos DOM - Barra superior
    this.btnLevelMap = document.getElementById('btnLevelMap');
    this.levelName = document.getElementById('levelName');
    this.btnFreeModeToggle = document.getElementById('btnFreeModeToggle');
    this.modeBtnText = document.getElementById('modeBtnText');
    this.starCountEl = document.getElementById('starCount');
    this.btnSettingsToggle = document.getElementById('btnSettingsToggle');
    this.btnVoice = document.getElementById('btnVoiceToggle');

    // 3. Columna izquierda: Sorobín y Metas
    this.speechText = document.getElementById('speechText');
    this.btnRepeatSpeech = document.getElementById('btnRepeatSpeech');
    this.goalCard = document.getElementById('goalCard');
    this.targetNumberEl = document.getElementById('targetNumber');
    this.visualCounterEl = document.getElementById('visualCounter');

    // Modo Libre / Pantallita LCD
    this.freeLcdCard = document.getElementById('freeLcdCard');
    this.freeLcdNumber = document.getElementById('freeLcdNumber');
    this.freeLcdBreakdown = document.getElementById('freeLcdBreakdown');
    this.btnSpeakFreeNum = document.getElementById('btnSpeakFreeNum');
    this.rodSelector = document.getElementById('rodSelector');

    // Botones de acción
    this.btnClear = document.getElementById('btnClearAbacus');
    this.btnHelp = document.getElementById('btnHelp');

    // 4. Columna derecha: Ábaco y Placa de valor
    this.sorobanFrame = document.getElementById('sorobanFrame');
    this.sorobanBoard = document.getElementById('sorobanBoard');
    this.valuePlaqueEl = document.getElementById('valuePlaque');
    this.currentAbacusValEl = document.getElementById('currentAbacusValue');
    this.liveCounterEl = document.getElementById('liveCounter');
    this.sideCheckEl = document.getElementById('sideCheck');
    this.btnNextChallenge = document.getElementById('btnNextChallenge');

    // 5. Modales y Overlays
    this.levelsModal = document.getElementById('levelsModal');
    this.btnCloseLevels = document.getElementById('btnCloseLevels');
    this.levelsGrid = document.getElementById('levelsGrid');
    this.btnOpenFreeMode = document.getElementById('btnOpenFreeMode');

    // Modal de Configuración Clásico
    this.settingsModal = document.getElementById('settingsModal');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.btnSaveSettings = document.getElementById('btnSaveSettings');
    this.sliderMasterVol = document.getElementById('sliderMasterVol');
    this.lblMasterVol = document.getElementById('lblMasterVol');
    this.sliderVoiceVol = document.getElementById('sliderVoiceVol');
    this.lblVoiceVol = document.getElementById('lblVoiceVol');
    this.sliderSfxVol = document.getElementById('sliderSfxVol');
    this.lblSfxVol = document.getElementById('lblSfxVol');
    this.toggleVoice = document.getElementById('toggleVoice');
    this.toggleSfx = document.getElementById('toggleSfx');
    this.btnTestVoice = document.getElementById('btnTestVoice');
    this.btnTestSfx = document.getElementById('btnTestSfx');
    this.btnTestFanfare = document.getElementById('btnTestFanfare');

    this.startOverlay = document.getElementById('startOverlay');
    this.btnStart = document.getElementById('btnStartGame');
    this.celebrationModal = document.getElementById('celebrationModal');
    this.modalBtnContinue = document.getElementById('modalBtnContinue');

    // 6. Personajes y subsistemas
    this.mascot = new MascotManager('mascotContainer');
    this.mascotStart = new MascotManager('startMascot');
    this.mascotModal = new MascotManager('modalMascot');

    // Motor de Ábaco Japonés
    this.soroban = new SorobanEngine('sorobanBoard', {
      rods: 1,
      onChange: (val) => this.onAbacusChange(val)
    });
    this.soroban.onColTagClick = (cls) => this.handlePositionalClick(cls);

    this.confetti = new ConfettiController('confettiCanvas');

    // 7. Inicialización
    this.setupEventListeners();
    this.updateStarsUI();
    this.syncSettingsUI();
  }

  setupEventListeners() {
    // Pantalla de Inicio
    if (this.btnStart) {
      this.btnStart.addEventListener('click', () => {
        this.startOverlay.classList.add('hidden');
        if (window.soundEngine) window.soundEngine.initAudioContext();
        this.startCurrentChallenge();
      });
    }

    // Alternar entre Retos y Modo Libre
    if (this.btnFreeModeToggle) {
      this.btnFreeModeToggle.addEventListener('click', () => {
        this.toggleFreeMode();
      });
    }

    // Botón de Modo Libre dentro del mapa de niveles
    if (this.btnOpenFreeMode) {
      this.btnOpenFreeMode.addEventListener('click', () => {
        this.closeLevelMap();
        this.enterFreeMode(4);
      });
    }

    // Escuchar número en Modo Libre
    if (this.btnSpeakFreeNum) {
      this.btnSpeakFreeNum.addEventListener('click', () => {
        this.speakFreeNumber(this.soroban.getTotalValue());
      });
    }

    // Selector de varillas en Modo Libre (1 a 4)
    if (this.rodSelector) {
      const rodBtns = this.rodSelector.querySelectorAll('.rod-sel-btn');
      rodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const count = parseInt(btn.dataset.rods, 10);
          this.setFreeModeRods(count, true);
        });
      });
    }

    // Botón Limpiar a 0
    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => {
        this.soroban.clear();
        if (this.isFreeMode) {
          this.updateFreeModeDisplay(0);
          this.setSpeech('Ábaco limpio a 0. ¡Mueve cualquier bolita!');
          return;
        }

        const level = window.GAME_LEVELS[this.currentLevelIndex];
        const challenge = level?.challenges[this.currentChallengeIndex];
        if (challenge && challenge.isTutorial) {
          this.showGuidance(challenge, true);
        }
        this.resetIdleTimer();
      });
    }

    // Botón de Pista (💡 Pista)
    if (this.btnHelp) {
      this.btnHelp.addEventListener('click', () => {
        this.triggerHint();
      });
    }

    // Botón de Avanzar Reto Manual (para que nunca se quede trabado)
    if (this.btnNextChallenge) {
      this.btnNextChallenge.addEventListener('click', () => {
        const level = window.GAME_LEVELS[this.currentLevelIndex];
        const isLevelComplete = this.currentChallengeIndex >= level.challenges.length - 1;
        if (isLevelComplete) {
          this.showLevelCelebration(level);
        } else {
          this.advanceChallenge();
        }
      });
    }

    // Repetir audio
    if (this.btnRepeatSpeech) {
      this.btnRepeatSpeech.addEventListener('click', () => {
        if (this.isFreeMode) {
          this.speakFreeNumber(this.soroban.getTotalValue());
        } else {
          this.speakCurrentInstruction();
        }
      });
    }

    // Botón rápido de Voz en la barra superior
    if (this.btnVoice) {
      this.btnVoice.addEventListener('click', () => {
        window.soundEngine.setVoiceEnabled(!window.soundEngine.voiceEnabled);
        this.syncSettingsUI();
        if (window.soundEngine.voiceEnabled && !this.isFreeMode) {
          this.speakCurrentInstruction();
        }
      });
    }

    // Modal de Victoria de Nivel
    if (this.modalBtnContinue) {
      this.modalBtnContinue.addEventListener('click', () => {
        this.celebrationModal.classList.add('hidden');
        window.soundEngine.stopSpeaking();
        this.advanceChallenge();
      });
    }

    // Modal de Mapa de Niveles
    if (this.btnLevelMap) {
      this.btnLevelMap.addEventListener('click', () => this.openLevelMap());
    }
    if (this.btnCloseLevels) {
      this.btnCloseLevels.addEventListener('click', () => this.closeLevelMap());
    }
    if (this.levelsModal) {
      this.levelsModal.addEventListener('click', (e) => {
        if (e.target === this.levelsModal) this.closeLevelMap();
      });
    }

    // Modal de Configuración Clásica de Sonido
    if (this.btnSettingsToggle) {
      this.btnSettingsToggle.addEventListener('click', () => this.openSettings());
    }
    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', () => this.closeSettings());
    }
    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => this.closeSettings());
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.closeSettings();
      });
    }

    // Eventos de sliders y controles de sonido
    if (this.sliderMasterVol) {
      this.sliderMasterVol.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        window.soundEngine.setMasterVolume(val / 100);
        if (this.lblMasterVol) this.lblMasterVol.textContent = `${val}%`;
      });
    }

    if (this.sliderVoiceVol) {
      this.sliderVoiceVol.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        window.soundEngine.setVoiceVolume(val / 100);
        if (this.lblVoiceVol) this.lblVoiceVol.textContent = `${val}%`;
      });
    }

    if (this.sliderSfxVol) {
      this.sliderSfxVol.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        window.soundEngine.setSfxVolume(val / 100);
        if (this.lblSfxVol) this.lblSfxVol.textContent = `${val}%`;
      });
    }

    if (this.toggleVoice) {
      this.toggleVoice.addEventListener('change', (e) => {
        window.soundEngine.setVoiceEnabled(e.target.checked);
        this.syncSettingsUI();
      });
    }

    if (this.toggleSfx) {
      this.toggleSfx.addEventListener('change', (e) => {
        window.soundEngine.setSfxEnabled(e.target.checked);
      });
    }

    // Botones de prueba en configuración
    if (this.btnTestVoice) {
      this.btnTestVoice.addEventListener('click', () => {
        window.soundEngine.playVoiceKey('l0_intro');
      });
    }

    if (this.btnTestSfx) {
      this.btnTestSfx.addEventListener('click', () => {
        window.soundEngine.playBeadClick(true);
      });
    }

    if (this.btnTestFanfare) {
      this.btnTestFanfare.addEventListener('click', () => {
        window.soundEngine.playSuccess();
      });
    }
  }

  // --- CONFIGURACIÓN CLÁSICA DE JUEGO ---

  openSettings() {
    this.syncSettingsUI();
    if (this.settingsModal) this.settingsModal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.initAudioContext();
  }

  closeSettings() {
    if (this.settingsModal) this.settingsModal.classList.add('hidden');
    if (window.soundEngine) window.soundEngine.saveSettings();
  }

  syncSettingsUI() {
    if (!window.soundEngine) return;
    const se = window.soundEngine;

    const masterPercent = Math.round(se.masterVolume * 100);
    const voicePercent = Math.round(se.voiceVolume * 100);
    const sfxPercent = Math.round(se.sfxVolume * 100);

    if (this.sliderMasterVol) this.sliderMasterVol.value = masterPercent;
    if (this.lblMasterVol) this.lblMasterVol.textContent = `${masterPercent}%`;

    if (this.sliderVoiceVol) this.sliderVoiceVol.value = voicePercent;
    if (this.lblVoiceVol) this.lblVoiceVol.textContent = `${voicePercent}%`;

    if (this.sliderSfxVol) this.sliderSfxVol.value = sfxPercent;
    if (this.lblSfxVol) this.lblSfxVol.textContent = `${sfxPercent}%`;

    if (this.toggleVoice) this.toggleVoice.checked = se.voiceEnabled;
    if (this.toggleSfx) this.toggleSfx.checked = se.sfxEnabled;

    if (this.btnVoice) {
      this.btnVoice.textContent = se.voiceEnabled ? '🔊' : '🔇';
    }
  }

  // --- MAPA INTERACTIVO DE NIVELES ---

  openLevelMap() {
    this.renderLevelMapGrid();
    this.levelsModal.classList.remove('hidden');
    if (window.soundEngine) window.soundEngine.initAudioContext();
  }

  closeLevelMap() {
    this.levelsModal.classList.add('hidden');
  }

  renderLevelMapGrid() {
    if (!this.levelsGrid) return;
    this.levelsGrid.innerHTML = '';

    const levelIcons = ['🟢', '🟡', '🦀', '🧹', '➕', '➖', '🔟', '🌟', '🚀', '🏰', '👑'];

    window.GAME_LEVELS.forEach((lvl, idx) => {
      const isCompleted = this.completedLevelIds.includes(idx);
      const isCurrent = idx === this.currentLevelIndex;
      const isUnlocked = idx <= this.maxUnlockedLevel || isCompleted;

      const card = document.createElement('div');
      card.className = `level-card-item ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;

      let statusBadge = '🔒';
      if (isCurrent) statusBadge = '▶️';
      else if (isCompleted) statusBadge = '⭐';
      else if (isUnlocked) statusBadge = '🔓';

      const icon = lvl.icon || levelIcons[idx] || '🧮';

      card.innerHTML = `
        <div class="level-info">
          <div class="level-icon-badge">${icon}</div>
          <div class="level-titles">
            <span class="level-title-text">${lvl.title}</span>
            <span class="level-desc-text">${lvl.desc || 'Reto de Sorobín'}</span>
          </div>
        </div>
        <div class="level-status-badge">${statusBadge}</div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          this.selectLevel(idx);
        });
      } else {
        card.addEventListener('click', () => {
          this.mascot.surprise();
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 400);
          this.setSpeech('¡Supera el nivel anterior para abrir este mundo!');
          if (window.soundEngine) window.soundEngine.playVoiceKey('reminder_try');
        });
      }

      this.levelsGrid.appendChild(card);
    });
  }

  selectLevel(levelIndex) {
    if (levelIndex === this.currentLevelIndex && this.currentChallengeIndex === 0) {
      this.closeLevelMap();
      return;
    }
    this.isAdvancing = false;
    this.isSpeakingPrompt = false;
    this.clearIdleTimer();
    this.clearHintTimer();
    window.soundEngine.stopSpeaking();

    this.currentLevelIndex = levelIndex;
    this.currentChallengeIndex = 0;
    this.persistCurrentProgress();
    this.closeLevelMap();
    this.startCurrentChallenge();
  }

  // --- MODO LIBRE (LABORATORIO DE EXPERIMENTACIÓN) ---

  toggleFreeMode() {
    if (this.isFreeMode) {
      this.exitFreeMode();
    } else {
      this.enterFreeMode(4);
    }
  }

  enterFreeMode(rods = 4) {
    this.isFreeMode = true;
    this.clearIdleTimer();
    this.clearHintTimer();
    window.soundEngine.stopSpeaking();

    this.soroban.hideGhostHand();
    this.soroban.clearHighlights();

    if (this.goalCard) this.goalCard.classList.add('hidden');
    if (this.freeLcdCard) this.freeLcdCard.classList.remove('hidden');

    if (this.modeBtnText) this.modeBtnText.textContent = '🏆 Retos';
    if (this.btnFreeModeToggle) this.btnFreeModeToggle.classList.add('active-free');
    if (this.levelName) this.levelName.textContent = 'Modo Libre';

    if (this.valuePlaqueEl) this.valuePlaqueEl.classList.remove('match-celebrate');
    if (this.sideCheckEl) this.sideCheckEl.classList.add('hidden');
    if (this.btnNextChallenge) this.btnNextChallenge.classList.add('hidden');

    if (this.btnHelp) this.btnHelp.style.visibility = 'hidden';

    this.setFreeModeRods(rods, false);

    this.mascot.cheer();
    this.setSpeech('¡Bienvenida al Modo Libre! Mueve las bolitas para ver los números en la pantallita.');
  }

  exitFreeMode() {
    this.isFreeMode = false;
    if (this.goalCard) this.goalCard.classList.remove('hidden');
    if (this.freeLcdCard) this.freeLcdCard.classList.add('hidden');

    if (this.modeBtnText) this.modeBtnText.textContent = '🎮 Libre';
    if (this.btnFreeModeToggle) this.btnFreeModeToggle.classList.remove('active-free');

    if (this.btnHelp) this.btnHelp.style.visibility = 'visible';

    this.startCurrentChallenge();
  }

  setFreeModeRods(rods, announce = false) {
    this.soroban.setRodsCount(rods, true);
    this.soroban.clear(true);

    if (this.rodSelector) {
      const btns = this.rodSelector.querySelectorAll('.rod-sel-btn');
      btns.forEach(b => {
        if (parseInt(b.dataset.rods, 10) === rods) b.classList.add('active');
        else b.classList.remove('active');
      });
    }

    this.updateFreeModeDisplay(0);

    if (announce) {
      const msgs = {
        1: '¡Has seleccionado la columna de las Unidades!',
        2: '¡Has seleccionado hasta las Decenas!',
        3: '¡Has seleccionado hasta las Centenas!',
        4: '¡Has seleccionado hasta los Miles!'
      };
      this.setSpeech(msgs[rods] || '¡Varillas seleccionadas!');
      if (window.soundEngine) {
        window.soundEngine.playVoiceKey(`rods_${rods}`);
      }
    }
  }

  handlePositionalClick(cls) {
    const info = {
      'u': { key: 'pos_u', text: '¡Columna de las Unidades! Cada bolita inferior vale 1.' },
      'd': { key: 'pos_d', text: '¡Columna de las Decenas! Cada bolita inferior vale 10.' },
      'c': { key: 'pos_c', text: '¡Columna de las Centenas! Cada bolita inferior vale 100.' },
      'um': { key: 'pos_um', text: '¡Columna de las Unidades de Mil! Cada bolita inferior vale 1.000.' }
    };
    const item = info[cls] || info['u'];
    this.mascot.cheer();
    this.setSpeech(item.text);
    if (window.soundEngine) {
      window.soundEngine.playVoiceKey(item.key);
    }
  }

  updateFreeModeDisplay(val) {
    if (this.freeLcdNumber) {
      this.freeLcdNumber.textContent = val.toLocaleString('es-ES');
    }
    this.renderFreeBreakdown(val);
  }

  // Descomposición en 1 fila horizontal fija sin saltos confusos
  renderFreeBreakdown(val) {
    if (!this.freeLcdBreakdown) return;
    this.freeLcdBreakdown.innerHTML = '';

    const numRods = this.soroban.numRods;
    this.freeLcdBreakdown.style.setProperty('--rod-cols', numRods);

    const str = val.toString().padStart(numRods, '0');
    const posShort = {
      1: ['U'],
      2: ['D', 'U'],
      3: ['C', 'D', 'U'],
      4: ['UM', 'C', 'D', 'U']
    };
    const posClasses = {
      1: ['u'],
      2: ['d', 'u'],
      3: ['c', 'd', 'u'],
      4: ['um', 'c', 'd', 'u']
    };

    const shorts = posShort[numRods] || posShort[1];
    const classes = posClasses[numRods] || posClasses[1];

    for (let i = 0; i < numRods; i++) {
      const digit = parseInt(str[i], 10);
      const power = numRods - 1 - i;
      const partVal = digit * Math.pow(10, power);
      const colCls = classes[i] || 'u';

      const chip = document.createElement('div');
      chip.className = `pv-chip chip-${colCls}`;
      chip.title = 'Toca para escuchar el valor de esta columna';
      chip.innerHTML = `
        <span>${digit} ${shorts[i]}</span>
        <span class="pv-name">(${partVal})</span>
      `;
      chip.addEventListener('click', () => {
        this.handlePositionalClick(colCls);
      });
      this.freeLcdBreakdown.appendChild(chip);
    }
  }

  speakFreeNumber(val) {
    if (!window.soundEngine.voiceEnabled || window.soundEngine.masterVolume <= 0.01 || window.soundEngine.voiceVolume <= 0.01) return;
    const liveVal = this.soroban ? this.soroban.getTotalValue() : val;
    window.soundEngine.stopSpeaking();
    window.soundEngine.playNumber(liveVal);
  }

  // --- EJECUCIÓN DEL JUEGO PEDAGÓGICO ---

  startCurrentChallenge() {
    this.isAdvancing = false;
    this.isSpeakingPrompt = false;
    this.clearIdleTimer();
    this.clearHintTimer();
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    window.soundEngine.stopSpeaking();
    this.mascot.setMood('happy');

    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;
    const challenge = level.challenges[this.currentChallengeIndex];
    if (!challenge) return;

    // Adaptar el número de varillas según el nivel (1, 2, 3 o 4)
    const neededRods = level.rods || 1;
    if (this.soroban.numRods !== neededRods) {
      this.soroban.setRodsCount(neededRods);
    }

    // Texto limpio y corto en la barra superior (sin saltos de línea)
    if (this.levelName) {
      this.levelName.textContent = `Nivel ${this.currentLevelIndex}`;
    }
    if (this.modeBtnText) {
      this.modeBtnText.textContent = '🎮 Libre';
    }

    if (this.targetNumberEl) this.targetNumberEl.textContent = challenge.target;
    this.renderTargetStars(challenge.count !== undefined ? challenge.count : challenge.target);

    if (this.valuePlaqueEl) this.valuePlaqueEl.classList.remove('match-celebrate');
    if (this.sideCheckEl) this.sideCheckEl.classList.add('hidden');
    if (this.btnNextChallenge) this.btnNextChallenge.classList.add('hidden');

    // Valor inicial del ábaco
    if (challenge.initial !== undefined) {
      this.soroban.setValue(challenge.initial, true);
    } else {
      this.soroban.clear(true);
    }

    const currentVal = this.soroban.getTotalValue();
    if (this.currentAbacusValEl) this.currentAbacusValEl.textContent = currentVal;
    this.renderLiveStars(currentVal);

    this.setSpeech(challenge.text);

    // PEDAGOGÍA: Solo en retos tutorial (Level 0, retos 1 y 2) se muestra la mano animada.
    // En todos los demás retos el niño juega de forma totalmente independiente.
    this.soroban.hideGhostHand();
    this.soroban.clearHighlights();

    if (challenge.isTutorial) {
      setTimeout(() => {
        if (!this.isAdvancing && challenge.isTutorial) {
          this.showGuidance(challenge, true);
        }
      }, 450);
    }

    setTimeout(() => {
      if (!this.isAdvancing) {
        this.speakCurrentInstruction();
      }
    }, 120);
  }

  triggerHint() {
    if (this.isFreeMode || this.isAdvancing) return;
    const level = window.GAME_LEVELS[this.currentLevelIndex];
    const challenge = level?.challenges[this.currentChallengeIndex];
    if (!challenge) return;

    this.mascot.cheer();
    this.showGuidance(challenge, true);
    this.speakCurrentInstruction();

    this.clearHintTimer();
    this.hintTimer = setTimeout(() => {
      if (!challenge.isTutorial) {
        this.soroban.hideGhostHand();
        this.soroban.clearHighlights();
      }
    }, 3500);
  }

  clearHintTimer() {
    if (this.hintTimer) {
      clearTimeout(this.hintTimer);
      this.hintTimer = null;
    }
  }

  onAbacusChange(val) {
    if (this.currentAbacusValEl) this.currentAbacusValEl.textContent = val;
    this.renderLiveStars(val);

    if (this.isFreeMode) {
      this.updateFreeModeDisplay(val);
      this.setSpeech(`¡Estás formando el número ${val}!`);
      if (this.freeModeSpeechDebounce) {
        clearTimeout(this.freeModeSpeechDebounce);
      }
      this.freeModeSpeechDebounce = setTimeout(() => {
        this.speakFreeNumber(val);
      }, 550);
      return;
    }

    if (this.isAdvancing) return;

    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;
    const challenge = level.challenges[this.currentChallengeIndex];
    if (!challenge) return;

    if (val === challenge.target) {
      this.handleSuccess(challenge);
    } else {
      if (this.valuePlaqueEl) this.valuePlaqueEl.classList.remove('match-celebrate');
      if (this.sideCheckEl) this.sideCheckEl.classList.add('hidden');
      if (this.btnNextChallenge) this.btnNextChallenge.classList.add('hidden');

      if (challenge.isTutorial) {
        this.showGuidance(challenge, true);
      }

      if (!this.isSpeakingPrompt) {
        this.resetIdleTimer();
      }
    }
  }

  renderLiveStars(count) {
    if (!this.liveCounterEl) return;
    this.liveCounterEl.innerHTML = '';
    if (count === 0) {
      const span = document.createElement('span');
      span.textContent = '⚪ 0';
      span.style.fontSize = '0.9rem';
      span.style.color = '#94A3B8';
      this.liveCounterEl.appendChild(span);
      return;
    }

    if (count < 10) {
      for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        star.className = 'visual-dot';
        star.textContent = '⭐';
        this.liveCounterEl.appendChild(star);
      }
    } else {
      this.renderPlaceValueChips(this.liveCounterEl, count);
    }
  }

  renderTargetStars(count) {
    if (!this.visualCounterEl) return;
    this.visualCounterEl.innerHTML = '';
    if (count === 0) {
      const span = document.createElement('span');
      span.textContent = '⚪ 0';
      span.style.fontSize = '0.9rem';
      span.style.color = '#94A3B8';
      this.visualCounterEl.appendChild(span);
      return;
    }

    if (count < 10) {
      for (let i = 0; i < count; i++) {
        const star = document.createElement('span');
        star.className = 'visual-dot';
        star.textContent = '⭐';
        this.visualCounterEl.appendChild(star);
      }
    } else {
      this.renderPlaceValueChips(this.visualCounterEl, count);
    }
  }

  renderPlaceValueChips(container, number) {
    container.innerHTML = '';
    const str = number.toString();
    const len = str.length;
    const posNames = ['U', 'D', 'C', 'UM'];
    const posClasses = ['u', 'd', 'c', 'um'];

    for (let i = 0; i < len; i++) {
      const digit = str[i];
      const posIndex = len - 1 - i;
      const chip = document.createElement('span');
      chip.className = `pv-chip chip-${posClasses[posIndex] || 'u'}`;
      chip.textContent = `${digit}${posNames[posIndex] || ''}`;
      container.appendChild(chip);
    }
  }

  getDigitAction(rod, targetDigit) {
    if (targetDigit === 0) {
      if (rod.upper) {
        return { type: 'upper', index: 0, dir: 'up' };
      }
      if (rod.lowerCount > 0) {
        return { type: 'lower', index: rod.lowerCount - 1, dir: 'down' };
      }
      return null;
    }

    if (targetDigit >= 1 && targetDigit <= 4) {
      if (rod.upper) {
        return { type: 'upper', index: 0, dir: 'up' };
      }
      if (rod.lowerCount < targetDigit) {
        return { type: 'lower', index: targetDigit - 1, dir: 'up' };
      }
      if (rod.lowerCount > targetDigit) {
        return { type: 'lower', index: rod.lowerCount - 1, dir: 'down' };
      }
      return null;
    }

    if (targetDigit === 5) {
      if (rod.lowerCount > 0) {
        return { type: 'lower', index: rod.lowerCount - 1, dir: 'down' };
      }
      if (!rod.upper) {
        return { type: 'upper', index: 0, dir: 'down' };
      }
      return null;
    }

    if (targetDigit >= 6 && targetDigit <= 9) {
      if (!rod.upper) {
        return { type: 'upper', index: 0, dir: 'down' };
      }
      const neededLower = targetDigit - 5;
      if (rod.lowerCount < neededLower) {
        return { type: 'lower', index: neededLower - 1, dir: 'up' };
      }
      if (rod.lowerCount > neededLower) {
        return { type: 'lower', index: rod.lowerCount - 1, dir: 'down' };
      }
      return null;
    }

    return null;
  }

  getRecommendedAction(challenge) {
    const numRods = this.soroban.numRods;
    const target = challenge.target;
    const targetStr = target.toString().padStart(numRods, '0');

    for (let i = 0; i < numRods; i++) {
      const rod = this.soroban.rods[i];
      const targetDigit = parseInt(targetStr[i], 10);
      const currentRodVal = (rod.upper ? 5 : 0) + rod.lowerCount;

      if (currentRodVal !== targetDigit) {
        const action = this.getDigitAction(rod, targetDigit);
        if (action) {
          return {
            rodIndex: i,
            type: action.type,
            index: action.index,
            dir: action.dir
          };
        }
      }
    }

    return null;
  }

  showGuidance(challenge, withHand = true) {
    if (!challenge) return;
    const action = this.getRecommendedAction(challenge);

    if (!action) {
      this.soroban.hideGhostHand();
      this.soroban.clearHighlights();
      return;
    }

    this.soroban.highlightKeyBead(action.rodIndex, action.type, action.index);

    if (withHand) {
      setTimeout(() => {
        if (!this.isAdvancing) {
          this.soroban.showGhostHand(action.rodIndex, action.type, action.index, action.dir);
        }
      }, 60);
    }
  }

  speakCurrentInstruction(onEnd = null) {
    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;
    const challenge = level.challenges[this.currentChallengeIndex];
    if (!challenge) return;

    this.clearIdleTimer();
    this.isSpeakingPrompt = true;

    window.soundEngine.playVoiceKey(challenge.audioKey, () => {
      this.isSpeakingPrompt = false;
      this.resetIdleTimer();
      if (onEnd) onEnd();
    }, challenge.text);
  }

  setSpeech(text) {
    if (this.speechText) this.speechText.textContent = text;
  }

  clearIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  resetIdleTimer() {
    this.clearIdleTimer();
    if (this.isAdvancing || this.isSpeakingPrompt) return;

    this.idleTimer = setTimeout(() => {
      this.repeatVoiceOnInaction();
    }, 14000);
  }

  repeatVoiceOnInaction() {
    if (this.isAdvancing || this.isSpeakingPrompt || this.isFreeMode) return;

    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (!level) return;
    const challenge = level.challenges[this.currentChallengeIndex];
    if (!challenge) return;

    if (challenge.isTutorial) {
      this.showGuidance(challenge, true);
    } else if (this.btnHelp) {
      this.btnHelp.classList.add('pulse');
      setTimeout(() => this.btnHelp.classList.remove('pulse'), 1500);
    }

    this.speakCurrentInstruction();
  }

  // Éxito: celebración y avance seguro garantizado
  handleSuccess(challenge) {
    if (this.isAdvancing) return;
    this.isAdvancing = true;

    this.clearIdleTimer();
    this.clearHintTimer();
    this.soroban.hideGhostHand();
    this.soroban.clearHighlights();

    // Actualizar tarjeta lateral con check verde
    if (this.valuePlaqueEl) this.valuePlaqueEl.classList.add('match-celebrate');
    if (this.sideCheckEl) this.sideCheckEl.classList.remove('hidden');

    const level = window.GAME_LEVELS[this.currentLevelIndex];
    const isLevelComplete = this.currentChallengeIndex >= level.challenges.length - 1;

    // Mostrar botón visible de "¡Siguiente!" para que el usuario pueda avanzar inmediatamente
    if (this.btnNextChallenge) {
      this.btnNextChallenge.innerHTML = isLevelComplete ? '<span>¡Nivel listo! ⭐</span>' : '<span>¡Siguiente! ➡️</span>';
      this.btnNextChallenge.classList.remove('hidden');
    }

    this.addStars(1);
    window.soundEngine.playSuccess();
    window.soundEngine.playStar();
    this.mascot.cheer();
    this.confetti.explode();

    const winMsg = challenge.winText || '¡Increíble! ¡Lo hiciste genial! ⭐';
    this.setSpeech(winMsg);
    this.persistCurrentProgress();

    // Avance protegido que solo se ejecuta 1 vez
    let hasAdvanced = false;
    const triggerAdvance = () => {
      if (hasAdvanced) return;
      hasAdvanced = true;
      if (this.autoAdvanceTimer) {
        clearTimeout(this.autoAdvanceTimer);
        this.autoAdvanceTimer = null;
      }
      if (isLevelComplete) {
        this.showLevelCelebration(level);
      } else {
        this.advanceChallenge();
      }
    };

    // Si la voz está desactivada o silenciada, avanzar a los 2.2 segundos
    const isVoiceSilent = !window.soundEngine.voiceEnabled || 
                          window.soundEngine.masterVolume <= 0.01 || 
                          window.soundEngine.voiceVolume <= 0.01;

    if (isVoiceSilent) {
      this.autoAdvanceTimer = setTimeout(triggerAdvance, 2200);
    } else {
      // Temporizador de respaldo generoso (9.5 segundos) solo como red de seguridad por si falla el audio
      this.autoAdvanceTimer = setTimeout(triggerAdvance, 9500);
    }

    // Reproducir voz de triunfo COMPLETA. Cuando Sorobín termine de hablar naturalmente,
    // dar un respiro de 500ms y avanzar fluidamente sin interrupciones.
    window.soundEngine.playVoiceKey(challenge.winAudioKey, () => {
      setTimeout(triggerAdvance, 500);
    }, winMsg);
  }

  advanceChallenge() {
    this.isAdvancing = false;
    this.isSpeakingPrompt = false;
    this.clearIdleTimer();
    this.clearHintTimer();
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    window.soundEngine.stopSpeaking();

    if (this.btnNextChallenge) {
      this.btnNextChallenge.classList.add('hidden');
    }

    const level = window.GAME_LEVELS[this.currentLevelIndex];
    if (this.currentChallengeIndex < level.challenges.length - 1) {
      this.currentChallengeIndex++;
    } else {
      if (!this.completedLevelIds.includes(this.currentLevelIndex)) {
        this.completedLevelIds.push(this.currentLevelIndex);
      }
      this.maxUnlockedLevel = Math.max(this.maxUnlockedLevel, this.currentLevelIndex + 1);
      this.currentLevelIndex = (this.currentLevelIndex + 1) % window.GAME_LEVELS.length;
      this.currentChallengeIndex = 0;
    }

    this.persistCurrentProgress();
    this.startCurrentChallenge();
  }

  persistCurrentProgress() {
    ProgressDB.save({
      levelIndex: this.currentLevelIndex,
      challengeIndex: this.currentChallengeIndex,
      stars: this.stars,
      completedLevelIds: this.completedLevelIds,
      maxUnlockedLevel: this.maxUnlockedLevel,
      lastPlayed: Date.now()
    });
  }

  showLevelCelebration(level) {
    window.soundEngine.stopSpeaking();
    window.soundEngine.playFanfare();
    this.confetti.explodeLots();
    this.celebrationModal.classList.remove('hidden');
    this.mascotModal.cheer();

    document.getElementById('modalTitle').textContent = '¡NIVEL COMPLETADO!';
    document.getElementById('modalMessage').textContent = `¡Has conquistado el ${level.title}! Eres toda una maestra del ábaco.`;
  }

  addStars(count) {
    this.stars += count;
    this.updateStarsUI();

    const box = document.getElementById('starsCounter');
    if (box) {
      box.classList.add('pulse');
      setTimeout(() => box.classList.remove('pulse'), 300);
    }
  }

  updateStarsUI() {
    if (this.starCountEl) this.starCountEl.textContent = this.stars;
  }
}

/**
 * SISTEMA LIGERO DE CONFETI Y ESTRELLAS (CANVAS 2D)
 */
class ConfettiController {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  explode() {
    this.addParticles(45);
    if (!this.animating) this.loop();
  }

  explodeLots() {
    this.addParticles(120);
    if (!this.animating) this.loop();
  }

  addParticles(count) {
    const colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 3;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 10 - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.01
      });
    }
  }

  loop() {
    this.animating = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.animating = false;
    }
  }
}

// Prevenir cualquier rebote de pantalla en móviles FUERA de los modales scrolleables
document.addEventListener('touchmove', (e) => {
  if (
    e.target.closest('#levelsModal') ||
    e.target.closest('.levels-modal-card') ||
    e.target.closest('#settingsModal') ||
    e.target.closest('.settings-modal-card')
  ) {
    return;
  }
  e.preventDefault();
}, { passive: false });

window.addEventListener('DOMContentLoaded', () => {
  window.app = new SorobinGameApp();
});
