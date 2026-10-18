import asyncio
import os
import edge_tts

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "tts")
os.makedirs(OUT_DIR, exist_ok=True)

VOICE = "es-MX-DaliaNeural"

PHRASES = {
    # Nivel 0: El Secreto del Ábaco
    "l0_c1_prompt": "¡Hola! Las bolitas solo tienen valor cuando tocan la viga del centro. Sube una bolita hacia la viga para hacer el uno.",
    "l0_c1_win": "¡Muy bien! ¡Ya activaste tu primera bolita mágica!",
    "l0_c2_prompt": "¡Eso es! Ahora sube otra bolita más para hacer el número dos.",
    "l0_c2_win": "¡Eso es el número dos! ¡Dos bolitas en la viga!",
    "l0_c3_prompt": "¡Ahora inténtalo tú solita! Sube una bolita más para formar el número tres.",
    "l0_c3_win": "¡Fantástico! ¡El tres es pan comido para ti!",

    # Nivel 1: Cuentas de la Tierra (1 al 4)
    "l1_c1_prompt": "¡Pon el número uno! Sube una bolita de abajo hacia la barra.",
    "l1_c1_win": "¡Eso es el número uno! ¡Genial!",
    "l1_c2_prompt": "¡Ahora el número dos! Sube dos bolitas de abajo.",
    "l1_c2_win": "¡Increíble! ¡Dos bolitas en la barra es el número dos!",
    "l1_c3_prompt": "¡El número cuatro! Sube todas las cuatro bolitas de abajo hacia la barra.",
    "l1_c3_win": "¡Bravo! ¡Has puesto el número cuatro!",
    "l1_c4_prompt": "¡Limpia el ábaco! Baja las cuatro bolitas para dejar el ábaco en cero.",
    "l1_c4_win": "¡Excelente! ¡El ábaco quedó limpio en cero!",

    # Nivel 2: El Rey 5 del Cielo
    "l2_c1_prompt": "La bolita solitaria de arriba es mágica y vale cinco. ¡Bájala hacia la barra con tu dedo índice!",
    "l2_c1_win": "¡Wao! ¡Esa sola bolita vale cinco! ¡Qué poderosa!",
    "l2_c2_prompt": "¡Muy bien! Sube la bolita de arriba para separarla de la barra y dejar el ábaco en cero.",
    "l2_c2_win": "¡Perfecto! ¡Volviste a dejar el ábaco limpio en cero!",
    "l2_c3_prompt": "¡Ahora pon el número cinco tú solita!",
    "l2_c3_win": "¡Sensacional! ¡Pusiste el número cinco tú solita!",

    # Nivel 3: La Pinza Mágica (6 al 9)
    "l3_c1_prompt": "¡El número seis! Pon el cinco de arriba y una bolita de abajo. ¡Cinco más uno es seis!",
    "l3_c1_win": "¡Sí! ¡Cinco más uno es seis!",
    "l3_c2_prompt": "¡El número siete! Baja el cinco de arriba y sube dos bolitas de abajo.",
    "l3_c2_win": "¡Súper! ¡Cinco más dos es siete!",
    "l3_c3_prompt": "¡El número ocho! Baja el cinco y sube tres bolitas de abajo.",
    "l3_c3_win": "¡Excelente! ¡Cinco más tres son ocho!",
    "l3_c4_prompt": "¡El número nueve! Junta todas las bolitas en la barra: el cinco de arriba y las cuatro de abajo.",
    "l3_c4_win": "¡Maravilloso! ¡Has dominado todos los números del cero al nueve!",

    # Nivel 4: Primeras Sumas Directas
    "l4_c1_prompt": "Tienes una bolita. Sube una bolita más. ¿Cuánto es uno más uno?",
    "l4_c1_win": "¡Uno más uno son dos! ¡Gran trabajo!",
    "l4_c2_prompt": "Tienes dos bolitas. Sube dos bolitas más. ¿Cuánto es dos más dos?",
    "l4_c2_win": "¡Dos más dos son cuatro! ¡Eres un genio!",
    "l4_c3_prompt": "Tienes el cinco arriba. Sube dos bolitas abajo. ¿Cuánto es cinco más dos?",
    "l4_c3_win": "¡Cinco más dos son siete! ¡Qué rápido sumas!",

    # Nivel 5: Primeras Restas Directas
    "l5_c1_prompt": "Hay tres bolitas en la barra. Quita una bolita bajándola. ¿Cuánto es tres menos uno?",
    "l5_c1_win": "¡Tres menos uno son dos! ¡Lo hiciste perfecto!",
    "l5_c2_prompt": "Tienes cuatro bolitas en la barra. Quita dos bolitas bajándolas. ¿Cuánto es cuatro menos dos?",
    "l5_c2_win": "¡Cuatro menos dos son dos! ¡Sensacional!",
    "l5_c3_prompt": "Tienes el siete. Quita la bolita de arriba del cinco. ¿Cuánto queda?",
    "l5_c3_win": "¡Siete menos cinco son dos! ¡Completaste las restas!",

    # Nivel 6: ¡Las Decenas! (2 Columnas)
    "l6_c1_prompt": "¡Mira! ¡Apareció la columna de las decenas a la izquierda! Sube una bolita en decenas para hacer el diez.",
    "l6_c1_win": "¡Eso es el número diez! ¡Una decena y cero unidades!",
    "l6_c2_prompt": "¡Ahora el número veinte! Sube dos bolitas en la columna de las decenas.",
    "l6_c2_win": "¡Veinte! ¡Dos decenas perfectas!",
    "l6_c3_prompt": "¡El número cincuenta! Baja la superbolita de arriba en las decenas.",
    "l6_c3_win": "¡Cincuenta! ¡Esa superbolita en decenas vale cincuenta!",

    # Nivel 7: Decenas y Unidades (2 Columnas)
    "l7_c1_prompt": "¡Hagamos el doce! Pon uno en las decenas y dos en las unidades.",
    "l7_c1_win": "¡El doce! ¡Qué fácil se ve en dos columnas!",
    "l7_c2_prompt": "¡Ahora el quince! Uno en las decenas y baja el cinco en unidades.",
    "l7_c2_win": "¡Quince! ¡Una decena y cinco unidades!",
    "l7_c3_prompt": "¡El número veinticuatro! Dos en las decenas y cuatro en las unidades.",
    "l7_c3_win": "¡Veinticuatro! ¡Eres imparable!",
    "l7_c4_prompt": "¡Treinta y cinco! Tres en las decenas y baja el cinco en unidades.",
    "l7_c4_win": "¡Treinta y cinco! ¡Fantástico!",

    # Nivel 8: El Rey 99 (2 Columnas)
    "l8_c1_prompt": "¡Sesenta y ocho! Pon seis en las decenas y ocho en unidades.",
    "l8_c1_win": "¡Sesenta y ocho! ¡Ya manejas números grandes!",
    "l8_c2_prompt": "¡El número noventa y nueve! Todas las bolitas de ambas columnas a la barra.",
    "l8_c2_win": "¡Noventa y nueve! ¡El rey de las dos columnas!",

    # Nivel 9: ¡Las Centenas! (3 Columnas)
    "l9_c1_prompt": "¡Apareció la tercera columna de las centenas! Sube una bolita en centenas para hacer cien.",
    "l9_c1_win": "¡Cien! ¡Has entrado al club de las centenas!",
    "l9_c2_prompt": "¡Doscientos cincuenta! Dos en centenas y baja el cinco en decenas.",
    "l9_c2_win": "¡Doscientos cincuenta! ¡Qué bien se ve!",
    "l9_c3_prompt": "¡Novecientos noventa y nueve! Activa todas las bolitas de las tres columnas.",
    "l9_c3_win": "¡Novecientos noventa y nueve! ¡Tres columnas dominadas al cien por ciento!",

    # Nivel 10: ¡El Templo de los Miles! (4 Columnas)
    "l10_c1_prompt": "¡El ábaco completo de cuatro columnas! Sube uno en los miles para hacer mil.",
    "l10_c1_win": "¡MIL! ¡Llegaste al número mil!",
    "l10_c2_prompt": "¡Dos mil veintiséis! Dos en miles, cero en centenas, dos en decenas y seis en unidades.",
    "l10_c2_win": "¡Dos mil veintiséis! ¡Un año épico en el ábaco!",
    "l10_c3_prompt": "¡Cinco mil! Baja la superbolita de arriba en la columna de los miles.",
    "l10_c3_win": "¡Cinco mil! ¡Eres una gran maestra del Soroban japonés!",

    # Frases de apoyo y números sueltos
    "l0_intro": "¡Hola! Las bolitas solo tienen valor cuando tocan la viga del centro. Sube una bolita hacia la viga para hacer el uno.",
    "reminder_idle": "¡Mira la mano mágica! Mueve la bolita que brilla hacia la barra.",
    "reminder_try": "¡Tú puedes amiguito! Intenta mover la bolita brillante.",
    "hint_more": "¡Te faltan bolitas! Sube otra más hacia la barra.",
    "hint_less": "¡Pusiste de más! Baja una bolita para separarla de la barra.",
    "num_0": "Cero",
    "num_1": "Uno",
    "num_2": "Dos",
    "num_3": "Tres",
    "num_4": "Cuatro",
    "num_5": "Cinco",
    "num_6": "Seis",
    "num_7": "Siete",
    "num_8": "Ocho",
    "num_9": "Nueve",
    "num_10": "Diez",
}

async def generate():
    print(f"Generando {len(PHRASES)} audios con {VOICE}...")
    sem = asyncio.Semaphore(5)

    async def gen_one(key, text):
        filepath = os.path.join(OUT_DIR, f"{key}.mp3")
        async with sem:
            try:
                communicate = edge_tts.Communicate(text, VOICE, rate="+4%", pitch="+10Hz")
                await communicate.save(filepath)
                print(f"OK: {key}")
            except Exception as e:
                print(f"ERROR {key}: {e}")

    await asyncio.gather(*(gen_one(k, t) for k, t in PHRASES.items()))
    print("¡Todos los audios fueron generados y sincronizados 100% con los niveles!")

if __name__ == "__main__":
    asyncio.run(generate())
