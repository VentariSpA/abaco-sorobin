/**
 * CURRÍCULO PEDAGÓGICO DE ÁBACO JAPONÉS (MÉTODO SOROBAN INFANTIL AUTÉNTICO)
 * Progresión paso a paso para niños:
 *  1) Conocer la viga (solo valen si tocan el centro). Tutorial guiado en los 2 primeros retos.
 *  2) Bolitas de la Tierra (1 al 4) y limpiar a 0.
 *  3) El Rey 5 de Arriba (El Cielo).
 *  4) La Pinza Mágica (6 al 9: 5 + inferiores).
 *  5) Sumas Directas simples (1+1, 2+2, 5+2).
 *  6) Restas Directas simples (3-1, 4-2, 7-5).
 *  7) Despertar de las Decenas (10, 20, 50).
 *  8) Construir dos cifras (12, 15, 24, 35).
 *  9) Números grandes (68, 99).
 *  10) Las Centenas (100, 250, 999).
 *  11) Los Miles (1,000, 2026, 5,000).
 *
 * Cada reto cuenta con su instrucción y celebración perfectamente sincronizadas con su audio de voz.
 */

window.GAME_LEVELS = [
  // NIVEL 0: EL SECRETO DEL ÁBACO (TUTORIAL GUIADO)
  {
    id: 0,
    title: 'Nivel 0: El Secreto del Ábaco',
    icon: '✨',
    desc: 'Aprende la regla de oro: la viga del centro',
    rods: 1,
    challenges: [
      {
        initial: 0,
        target: 1,
        audioKey: 'l0_c1_prompt',
        winAudioKey: 'l0_c1_win',
        text: '¡Hola! Las bolitas solo tienen valor cuando tocan la viga del centro. Sube una bolita hacia la viga para hacer el uno.',
        winText: '¡Muy bien! ¡Ya activaste tu primera bolita mágica! ⭐',
        isTutorial: true
      },
      {
        initial: 1,
        target: 2,
        audioKey: 'l0_c2_prompt',
        winAudioKey: 'l0_c2_win',
        text: '¡Eso es! Ahora sube otra bolita más para hacer el número dos.',
        winText: '¡Eso es el número dos! ¡Dos bolitas en la viga! ⭐',
        isTutorial: true
      },
      {
        initial: 2,
        target: 3,
        audioKey: 'l0_c3_prompt',
        winAudioKey: 'l0_c3_win',
        text: '¡Ahora inténtalo tú solita! Sube una bolita más para formar el número tres.',
        winText: '¡Fantástico! ¡El tres es pan comido para ti! ⭐',
        isTutorial: false
      }
    ]
  },

  // NIVEL 1: LAS BOLITAS DE LA TIERRA (1 AL 4)
  {
    id: 1,
    title: 'Nivel 1: Cuentas de la Tierra',
    icon: '🌱',
    desc: 'Domina los números del 1 al 4',
    rods: 1,
    challenges: [
      {
        initial: 0,
        target: 1,
        audioKey: 'l1_c1_prompt',
        winAudioKey: 'l1_c1_win',
        text: '¡Pon el número uno! Sube una bolita de abajo hacia la barra.',
        winText: '¡Eso es el número uno! ¡Genial! ⭐'
      },
      {
        initial: 0,
        target: 2,
        audioKey: 'l1_c2_prompt',
        winAudioKey: 'l1_c2_win',
        text: '¡Ahora el número dos! Sube dos bolitas de abajo.',
        winText: '¡Increíble! ¡Dos bolitas en la barra es el número dos! ⭐'
      },
      {
        initial: 0,
        target: 4,
        audioKey: 'l1_c3_prompt',
        winAudioKey: 'l1_c3_win',
        text: '¡El número cuatro! Sube todas las cuatro bolitas de abajo hacia la barra.',
        winText: '¡Bravo! ¡Has puesto el número cuatro! ⭐'
      },
      {
        initial: 4,
        target: 0,
        audioKey: 'l1_c4_prompt',
        winAudioKey: 'l1_c4_win',
        text: '¡Limpia el ábaco! Baja las cuatro bolitas para dejar el ábaco en cero.',
        winText: '¡Excelente! ¡El ábaco quedó limpio en cero! ⭐'
      }
    ]
  },

  // NIVEL 2: EL REY 5 DE ARRIBA (EL CIELO)
  {
    id: 2,
    title: 'Nivel 2: El Rey 5 del Cielo',
    icon: '👑',
    desc: 'La superbolita de arriba que vale cinco',
    rods: 1,
    challenges: [
      {
        initial: 0,
        target: 5,
        audioKey: 'l2_c1_prompt',
        winAudioKey: 'l2_c1_win',
        text: 'La bolita solitaria de arriba es mágica y vale cinco. ¡Bájala hacia la barra con tu dedo índice!',
        winText: '¡Wao! ¡Esa sola bolita vale cinco! ¡Qué poderosa! ⭐'
      },
      {
        initial: 5,
        target: 0,
        audioKey: 'l2_c2_prompt',
        winAudioKey: 'l2_c2_win',
        text: '¡Muy bien! Sube la bolita de arriba para separarla de la barra y dejar el ábaco en cero.',
        winText: '¡Perfecto! ¡Volviste a dejar el ábaco limpio en cero! ⭐'
      },
      {
        initial: 0,
        target: 5,
        audioKey: 'l2_c3_prompt',
        winAudioKey: 'l2_c3_win',
        text: '¡Ahora pon el número cinco tú solita!',
        winText: '¡Sensacional! ¡Pusiste el número cinco tú solita! ⭐'
      }
    ]
  },

  // NIVEL 3: LA PINZA MÁGICA (DEL 6 AL 9)
  {
    id: 3,
    title: 'Nivel 3: La Pinza Mágica (6 al 9)',
    icon: '🦀',
    desc: 'Junta el cinco de arriba con las bolitas de abajo',
    rods: 1,
    challenges: [
      {
        initial: 0,
        target: 6,
        audioKey: 'l3_c1_prompt',
        winAudioKey: 'l3_c1_win',
        text: '¡El número seis! Pon el cinco de arriba y una bolita de abajo. ¡Cinco más uno es seis!',
        winText: '¡Sí! ¡Cinco más uno es seis! ⭐'
      },
      {
        initial: 0,
        target: 7,
        audioKey: 'l3_c2_prompt',
        winAudioKey: 'l3_c2_win',
        text: '¡El número siete! Baja el cinco de arriba y sube dos bolitas de abajo.',
        winText: '¡Súper! ¡Cinco más dos es siete! ⭐'
      },
      {
        initial: 0,
        target: 8,
        audioKey: 'l3_c3_prompt',
        winAudioKey: 'l3_c3_win',
        text: '¡El número ocho! Baja el cinco y sube tres bolitas de abajo.',
        winText: '¡Excelente! ¡Cinco más tres son ocho! ⭐'
      },
      {
        initial: 0,
        target: 9,
        audioKey: 'l3_c4_prompt',
        winAudioKey: 'l3_c4_win',
        text: '¡El número nueve! Junta todas las bolitas en la barra: el cinco de arriba y las cuatro de abajo.',
        winText: '¡Maravilloso! ¡Has dominado todos los números del cero al nueve! ⭐'
      }
    ]
  },

  // NIVEL 4: PRIMERAS SUMAS DIRECTAS
  {
    id: 4,
    title: 'Nivel 4: Sumas Mágicas',
    icon: '➕',
    desc: 'Sumas directas y sencillas en el ábaco',
    rods: 1,
    challenges: [
      {
        initial: 1,
        target: 2,
        audioKey: 'l4_c1_prompt',
        winAudioKey: 'l4_c1_win',
        text: 'Tienes una bolita. Sube una bolita más. ¿Cuánto es uno más uno?',
        winText: '¡Uno más uno son dos! ¡Gran trabajo! ⭐'
      },
      {
        initial: 2,
        target: 4,
        audioKey: 'l4_c2_prompt',
        winAudioKey: 'l4_c2_win',
        text: 'Tienes dos bolitas. Sube dos bolitas más. ¿Cuánto es dos más dos?',
        winText: '¡Dos más dos son cuatro! ¡Eres una genia! ⭐'
      },
      {
        initial: 5,
        target: 7,
        audioKey: 'l4_c3_prompt',
        winAudioKey: 'l4_c3_win',
        text: 'Tienes el cinco arriba. Sube dos bolitas abajo. ¿Cuánto es cinco más dos?',
        winText: '¡Cinco más dos son siete! ¡Qué rápido sumas! ⭐'
      }
    ]
  },

  // NIVEL 5: PRIMERAS RESTAS DIRECTAS
  {
    id: 5,
    title: 'Nivel 5: Restas Mágicas',
    icon: '➖',
    desc: 'Quita bolitas bajándolas o subiendo el cinco',
    rods: 1,
    challenges: [
      {
        initial: 3,
        target: 2,
        audioKey: 'l5_c1_prompt',
        winAudioKey: 'l5_c1_win',
        text: 'Hay tres bolitas en la barra. Quita una bolita bajándola. ¿Cuánto es tres menos uno?',
        winText: '¡Tres menos uno son dos! ¡Lo hiciste perfecto! ⭐'
      },
      {
        initial: 4,
        target: 2,
        audioKey: 'l5_c2_prompt',
        winAudioKey: 'l5_c2_win',
        text: 'Tienes cuatro bolitas en la barra. Quita dos bolitas bajándolas. ¿Cuánto es cuatro menos dos?',
        winText: '¡Cuatro menos dos son dos! ¡Sensacional! ⭐'
      },
      {
        initial: 7,
        target: 2,
        audioKey: 'l5_c3_prompt',
        winAudioKey: 'l5_c3_win',
        text: 'Tienes el siete. Quita la bolita de arriba del cinco. ¿Cuánto queda?',
        winText: '¡Siete menos cinco son dos! ¡Completaste las restas! ⭐'
      }
    ]
  },

  // NIVEL 6: ¡EL DESPERTAR DE LAS DECENAS! (2 COLUMNAS)
  {
    id: 6,
    title: 'Nivel 6: ¡Las Decenas!',
    icon: '🔟',
    desc: 'Descubre la columna de las decenas',
    rods: 2,
    challenges: [
      {
        initial: 0,
        target: 10,
        audioKey: 'l6_c1_prompt',
        winAudioKey: 'l6_c1_win',
        text: '¡Mira! ¡Apareció la columna de las decenas a la izquierda! Sube una bolita en decenas para hacer el diez.',
        winText: '¡Eso es el número diez! ¡Una decena y cero unidades! ⭐'
      },
      {
        initial: 0,
        target: 20,
        audioKey: 'l6_c2_prompt',
        winAudioKey: 'l6_c2_win',
        text: '¡Ahora el número veinte! Sube dos bolitas en la columna de las decenas.',
        winText: '¡Veinte! ¡Dos decenas perfectas! ⭐'
      },
      {
        initial: 0,
        target: 50,
        audioKey: 'l6_c3_prompt',
        winAudioKey: 'l6_c3_win',
        text: '¡El número cincuenta! Baja la superbolita de arriba en las decenas.',
        winText: '¡Cincuenta! ¡Esa superbolita en decenas vale cincuenta! ⭐'
      }
    ]
  },

  // NIVEL 7: DECENAS Y UNIDADES JUNTAS
  {
    id: 7,
    title: 'Nivel 7: Decenas y Unidades',
    icon: '🧩',
    desc: 'Combina ambas columnas para formar números',
    rods: 2,
    challenges: [
      {
        initial: 0,
        target: 12,
        audioKey: 'l7_c1_prompt',
        winAudioKey: 'l7_c1_win',
        text: '¡Hagamos el doce! Pon uno en las decenas y dos en las unidades.',
        winText: '¡El doce! ¡Qué fácil se ve en dos columnas! ⭐'
      },
      {
        initial: 0,
        target: 15,
        audioKey: 'l7_c2_prompt',
        winAudioKey: 'l7_c2_win',
        text: '¡Ahora el quince! Uno en las decenas y baja el cinco en unidades.',
        winText: '¡Quince! ¡Una decena y cinco unidades! ⭐'
      },
      {
        initial: 0,
        target: 24,
        audioKey: 'l7_c3_prompt',
        winAudioKey: 'l7_c3_win',
        text: '¡El número veinticuatro! Dos en las decenas y cuatro en las unidades.',
        winText: '¡Veinticuatro! ¡Eres imparable! ⭐'
      },
      {
        initial: 0,
        target: 35,
        audioKey: 'l7_c4_prompt',
        winAudioKey: 'l7_c4_win',
        text: '¡Treinta y cinco! Tres en las decenas y baja el cinco en unidades.',
        winText: '¡Treinta y cinco! ¡Fantástico! ⭐'
      }
    ]
  },

  // NIVEL 8: NÚMEROS GRANDES DE 2 CIFRAS
  {
    id: 8,
    title: 'Nivel 8: El Rey 99',
    icon: '🚀',
    desc: 'Construye hasta el número noventa y nueve',
    rods: 2,
    challenges: [
      {
        initial: 0,
        target: 68,
        audioKey: 'l8_c1_prompt',
        winAudioKey: 'l8_c1_win',
        text: '¡Sesenta y ocho! Pon seis en las decenas y ocho en unidades.',
        winText: '¡Sesenta y ocho! ¡Ya manejas números grandes! ⭐'
      },
      {
        initial: 0,
        target: 99,
        audioKey: 'l8_c2_prompt',
        winAudioKey: 'l8_c2_win',
        text: '¡El número noventa y nueve! Todas las bolitas de ambas columnas a la barra.',
        winText: '¡Noventa y nueve! ¡El rey de las dos columnas! ⭐'
      }
    ]
  },

  // NIVEL 9: ¡DESPIERTAN LAS CENTENAS! (3 COLUMNAS)
  {
    id: 9,
    title: 'Nivel 9: ¡Las Centenas!',
    icon: '💯',
    desc: 'Descubre la tercera columna hasta el 999',
    rods: 3,
    challenges: [
      {
        initial: 0,
        target: 100,
        audioKey: 'l9_c1_prompt',
        winAudioKey: 'l9_c1_win',
        text: '¡Apareció la tercera columna de las centenas! Sube una bolita en centenas para hacer cien.',
        winText: '¡Cien! ¡Has entrado al club de las centenas! ⭐'
      },
      {
        initial: 0,
        target: 250,
        audioKey: 'l9_c2_prompt',
        winAudioKey: 'l9_c2_win',
        text: '¡Doscientos cincuenta! Dos en centenas y baja el cinco en decenas.',
        winText: '¡Doscientos cincuenta! ¡Qué bien se ve! ⭐'
      },
      {
        initial: 0,
        target: 999,
        audioKey: 'l9_c3_prompt',
        winAudioKey: 'l9_c3_win',
        text: '¡Novecientos noventa y nueve! Activa todas las bolitas de las tres columnas.',
        winText: '¡Novecientos noventa y nueve! ¡Tres columnas dominadas al cien por ciento! ⭐'
      }
    ]
  },

  // NIVEL 10: EL TEMPLO DE LOS MILES (4 COLUMNAS)
  {
    id: 10,
    title: 'Nivel 10: ¡El Templo de los Miles!',
    icon: '🌟',
    desc: '¡El ábaco completo de cuatro columnas!',
    rods: 4,
    challenges: [
      {
        initial: 0,
        target: 1000,
        audioKey: 'l10_c1_prompt',
        winAudioKey: 'l10_c1_win',
        text: '¡El ábaco completo de cuatro columnas! Sube uno en los miles para hacer mil.',
        winText: '¡MIL! ¡Llegaste al número mil! ⭐'
      },
      {
        initial: 0,
        target: 2026,
        audioKey: 'l10_c2_prompt',
        winAudioKey: 'l10_c2_win',
        text: '¡Dos mil veintiséis! Dos en miles, cero en centenas, dos en decenas y seis en unidades.',
        winText: '¡Dos mil veintiséis! ¡Un año épico en el ábaco! ⭐'
      },
      {
        initial: 0,
        target: 5000,
        audioKey: 'l10_c3_prompt',
        winAudioKey: 'l10_c3_win',
        text: '¡Cinco mil! Baja la superbolita de arriba en la columna de los miles.',
        winText: '¡Cinco mil! ¡Eres una gran maestra del Soroban japonés! ⭐'
      }
    ]
  }
];
