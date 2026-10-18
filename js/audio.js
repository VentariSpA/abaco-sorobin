/**
 * GESTOR DE AUDIO PROFESIONAL Y VOZ NEURAL HUMANA
 *  - Control de volumen maestro, voz y efectos de sonido (SFX).
 *  - Clic de ábaco mejorado con impacto acústico de madera noble (umbral elevado y nítido).
 *  - Persistencia de configuración en localStorage.
 *  - Cero bloqueos: temporizadores de seguridad para garantizar callbacks onComplete.
 */

class AudioManager {
  static STORAGE_KEY = 'sorobin_audio_settings_v2';

  constructor() {
    this.audioCtx = null;
    
    // Cargar configuración guardada o usar valores por defecto
    const saved = this.loadSettings();
    this.masterVolume = saved?.masterVolume !== undefined ? saved.masterVolume : 1.0;
    this.voiceVolume = saved?.voiceVolume !== undefined ? saved.voiceVolume : 1.0;
    this.sfxVolume = saved?.sfxVolume !== undefined ? saved.sfxVolume : 1.0;
    this.voiceEnabled = saved?.voiceEnabled !== undefined ? saved.voiceEnabled : true;
    this.sfxEnabled = saved?.sfxEnabled !== undefined ? saved.sfxEnabled : true;

    this.currentPlayback = null;
    this.currentChainPlayback = null;
    this.isSpeaking = false;
    this.speechListeners = [];
    this.clips = {};
    this.bufferCache = {};

    this.preloadClips();
  }

