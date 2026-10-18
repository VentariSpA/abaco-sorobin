/**
 * MOTOR Y SIMULADOR DEL ÁBACO JAPONÉS CON FÍSICAS DE DESLIZAMIENTO REALES
 *  - Cuentas bicónicas con límites físicos estrictos (las cuentas nunca cruzan la viga central).
 *  - Alineación matemática milimétrica: viga central Hari y puntos Hoshi compartiendo el
 *    mismo eje vertical que los rieles metálicos mediante CSS Grid.
 *  - Arrastre táctil acotado con tope elástico (no permite desbordar la viga ni el marco).
 */

class SorobanEngine {
  constructor(boardElementId, options = {}) {
    this.boardEl = document.getElementById(boardElementId);
    this.ghostHandEl = document.getElementById('ghostHand');
    this.numRods = options.rods || 1;
    this.onChange = options.onChange || null;

    // Estado: { upper: boolean, lowerCount: number (0-4) }
    this.rods = [];
    for (let i = 0; i < this.numRods; i++) {
      this.rods.push({ upper: false, lowerCount: 0 });
    }

    this.dragging = null;
    this.render();
  }

  setRodsCount(count, silent = false) {
    this.numRods = count;
    this.rods = [];
    for (let i = 0; i < this.numRods; i++) {
      this.rods.push({ upper: false, lowerCount: 0 });
    }
    this.render();
    if (!silent && this.onChange) this.onChange(this.getTotalValue());
  }

  getTotalValue() {
    let total = 0;
    for (let i = 0; i < this.numRods; i++) {
      const rod = this.rods[i];
      const rodValue = (rod.upper ? 5 : 0) + rod.lowerCount;
      const power = this.numRods - 1 - i;
      total += rodValue * Math.pow(10, power);
    }
    return total;
  }

  getActiveRodValue(rodIndex = 0) {
    if (!this.rods[rodIndex]) return 0;
    return (this.rods[rodIndex].upper ? 5 : 0) + this.rods[rodIndex].lowerCount;
  }

  setValue(number, silent = false) {
    if (this.numRods === 1) {
      this.rods[0].upper = number >= 5;
      this.rods[0].lowerCount = number % 5;
    } else {
      const str = number.toString().padStart(this.numRods, '0');
      for (let i = 0; i < this.numRods; i++) {
        const digit = parseInt(str[i], 10) || 0;
        this.rods[i].upper = digit >= 5;
        this.rods[i].lowerCount = digit % 5;
      }
    }
    this.updateBeadClasses();
    this.hideGhostHand();
    if (!silent && this.onChange) this.onChange(this.getTotalValue());
  }

  clear(silent = false) {
    for (let i = 0; i < this.numRods; i++) {
      this.rods[i].upper = false;
      this.rods[i].lowerCount = 0;
    }
    this.updateBeadClasses();
    this.hideGhostHand();
    if (!silent && window.soundEngine) window.soundEngine.playBeadClick(false);
    if (!silent && this.onChange) this.onChange(this.getTotalValue());
  }

  // --- FÍSICAS DE DESLIZAMIENTO FLUIDAS Y SIN SALTOS ---

