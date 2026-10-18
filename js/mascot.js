/**
 * PERSONAJE ANIMADO "SOROBÍN"
 * Representado en SVG vectorial con animaciones para pestañear,
 * mover la boca al hablar sincronizado con la voz humana neural,
 * celebrar triunfos y reaccionar a niveles bloqueados.
 */

class MascotManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentMood = 'happy';
    this.isSpeaking = false;
    this.blinkTimer = null;
    this.mouthTimer = null;
    this.moodTimer = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
    this.startBlinkingLoop();

    // Sincronizar boca con el gestor de voz de forma segura
    if (window.soundEngine && window.soundEngine.addSpeechListener) {
      window.soundEngine.addSpeechListener(
        () => this.setSpeaking(true),
        () => this.setSpeaking(false)
      );
    }
  }

  setMood(mood) {
    if (mood === 'happy' && this.moodTimer) {
      clearTimeout(this.moodTimer);
      this.moodTimer = null;
    }
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    this.render();
    // Si estaba hablando cuando cambió el ánimo, continuar animando la boca
    if (this.isSpeaking) {
      this.startMouthLoop();
    }
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
    if (speaking) {
      this.startMouthLoop();
    } else {
      this.stopMouthLoop();
    }
  }

  startMouthLoop() {
    this.stopMouthLoop();
    const mouth = this.container?.querySelector('.sorobin-mouth');
    if (!mouth) return;

    let open = false;
    this.mouthTimer = setInterval(() => {
      const m = this.container?.querySelector('.sorobin-mouth');
      if (!m) return;
      open = !open;
      m.setAttribute('d', open ? 'M 54 71 Q 60 82 66 71 Z' : 'M 55 72 Q 60 76 65 72');
      m.setAttribute('fill', open ? '#EF4444' : 'none');
    }, 150);
  }

  stopMouthLoop() {
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = null;
    }
    const mouth = this.container?.querySelector('.sorobin-mouth');
    if (mouth) {
      mouth.setAttribute('d', 'M 55 72 Q 60 76 65 72');
      mouth.setAttribute('fill', 'none');
    }
  }

  startBlinkingLoop() {
    const doBlink = () => {
      const eyeLeft = this.container?.querySelector('.sorobin-eye-l');
      const eyeRight = this.container?.querySelector('.sorobin-eye-r');
      if (eyeLeft && eyeRight) {
        eyeLeft.setAttribute('ry', '1');
        eyeRight.setAttribute('ry', '1');
        setTimeout(() => {
          eyeLeft.setAttribute('ry', '6.5');
          eyeRight.setAttribute('ry', '6.5');
        }, 180);
      }
      this.blinkTimer = setTimeout(doBlink, 2800 + Math.random() * 2000);
    };
    this.blinkTimer = setTimeout(doBlink, 2200);
  }

  cheer() {
    if (this.moodTimer) clearTimeout(this.moodTimer);
    this.setMood('cheer');
    const svg = this.container?.querySelector('svg');
    if (svg) {
      svg.classList.add('bounce-in');
      setTimeout(() => svg.classList.remove('bounce-in'), 700);
    }
    this.moodTimer = setTimeout(() => {
      this.moodTimer = null;
      this.setMood('happy');
    }, 2200);
  }

  surprise() {
    if (this.moodTimer) clearTimeout(this.moodTimer);
    this.setMood('surprise');
    const svg = this.container?.querySelector('svg');
    if (svg) {
      svg.classList.add('shake');
      setTimeout(() => svg.classList.remove('shake'), 450);
    }
    this.moodTimer = setTimeout(() => {
      this.moodTimer = null;
      this.setMood('happy');
    }, 1500);
  }

  render() {
    if (!this.container) return;

    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = null;
    }

    const isCheer = this.currentMood === 'cheer';
    const isSurprise = this.currentMood === 'surprise';

    this.container.innerHTML = `
      <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Pelaje zorro chibi cálido -->
          <linearGradient id="furGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FB923C"/>
            <stop offset="60%" stop-color="#F97316"/>
            <stop offset="100%" stop-color="#EA580C"/>
          </linearGradient>

          <!-- Interior de orejitas acolchadas -->
          <linearGradient id="earInnerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FEF3C7"/>
            <stop offset="100%" stop-color="#FDE68A"/>
          </linearGradient>

          <!-- Cinta Hachimaki japonesa -->
          <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#2563EB"/>
            <stop offset="50%" stop-color="#3B82F6"/>
            <stop offset="100%" stop-color="#1D4ED8"/>
          </linearGradient>

          <!-- Gema dorada de Soroban -->
          <linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="50%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#B45309"/>
          </linearGradient>

          <!-- Hocico suave color crema -->
          <linearGradient id="muzzleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#FFFBEB"/>
          </linearGradient>
        </defs>

        <!-- 1. OREJAS TERNAS DE ZORRITO CHIBI -->
        <!-- Oreja izquierda -->
        <path d="M 28 42 C 20 28 24 10 37 10 C 47 10 51 26 51 38 Z" 
              fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M 31 38 C 27 28 29 16 37 16 C 44 16 46 26 46 36 Z" 
              fill="url(#earInnerGrad)"/>

        <!-- Oreja derecha -->
        <path d="M 92 42 C 100 28 96 10 83 10 C 73 10 69 26 69 38 Z" 
              fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M 89 38 C 93 28 91 16 83 16 C 76 16 74 26 74 36 Z" 
              fill="url(#earInnerGrad)"/>

        <!-- 2. CABEZA CHIBI SUAVE (CON MEJILLITAS MOCHI REDONDITAS) -->
        <path d="M 60 26 
                 C 86 26 98 44 98 66 
                 C 98 84 84 94 60 94 
                 C 36 94 22 84 22 66 
                 C 22 44 34 26 60 26 Z" 
              fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5"/>

        <!-- 3. BRAZOS Y MANITAS KAWAII EN LOS COSTADOS (REFERENCIA EXACTA) -->
        ${isCheer ? `
          <!-- Brazos alzados celebrando con alegría -->
          <path d="M 22 58 C 10 48 12 34 22 38 C 24 39 25 43 25 48" 
                fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="17" cy="37" r="3.8" fill="#FED7AA" stroke="#C2410C" stroke-width="1.3"/>

          <path d="M 98 58 C 110 48 108 34 98 38 C 96 39 95 43 95 48" 
                fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="103" cy="37" r="3.8" fill="#FED7AA" stroke="#C2410C" stroke-width="1.3"/>
        ` : `
          <!-- Bracitos curvados estilo jarra en los costados según imagen de referencia -->
          <path d="M 20 58 C 10 60 10 70 19 74 C 22 74 23 71 23 66 C 23 61 22 58 20 58 Z" 
                fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>

          <path d="M 100 58 C 110 60 110 70 101 74 C 98 74 97 71 97 66 C 97 61 98 58 100 58 Z" 
                fill="url(#furGrad)" stroke="#C2410C" stroke-width="2.5" stroke-linejoin="round"/>
        `}

        <!-- 4. CINTA HACHIMAKI DE MAESTRO DEL ÁBACO -->
        <path d="M 23 44 Q 60 38 97 44" stroke="url(#bandGrad)" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M 24 47 Q 60 41 96 47" stroke="#1E40AF" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
        <!-- Medallón de cuenta de Soroban -->
        <circle cx="60" cy="41" r="6" fill="url(#gemGrad)" stroke="#92400E" stroke-width="1.5"/>
        <circle cx="58.5" cy="39.5" r="1.8" fill="#FFFFFF" opacity="0.8"/>

        <!-- 5. HOCICO CONTINUO SUAVE COLOR MARFIL (SIN CÍRCULOS AISLADOS) -->
        <path d="M 45 66 
                 C 45 57 52 53 60 53 
                 C 68 53 75 57 75 66 
                 C 75 79 68 85 60 85 
                 C 52 85 45 79 45 66 Z" 
              fill="url(#muzzleGrad)" stroke="#FDE68A" stroke-width="1.2"/>

        <!-- 6. SONROJO KAWAII EN LAS MEJILLAS -->
        <ellipse cx="32" cy="71" rx="6.5" ry="4" fill="#FB7185" opacity="0.55"/>
        <path d="M 30 70 L 32 72 M 34 70 L 36 72" stroke="#F43F5E" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>

        <ellipse cx="88" cy="71" rx="6.5" ry="4" fill="#FB7185" opacity="0.55"/>
        <path d="M 84 70 L 86 72 M 88 70 L 90 72" stroke="#F43F5E" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>

        <!-- 7. OJOS GRANDES EXPRESIVOS ANIME CHIBI -->
        <!-- Cejitas simpáticas -->
        <path d="M 41 33 Q 46 30 50 33" stroke="#C2410C" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M 70 33 Q 74 30 79 33" stroke="#C2410C" stroke-width="2.2" stroke-linecap="round" fill="none"/>

        ${isCheer ? `
          <!-- Ojos felices estilo anime de celebración (arcos alegres cerrados) -->
          <path d="M 39 58 Q 46 50 53 58" stroke="#0F172A" stroke-width="3.2" stroke-linecap="round" fill="none"/>
          <path d="M 67 58 Q 74 50 81 58" stroke="#0F172A" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        ` : `
          <!-- Ojo izquierdo -->
          <ellipse class="sorobin-eye-l" cx="46" cy="57" rx="${isSurprise ? '6.5' : '5.5'}" ry="${isSurprise ? '7.5' : '6.5'}" fill="#0F172A"/>
          <circle cx="44.5" cy="54.8" r="2.2" fill="#FFFFFF"/>
          <circle cx="48" cy="59.5" r="1.1" fill="#FFFFFF" opacity="0.85"/>

          <!-- Ojo derecho -->
          <ellipse class="sorobin-eye-r" cx="74" cy="57" rx="${isSurprise ? '6.5' : '5.5'}" ry="${isSurprise ? '7.5' : '6.5'}" fill="#0F172A"/>
          <circle cx="72.5" cy="54.8" r="2.2" fill="#FFFFFF"/>
          <circle cx="76" cy="59.5" r="1.1" fill="#FFFFFF" opacity="0.85"/>
        `}

        <!-- 8. NARICITA DE CHOCOLATE TIERNA -->
        <path d="M 57 64 Q 60 62 63 64 Q 60 68 57 64 Z" fill="#1E293B"/>

        <!-- 9. BOCA SONRIENTE Y PARLANTE -->
        ${isSurprise ? `
          <ellipse cx="60" cy="74" rx="4" ry="5.5" fill="#DC2626" stroke="#991B1B" stroke-width="1.5"/>
        ` : isCheer ? `
          <!-- Gran sonrisa abierta y alegre de celebración -->
          <path d="M 53 71 Q 60 83 67 71 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="1.8" stroke-linejoin="round"/>
        ` : `
          <path class="sorobin-mouth" d="M 55 72 Q 60 76 65 72" fill="none" stroke="#B91C1C" stroke-width="2.2" stroke-linecap="round"/>
        `}

        <!-- 10. PIES / PATITAS DE SOROBÍN EN LA BASE INFERIOR -->
        ${isCheer ? `
          <!-- Patitas alegres celebrando -->
          <ellipse cx="34" cy="91" rx="7.5" ry="5" fill="#EA580C" stroke="#C2410C" stroke-width="1.8" transform="rotate(-10 34 91)"/>
          <circle cx="34" cy="90.5" r="2" fill="#FED7AA"/>
          <ellipse cx="86" cy="91" rx="7.5" ry="5" fill="#EA580C" stroke="#C2410C" stroke-width="1.8" transform="rotate(10 86 91)"/>
          <circle cx="86" cy="90.5" r="2" fill="#FED7AA"/>
        ` : `
          <!-- Patitas asomadas abajo con suaves almohadillas idénticas a la imagen original -->
          <ellipse cx="32" cy="94" rx="10" ry="6" fill="#EA580C" stroke="#C2410C" stroke-width="2" transform="rotate(-5 32 94)"/>
          <circle cx="32" cy="93.5" r="2.8" fill="#FED7AA"/>
          <ellipse cx="88" cy="94" rx="10" ry="6" fill="#EA580C" stroke="#C2410C" stroke-width="2" transform="rotate(5 88 94)"/>
          <circle cx="88" cy="93.5" r="2.8" fill="#FED7AA"/>
        `}
      </svg>
    `;
  }
}

window.MascotManager = MascotManager;