  saveSettings() {
    try {
      localStorage.setItem(AudioManager.STORAGE_KEY, JSON.stringify({
        masterVolume: this.masterVolume,
        voiceVolume: this.voiceVolume,
        sfxVolume: this.sfxVolume,
        voiceEnabled: this.voiceEnabled,
        sfxEnabled: this.sfxEnabled
      }));
    } catch (e) {
      console.warn('Error guardando configuración de audio:', e);
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(AudioManager.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.currentPlayback && this.currentPlayback.audio) {
      this.currentPlayback.audio.volume = this.masterVolume * this.voiceVolume;
    }
    this.saveSettings();
  }

  setVoiceVolume(val) {
    this.voiceVolume = Math.max(0, Math.min(1, val));
    if (this.currentPlayback && this.currentPlayback.audio) {
      this.currentPlayback.audio.volume = this.masterVolume * this.voiceVolume;
    }
    this.saveSettings();
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = Boolean(enabled);
    if (!this.voiceEnabled) {
      this.stopSpeaking();
    }
    this.saveSettings();
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = Boolean(enabled);
    this.saveSettings();
  }

  addSpeechListener(onStart, onEnd) {
    this.speechListeners.push({ start: onStart, end: onEnd });
  }

  notifySpeechStart() {
    this.isSpeaking = true;
    this.speechListeners.forEach(l => { if (l.start) l.start(); });
  }

  notifySpeechEnd() {
    this.isSpeaking = false;
    this.speechListeners.forEach(l => { if (l.end) l.end(); });
  }

  preloadClips() {
    const clipKeys = [
      'l0_c1_prompt', 'l0_c1_win', 'l0_c2_prompt', 'l0_c2_win', 'l0_c3_prompt', 'l0_c3_win',
      'l1_c1_prompt', 'l1_c1_win', 'l1_c2_prompt', 'l1_c2_win', 'l1_c3_prompt', 'l1_c3_win', 'l1_c4_prompt', 'l1_c4_win',
      'l2_c1_prompt', 'l2_c1_win', 'l2_c2_prompt', 'l2_c2_win', 'l2_c3_prompt', 'l2_c3_win',
      'l3_c1_prompt', 'l3_c1_win', 'l3_c2_prompt', 'l3_c2_win', 'l3_c3_prompt', 'l3_c3_win', 'l3_c4_prompt', 'l3_c4_win',
      'l4_c1_prompt', 'l4_c1_win', 'l4_c2_prompt', 'l4_c2_win', 'l4_c3_prompt', 'l4_c3_win',
      'l5_c1_prompt', 'l5_c1_win', 'l5_c2_prompt', 'l5_c2_win', 'l5_c3_prompt', 'l5_c3_win',
      'l6_c1_prompt', 'l6_c1_win', 'l6_c2_prompt', 'l6_c2_win', 'l6_c3_prompt', 'l6_c3_win',
      'l7_c1_prompt', 'l7_c1_win', 'l7_c2_prompt', 'l7_c2_win', 'l7_c3_prompt', 'l7_c3_win', 'l7_c4_prompt', 'l7_c4_win',
      'l8_c1_prompt', 'l8_c1_win', 'l8_c2_prompt', 'l8_c2_win',
      'l9_c1_prompt', 'l9_c1_win', 'l9_c2_prompt', 'l9_c2_win', 'l9_c3_prompt', 'l9_c3_win',
      'l10_c1_prompt', 'l10_c1_win', 'l10_c2_prompt', 'l10_c2_win', 'l10_c3_prompt', 'l10_c3_win',
      'l0_intro', 'reminder_idle', 'reminder_try', 'hint_more', 'hint_less',
      'rods_1', 'rods_2', 'rods_3', 'rods_4',
      'pos_u', 'pos_d', 'pos_c', 'pos_um',
      'num_0', 'num_1', 'num_2', 'num_3', 'num_4', 'num_5', 'num_6', 'num_7', 'num_8', 'num_9', 'num_10'
    ];

    clipKeys.forEach(key => {
      const audio = new Audio(`audio/tts/${key}.mp3`);
      audio.preload = 'auto';
      this.clips[key] = audio;
    });
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Reproduce un clip de voz pre-cargado de forma segura y sin carreras
  playVoiceKey(key, onComplete = null, fallbackText = null) {
    if (!this.voiceEnabled || this.masterVolume <= 0.01 || this.voiceVolume <= 0.01) {
      if (onComplete) onComplete();
      return;
    }

    this.stopSpeaking();
    this.initAudioContext();

    let audio = this.clips[key];
    if (!audio) {
      audio = new Audio(`audio/tts/${key}.mp3`);
      this.clips[key] = audio;
    }

    const effectiveVolume = Math.max(0, Math.min(1, this.masterVolume * this.voiceVolume));
    try {
      audio.volume = effectiveVolume;
      audio.currentTime = 0;
    } catch (e) {}

    const playback = {
      key: key,
      audio: audio,
      cancelled: false,
      onComplete: onComplete
    };
    this.currentPlayback = playback;

    this.notifySpeechStart();

    // Temporizador de seguridad generoso: nunca cortar una instrucción larga
    // Las instrucciones completas pueden durar entre 6 y 10 segundos.
    const initialTimeout = Math.max(14000, audio.duration ? Math.ceil(audio.duration * 1000 + 3500) : 14000);
    let safetyTimer = setTimeout(() => {
      if (!playback.cancelled && this.currentPlayback === playback) {
        finish(true);
      }
    }, initialTimeout);

    audio.onloadedmetadata = () => {
      if (!playback.cancelled && audio.duration) {
        clearTimeout(safetyTimer);
        const dynamicTimeout = Math.max(12000, Math.ceil(audio.duration * 1000 + 3500));
        safetyTimer = setTimeout(() => {
          if (!playback.cancelled && this.currentPlayback === playback) {
            finish(true);
          }
        }, dynamicTimeout);
      }
    };

    const finish = (natural) => {
      if (playback.cancelled) return;
      playback.cancelled = true;
      clearTimeout(safetyTimer);
      audio.onended = null;
      audio.onerror = null;
      audio.onloadedmetadata = null;

      if (this.currentPlayback === playback) {
        this.currentPlayback = null;
        this.notifySpeechEnd();
      }

      if (natural && playback.onComplete) {
        const cb = playback.onComplete;
        playback.onComplete = null;
        cb();
      }
    };

    audio.onended = () => finish(true);
    audio.onerror = (e) => {
      console.warn(`Audio error en ${key}:`, e);
      finish(false);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (playback.cancelled || e.name === 'AbortError') {
          return;
        }
        console.warn(`Audio play catch en ${key}:`, e);
        finish(false);
      });
    }
  }

  // Descompone cualquier número (0 al 9999) en sus fragmentos gramaticales correctos en español
  getNumberAudioKeys(n) {
    n = Math.floor(Math.abs(n));
    if (n <= 99) {
      return [`num_${n}`];
    }
    if (n < 1000) {
      if (n % 100 === 0) {
        return [`num_${n}`];
      }
      const h = Math.floor(n / 100) * 100;
      const rem = n % 100;
      const prefix = h === 100 ? 'word_ciento' : `num_${h}`;
      return [prefix, ...this.getNumberAudioKeys(rem)];
    }
    if (n <= 9999) {
      const th = Math.floor(n / 1000) * 1000;
      const rem = n % 1000;
      if (rem === 0) {
        return [`num_${th}`];
      }
      return [`num_${th}`, ...this.getNumberAudioKeys(rem)];
    }
    return [`num_${n}`];
  }