  setupBeadDrag(element, rodIndex, type, beadIndex = 0) {
    element.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      try {
        element.setPointerCapture(e.pointerId);
      } catch (_) {}

      this.dragging = {
        rod: rodIndex,
        type: type,
        index: beadIndex,
        startY: e.clientY,
        hasMoved: false,
        element: element,
        clampedY: 0
      };
    });

    element.addEventListener('pointermove', (e) => {
      if (!this.dragging || this.dragging.element !== element) return;
      const deltaY = e.clientY - this.dragging.startY;

      if (Math.abs(deltaY) > 5) {
        this.dragging.hasMoved = true;
      }

      if (this.dragging.type === 'upper') {
        const isCurrentlyActive = this.rods[rodIndex].upper;
        let clamped = 0;
        if (!isCurrentlyActive) {
          // Inactiva arriba (top: 4px): solo baja hacia la viga (máx 41px)
          clamped = Math.max(0, Math.min(41, deltaY));
        } else {
          // Activa en la viga (top: 45px): solo sube hacia el marco superior (máx -41px)
          clamped = Math.max(-41, Math.min(0, deltaY));
        }
        this.dragging.clampedY = clamped;
        element.style.transform = `translateX(-50%) translateY(${clamped}px)`;
      } else {
        const curCount = this.rods[rodIndex].lowerCount;
        const isBeadActive = beadIndex < curCount;
        let clamped = 0;

        if (!isBeadActive) {
          // Inactiva: el usuario la empuja hacia arriba hacia la viga (máx -52px)
          clamped = Math.max(-52, Math.min(0, deltaY));
          this.dragging.clampedY = clamped;

          // Mover en tándem todas las bolitas intermedias hacia la viga (curCount .. beadIndex)
          for (let b = curCount; b <= beadIndex; b++) {
            const sibling = document.getElementById(`bead-lower-${rodIndex}-${b}`);
            if (sibling) sibling.style.transform = `translateX(-50%) translateY(${clamped}px)`;
          }
        } else {
          // Activa: el usuario la baja alejándola de la viga (máx +52px)
          clamped = Math.max(0, Math.min(52, deltaY));
          this.dragging.clampedY = clamped;

          // Mover en tándem todas las bolitas activas que bajan con ella (beadIndex .. curCount - 1)
          for (let b = beadIndex; b < curCount; b++) {
            const sibling = document.getElementById(`bead-lower-${rodIndex}-${b}`);
            if (sibling) sibling.style.transform = `translateX(-50%) translateY(${clamped}px)`;
          }
        }
      }
    });

    const finishDrag = (e) => {
      if (!this.dragging || this.dragging.element !== element) return;
      try {
        element.releasePointerCapture(e.pointerId);
      } catch (_) {}

      const deltaY = e.clientY - this.dragging.startY;
      const dragInfo = this.dragging;
      this.dragging = null;

      // 1. TOQUE SIMPLE (TAP)
      if (!dragInfo.hasMoved || Math.abs(deltaY) < 6) {
        // Limpiar transforms residuales de inmediato
        element.style.transform = '';
        if (dragInfo.type === 'upper') {
          this.toggleUpperBead(dragInfo.rod);
        } else {
          this.tapLowerBead(dragInfo.rod, dragInfo.index);
        }
        return;
      }

      // 2. DESLIZAMIENTO CON EL DEDO (DRAG)
      // Usar FLIP (First-Last-Invert-Play) para que la bolita se quede donde se soltó
      // sin saltar hacia atrás ni repetir la animación.
      if (dragInfo.type === 'upper') {
        const wasActive = this.rods[rodIndex].upper;
        let becomeActive = wasActive;
        if (!wasActive) {
          becomeActive = dragInfo.clampedY >= 18;
        } else {
          becomeActive = dragInfo.clampedY > -18;
        }

        const currentVisualTop = (wasActive ? 45 : 4) + dragInfo.clampedY;
        const targetTop = becomeActive ? 45 : 4;
        const offset = currentVisualTop - targetTop;

        element.style.transition = 'none';
        this.setUpperBeadState(rodIndex, becomeActive);
        element.style.transform = `translateX(-50%) translateY(${offset}px)`;
        void element.offsetHeight; // Forzar reflow

        if (Math.abs(offset) < 2) {
          element.style.transition = '';
          element.style.transform = '';
        } else {
          element.style.transition = 'transform 0.12s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
          element.style.transform = 'translateX(-50%) translateY(0px)';
          setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
          }, 130);
        }
      } else {
        const curCount = this.rods[rodIndex].lowerCount;
        const isBeadActive = beadIndex < curCount;
        let newCount = curCount;
        const affected = [];

        if (!isBeadActive) {
          for (let b = curCount; b <= beadIndex; b++) {
            const el = document.getElementById(`bead-lower-${rodIndex}-${b}`);
            if (el) affected.push({ index: b, el });
          }
          if (dragInfo.clampedY <= -18) {
            newCount = beadIndex + 1;
          }
        } else {
          for (let b = beadIndex; b < curCount; b++) {
            const el = document.getElementById(`bead-lower-${rodIndex}-${b}`);
            if (el) affected.push({ index: b, el });
          }
          if (dragInfo.clampedY >= 18) {
            newCount = beadIndex;
          }
        }

        affected.forEach(item => {
          const b = item.index;
          const wasActive = b < curCount;
          const willBeActive = b < newCount;
          const restingOld = wasActive ? (3 + b * 34) : (55 + b * 34);
          const visualTop = restingOld + dragInfo.clampedY;
          const restingNew = willBeActive ? (3 + b * 34) : (55 + b * 34);
          item.offset = visualTop - restingNew;
          item.el.style.transition = 'none';
        });

        this.setLowerBeadState(rodIndex, newCount);

        affected.forEach(item => {
          item.el.style.transform = `translateX(-50%) translateY(${item.offset}px)`;
          void item.el.offsetHeight;
        });

        affected.forEach(item => {
          if (Math.abs(item.offset) < 2) {
            item.el.style.transition = '';
            item.el.style.transform = '';
          } else {
            item.el.style.transition = 'transform 0.12s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            item.el.style.transform = 'translateX(-50%) translateY(0px)';
            setTimeout(() => {
              item.el.style.transition = '';
              item.el.style.transform = '';
            }, 130);
          }
        });
      }
    };

    element.addEventListener('pointerup', finishDrag);
    element.addEventListener('pointercancel', finishDrag);
  }

  setUpperBeadState(rodIndex, active) {
    if (this.rods[rodIndex].upper !== active) {
      this.rods[rodIndex].upper = active;
      this.updateBeadClasses();
      if (window.soundEngine) window.soundEngine.playBeadClick(true);
      if (this.onChange) this.onChange(this.getTotalValue());
    }
  }

  toggleUpperBead(rodIndex) {
    this.setUpperBeadState(rodIndex, !this.rods[rodIndex].upper);
  }

  setLowerBeadState(rodIndex, count) {
    const clamped = Math.max(0, Math.min(4, count));
    if (this.rods[rodIndex].lowerCount !== clamped) {
      this.rods[rodIndex].lowerCount = clamped;
      this.updateBeadClasses();
      if (window.soundEngine) window.soundEngine.playBeadClick(false);
      if (this.onChange) this.onChange(this.getTotalValue());
    }
  }

  tapLowerBead(rodIndex, beadIndex) {
    const curCount = this.rods[rodIndex].lowerCount;
    if (beadIndex < curCount) {
      this.setLowerBeadState(rodIndex, beadIndex);
    } else {
      this.setLowerBeadState(rodIndex, beadIndex + 1);
    }
  }

  updateBeadClasses() {
    for (let r = 0; r < this.numRods; r++) {
      const rodState = this.rods[r];

      const upperEl = document.getElementById(`bead-upper-${r}`);
      if (upperEl) {
        if (rodState.upper) upperEl.classList.add('active');
        else upperEl.classList.remove('active');
      }

      for (let b = 0; b < 4; b++) {
        const lowerEl = document.getElementById(`bead-lower-${r}-${b}`);
        if (lowerEl) {
          if (b < rodState.lowerCount) lowerEl.classList.add('active');
          else lowerEl.classList.remove('active');
        }
      }
    }
  }

  highlightKeyBead(rodIndex, type, index = 0) {
    this.clearHighlights();
    const targetId = type === 'upper' ? `bead-upper-${rodIndex}` : `bead-lower-${rodIndex}-${index}`;
    const beadEl = document.getElementById(targetId);
    if (beadEl) {
      beadEl.classList.add('hint-glow');
    }
  }

  showGhostHand(rodIndex, type, index = 0, direction = 'up') {
    if (!this.ghostHandEl) return;
    this.clearHighlights();

    const targetId = type === 'upper' ? `bead-upper-${rodIndex}` : `bead-lower-${rodIndex}-${index}`;
    const beadEl = document.getElementById(targetId);
    if (!beadEl) return;

    beadEl.classList.add('hint-glow');

    const frame = this.boardEl.closest('.soroban-frame') || this.boardEl.parentElement;
    const frameRect = frame.getBoundingClientRect();
    const beadRect = beadEl.getBoundingClientRect();

    if (frameRect.width === 0 || beadRect.width === 0) {
      setTimeout(() => this.showGhostHand(rodIndex, type, index, direction), 100);
      return;
    }

    const scale = frameRect.width / (frame.offsetWidth || 1);
    const top = ((beadRect.top - frameRect.top) / scale) + (beadEl.offsetHeight / 2) - 20;
    const left = ((beadRect.left - frameRect.left) / scale) + (beadEl.offsetWidth / 2) - 20;

    this.ghostHandEl.style.top = `${top}px`;
    this.ghostHandEl.style.left = `${left}px`;
    this.ghostHandEl.className = `ghost-hand swipe-${direction}`;
    this.ghostHandEl.classList.remove('hidden');
  }

  hideGhostHand() {
    if (this.ghostHandEl) {
      this.ghostHandEl.classList.add('hidden');
    }
    this.clearHighlights();
  }

  clearHighlights() {
    const all = this.boardEl.querySelectorAll('.soroban-bead');
    all.forEach(b => b.classList.remove('hint-glow'));
  }

  render() {
    if (!this.boardEl) return;
    this.boardEl.innerHTML = '';

    const frame = this.boardEl.closest('.soroban-frame');
    if (frame) {
      frame.classList.remove('rods-1', 'rods-2', 'rods-3', 'rods-4');
      frame.classList.add(`rods-${this.numRods}`);
      frame.style.setProperty('--num-rods', this.numRods);

      let header = frame.querySelector('.soroban-col-headers');
      if (!header) {
        header = document.createElement('div');
        header.className = 'soroban-col-headers';
        frame.insertBefore(header, this.boardEl);
      }
      header.innerHTML = '';
      header.style.setProperty('--num-rods', this.numRods);

      const labelMaps = {
        1: [{ name: 'U', sub: '1', cls: 'u' }],
        2: [{ name: 'D', sub: '10', cls: 'd' }, { name: 'U', sub: '1', cls: 'u' }],
        3: [{ name: 'C', sub: '100', cls: 'c' }, { name: 'D', sub: '10', cls: 'd' }, { name: 'U', sub: '1', cls: 'u' }],
        4: [{ name: 'UM', sub: '1000', cls: 'um' }, { name: 'C', sub: '100', cls: 'c' }, { name: 'D', sub: '10', cls: 'd' }, { name: 'U', sub: '1', cls: 'u' }]
      };

      const labels = labelMaps[this.numRods] || labelMaps[1];
      labels.forEach(item => {
        const tag = document.createElement('div');
        tag.className = `col-header-tag tag-${item.cls}`;
        tag.title = 'Toca para escuchar el valor de esta columna';
        tag.innerHTML = `<span class="col-name">${item.name}</span><span class="col-sub">${item.sub}</span>`;
        tag.addEventListener('click', () => {
          if (this.onColTagClick) this.onColTagClick(item.cls);
        });
        header.appendChild(tag);
      });
    }

    this.boardEl.style.setProperty('--num-rods', this.numRods);

    // Barra divisoria horizontal continua (Hari) que cruza exactamente de borde a borde
    const beam = document.createElement('div');
    beam.className = 'soroban-beam';
    this.boardEl.appendChild(beam);

    // Renderizar las varillas individuales sobre el Grid
    for (let r = 0; r < this.numRods; r++) {
      const rodEl = document.createElement('div');
      rodEl.className = 'soroban-rod';
      rodEl.dataset.rod = r;

      // 1. Cubierta superior (Deck del 5: top 0 a 80px)
      const upperDeck = document.createElement('div');
      upperDeck.className = 'rod-upper-deck';

      const upperBead = document.createElement('div');
      upperBead.id = `bead-upper-${r}`;
      upperBead.className = `soroban-bead upper ${this.rods[r].upper ? 'active' : ''}`;
      upperBead.title = 'Cuenta superior (Vale 5)';
      this.setupBeadDrag(upperBead, r, 'upper', 0);
      upperDeck.appendChild(upperBead);

      // 2. Punto Hoshi sobre la viga:
      // Insertado en .soroban-rod con left: 50% y top: 88px (centro exacto de la viga)
      // Garantiza alineación 100% matemática con el riel vertical de la varilla
      const beamDot = document.createElement('div');
      beamDot.className = 'rod-beam-dot';
      rodEl.appendChild(beamDot);

      // 3. Cubierta inferior (Deck de los 1s: top 96px a 290px)
      const lowerDeck = document.createElement('div');
      lowerDeck.className = 'rod-lower-deck';

      for (let b = 0; b < 4; b++) {
        const lowerBead = document.createElement('div');
        lowerBead.id = `bead-lower-${r}-${b}`;
        const isActive = b < this.rods[r].lowerCount;
        lowerBead.className = `soroban-bead lower-${b} ${isActive ? 'active' : ''}`;
        lowerBead.title = `Cuenta inferior ${b + 1} (Vale 1)`;
        this.setupBeadDrag(lowerBead, r, 'lower', b);
        lowerDeck.appendChild(lowerBead);
      }

      rodEl.appendChild(upperDeck);
      rodEl.appendChild(lowerDeck);
      this.boardEl.appendChild(rodEl);
    }
  }
}

window.SorobanEngine = SorobanEngine;