  // Carga y decodifica un archivo de audio como AudioBuffer en memoria
  async loadAudioBuffer(key) {
    if (this.bufferCache[key]) return this.bufferCache[key];
    this.initAudioContext();
    if (!this.audioCtx) return null;
    try {
      const res = await fetch(`audio/tts/${key}.mp3`);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      const audioBuf = await this.audioCtx.decodeAudioData(arrayBuf);
      this.bufferCache[key] = audioBuf;
      return audioBuf;
    } catch (e) {
      console.warn('Error decodificando audio buffer:', key, e);
      return null;
    }
  }

  // Detecta el rango de voz real recortando los silencios al inicio y al final
  getTrimmedRange(buffer) {
    const data = buffer.getChannelData(0);
    const threshold = 0.02;
    let start = 0;
    while (start < data.length && Math.abs(data[start]) < threshold) {
      start++;
    }
    let end = data.length - 1;
    while (end > start && Math.abs(data[end]) < threshold) {
      end--;
    }
    const sampleRate = buffer.sampleRate;
    const margin = Math.floor(sampleRate * 0.015);
    const startTime = Math.max(0, start - margin) / sampleRate;
    const endTime = Math.min(buffer.duration, (end + margin) / sampleRate);
    const duration = Math.max(0.08, endTime - startTime);
    return { startTime, duration };
  }

  // Reproduce números de forma continua, rápida y 100% natural sin silencios ni pausas entrecortadas
  async playNumber(val, onComplete = null) {
    if (!this.voiceEnabled || this.masterVolume <= 0.01 || this.voiceVolume <= 0.01) {
      if (onComplete) onComplete();
      return;
    }

    this.playNumberSeq = (this.playNumberSeq || 0) + 1;
    const currentSeq = this.playNumberSeq;

    const keys = this.getNumberAudioKeys(val);
    if (!keys || keys.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    // Empalme con Web Audio API y recorte de silencios para pronunciación en un solo respiro continuo
    // Todas las pronunciaciones (individuales o compuestas) pasan por el mismo motor con ganancia ecualizada
    this.stopSpeaking();
    this.initAudioContext();

    if (!this.audioCtx) {
      this.playVoiceKey(keys[0], onComplete);
      return;
    }

    const buffers = await Promise.all(keys.map(k => this.loadAudioBuffer(k)));
    if (this.playNumberSeq !== currentSeq) {
      // Se solicitó otro número más reciente mientras cargaban los buffers, cancelar
      return;
    }

    if (!buffers.every(b => b)) {
      this.playVoiceKey(keys[0], onComplete);
      return;
    }

    // Calibración de volumen: compensa la curva lineal de Web Audio API para que suene
    // con la misma fuerza, presencia y claridad que los clips individuales
    const userVolume = Math.max(0, Math.min(1, this.masterVolume * this.voiceVolume));
    const boostedVolume = Math.min(1.8, userVolume * 1.55);

    const now = this.audioCtx.currentTime + 0.03;
    let currentStartTime = now;
    const sources = [];

    // Compresor dinámico para sonido nítido, con cuerpo y sin distorsión
    const compressor = this.audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(24, now);
    compressor.ratio.setValueAtTime(8, now);
    compressor.attack.setValueAtTime(0.005, now);
    compressor.release.setValueAtTime(0.2, now);
    compressor.connect(this.audioCtx.destination);

    const playback = {
      cancelled: false,
      sources: sources,
      onComplete: onComplete
    };
    this.currentChainPlayback = playback;
    this.notifySpeechStart();

    buffers.forEach((buf) => {
      const { startTime, duration } = this.getTrimmedRange(buf);
      const src = this.audioCtx.createBufferSource();
      const gain = this.audioCtx.createGain();

      src.buffer = buf;
      gain.gain.setValueAtTime(boostedVolume, currentStartTime);

      src.connect(gain);
      gain.connect(compressor);

      src.start(currentStartTime, startTime, duration);
      sources.push(src);

      // Empalma inmediatamente la siguiente palabra con 30ms de solapamiento natural
      currentStartTime += Math.max(0.06, duration - 0.03);
    });

    const totalDuration = currentStartTime - now;
    const timeoutMs = Math.ceil(totalDuration * 1000) + 70;

    setTimeout(() => {
      if (this.currentChainPlayback === playback && !playback.cancelled) {
        this.currentChainPlayback = null;
        this.notifySpeechEnd();
        if (onComplete) onComplete();
      }
    }, timeoutMs);
  }

  speakFallback(text, onComplete = null) {
    if (onComplete) onComplete();
  }

  stopSpeaking() {
    if (this._activeUtterance) {
      this._activeUtterance = null;
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    }
    if (this.currentChainPlayback) {
      const cp = this.currentChainPlayback;
      cp.cancelled = true;
      cp.sources.forEach(src => {
        try { src.stop(); } catch (_) {}
      });
      this.currentChainPlayback = null;
    }
    if (this.currentPlayback) {
      const p = this.currentPlayback;
      p.cancelled = true;
      p.onComplete = null;
      if (p.audio) {
        p.audio.onended = null;
        p.audio.onerror = null;
        p.audio.onloadedmetadata = null;
        try {
          p.audio.pause();
          p.audio.currentTime = 0;
        } catch (e) {}
      }
      this.currentPlayback = null;
    }
    this.notifySpeechEnd();
  }

  // --- EFECTOS DE SONIDO SINTETIZADOS CON ALTA CONTUNDENCIA (WEB AUDIO API) ---

  /**
   * Clic realista de ábaco japonés con madera resonante y umbral aumentado.
   * Choca con ataque nítido y cuerpo de madera hueca.
   */
  playBeadClick(isUpper = false) {
    if (!this.sfxEnabled || this.masterVolume <= 0.01 || this.sfxVolume <= 0.01) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const volumeFactor = this.masterVolume * this.sfxVolume;

    try {
      // 1. Ruido transitorio de impacto inicial (chasquido seco de madera dura)
      const bufferSize = Math.floor(ctx.sampleRate * 0.012); // 12ms
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.0025));
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(isUpper ? 3400 : 2800, now);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.65 * volumeFactor, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start(now);

      // 2. Resonador de cuerpo de madera bicónica (Tono principal y cálido)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = isUpper ? 560 : 440;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.055);

      // Umbral de volumen aumentado a 0.88 para que sea bien audible y contundente en altavoces de móvil
      gain.gain.setValueAtTime(0.88 * volumeFactor, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.065);
    } catch (e) {
      console.warn('Error sintetizando clic del ábaco:', e);
    }
  }

  playSuccess() {
    if (!this.sfxEnabled || this.masterVolume <= 0.01 || this.sfxVolume <= 0.01) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const volume = this.masterVolume * this.sfxVolume;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.16, 'sine', 0.28 * volume);
      }, idx * 65);
    });
  }

  playStar() {
    if (!this.sfxEnabled || this.masterVolume <= 0.01 || this.sfxVolume <= 0.01) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const volume = this.masterVolume * this.sfxVolume;
    this.playTone(880, 0.12, 'triangle', 0.3 * volume);
    setTimeout(() => {
      this.playTone(1318.51, 0.24, 'triangle', 0.32 * volume);
    }, 60);
  }

  playGentleOops() {
    if (!this.sfxEnabled || this.masterVolume <= 0.01 || this.sfxVolume <= 0.01) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const volume = this.masterVolume * this.sfxVolume;
    this.playTone(300, 0.18, 'sine', 0.2 * volume);
    setTimeout(() => {
      this.playTone(250, 0.22, 'sine', 0.18 * volume);
    }, 110);
  }

  playFanfare() {
    if (!this.sfxEnabled || this.masterVolume <= 0.01 || this.sfxVolume <= 0.01) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const volume = this.masterVolume * this.sfxVolume;
    const sequence = [
      { f: 523.25, d: 110 },
      { f: 659.25, d: 110 },
      { f: 783.99, d: 130 },
      { f: 1046.50, d: 350 }
    ];

    let delay = 0;
    sequence.forEach(item => {
      setTimeout(() => {
        this.playTone(item.f, item.d / 1000, 'sine', 0.32 * volume);
      }, delay);
      delay += item.d + 30;
    });
  }

  playTone(freq, dur, type = 'sine', peakGain = 0.25) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }
}

window.soundEngine = new AudioManager();
