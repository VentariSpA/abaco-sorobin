import asyncio
import os
import edge_tts

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "tts")
os.makedirs(OUT_DIR, exist_ok=True)

VOICE = "es-MX-DaliaNeural"

PHRASES = {
    # Nivel 0 - Rápido, claro y sin monólogos largos
    "l0_intro": "¡Hola! Soy Sorobín. ¡Sube una bolita de abajo hacia la barra!",
    "l0_c1_win": "¡Muy bien! ¡Ya activaste tu primera bolita mágica!",
    "l0_c2_prompt": "¡Ahora baja la bolita para dejar el ábaco en cero!",
    "l0_c2_win": "¡Perfecto! Cuando ninguna bolita toca la barra, ¡es CERO!",

    # Nivel 1 - Directo y alegre
    "l1_c1_prompt": "¡Pon el número uno! Sube una bolita hacia la barra.",
    "l1_c1_win": "¡Eso es el número uno! ¡Genial!",
    "l1_c2_prompt": "¡Pon el número dos! Sube dos bolitas hacia la barra.",
    "l1_c2_win": "¡Increíble! ¡Dos bolitas en la barra es el número dos!",
    "l1_c3_prompt": "¡Muy bien! Ahora pon el número tres. Sube tres bolitas.",
    "l1_c3_win": "¡Fantástico! ¡El tres es pan comido para ti!",
    "l1_c4_prompt": "¡El número cuatro! Sube las cuatro bolitas.",
    "l1_c4_win": "¡Bravo! ¡Has completado todos los números del uno al cuatro!",

    # Nivel 2
    "l2_c1_prompt": "¡La bolita de arriba es mágica y vale CINCO! Bájala hacia la barra.",
    "l2_c1_win": "¡Wao! ¡Esa sola bolita vale cinco! ¡Qué poderosa!",

    # Nivel 3
    "l3_c1_prompt": "¡Hagamos el seis! Baja la del cinco y sube una bolita de abajo.",
    "l3_c1_win": "¡Sí! ¡Cinco más uno es seis!",
    "l3_c2_prompt": "¡Ahora el número siete! El cinco arriba y dos bolitas abajo.",
    "l3_c2_win": "¡Súper! ¡Cinco más dos es siete!",
    "l3_c3_prompt": "¡Vamos con el ocho! El cinco arriba y tres bolitas abajo.",
    "l3_c3_win": "¡Excelente! ¡Cinco más tres son ocho!",
    "l3_c4_prompt": "¡El número nueve! Todas las bolitas juntas en la barra.",
    "l3_c4_win": "¡Maravilloso! ¡Has dominado todos los números del cero al nueve!",

    # Nivel 4: Sumas
    "l4_c1_prompt": "¡Vamos a sumar! Tienes una bolita. Sube una más. ¿Cuánto es uno más uno?",
    "l4_c1_win": "¡Uno más uno son dos! ¡Gran trabajo!",
    "l4_c2_prompt": "Tienes dos bolitas. Sube dos más. ¿Cuánto es dos más dos?",
    "l4_c2_win": "¡Dos más dos son cuatro! ¡Eres un genio!",
    "l4_c3_prompt": "Tienes el cinco arriba. Sube dos bolitas abajo. ¿Cuánto es cinco más dos?",
    "l4_c3_win": "¡Cinco más dos son siete! ¡Qué rápido sumas!",

    # Nivel 5: Restas
    "l5_c1_prompt": "¡Vamos a restar! Hay tres bolitas. Quita una bolita bajándola. ¿Cuánto es tres menos uno?",
    "l5_c1_win": "¡Tres menos uno son dos! ¡Lo hiciste perfecto!",
    "l5_c2_prompt": "Tienes cuatro bolitas. Quita dos bajándolas. ¿Cuánto es cuatro menos dos?",
    "l5_c2_win": "¡Cuatro menos dos son dos! ¡Sensacional!",
    "l5_c3_prompt": "Tienes el siete. Quita la bolita de arriba del cinco. ¿Cuánto queda?",
    "l5_c3_win": "¡Siete menos cinco son dos! ¡Completaste las restas!",

    # Nivel 6: Los Amigos del 5 (Sumar 1 y 2)
    "l6_c1_prompt": "¡Tienes cuatro y sumas uno! No hay más abajo. El uno es amigo del cuatro: ¡Baja el cinco y baja cuatro bolitas!",
    "l6_c1_win": "¡Wao! ¡Cuatro más uno son cinco! ¡Usaste el truco del amigo!",
    "l6_c2_prompt": "Tienes tres bolitas. ¡Suma dos! El dos es amigo del tres: ¡Baja el cinco y baja tres bolitas!",
    "l6_c2_win": "¡Exacto! ¡Tres más dos son cinco! ¡Qué truco tan genial!",
    "l6_c3_prompt": "Tienes cuatro bolitas. ¡Suma dos! Baja el cinco y baja dos bolitas de abajo.",
    "l6_c3_win": "¡Cuatro más dos son seis! ¡Eres increíble!",

    # Nivel 7: Los Amigos del 5 (Sumar 3 y 4)
    "l7_c1_prompt": "Tienes tres bolitas. ¡Suma tres! Baja el cinco y baja dos bolitas de abajo.",
    "l7_c1_win": "¡Tres más tres son seis! ¡Lo dominas!",
    "l7_c2_prompt": "Tienes cuatro bolitas. ¡Suma tres! Baja el cinco y baja una bolita de abajo.",
    "l7_c2_win": "¡Cuatro más tres son siete! ¡Excelente cálculo!",
    "l7_c3_prompt": "Tienes cuatro bolitas. ¡Suma cuatro! Baja el cinco. ¡Cuatro más cuatro!",
    "l7_c3_win": "¡Cuatro más cuatro son ocho! ¡Gran maestría!",

    # Nivel 8: Restas con el 5 (Quitar 1 y 2)
    "l8_c1_prompt": "Tienes cinco y quieres restar uno. ¡Sube cuatro bolitas abajo y sube la del cinco!",
    "l8_c1_win": "¡Cinco menos uno son cuatro! ¡Muy bien restado!",
    "l8_c2_prompt": "Tienes cinco y restas dos. ¡Sube tres bolitas abajo y sube la del cinco!",
    "l8_c2_win": "¡Cinco menos dos son tres! ¡Fantástico!",
    "l8_c3_prompt": "Tienes seis y restas dos. Sube tres bolitas abajo y sube la del cinco.",
    "l8_c3_win": "¡Seis menos dos son cuatro! ¡Qué agilidad!",

    # Nivel 9: Gran Torneo de los Amigos del 5
    "l9_c1_prompt": "Tienes cinco y restas tres. ¡Sube dos bolitas abajo y sube la del cinco!",
    "l9_c1_win": "¡Cinco menos tres son dos! ¡Lo hiciste!",
    "l9_c2_prompt": "Tienes cinco y restas cuatro. ¡Sube una bolita abajo y sube la del cinco!",
    "l9_c2_win": "¡Cinco menos cuatro es uno! ¡Sensacional!",
    "l9_c3_prompt": "Tienes siete y restas tres. Sube dos bolitas abajo y sube la del cinco.",
    "l9_c3_win": "¡Siete menos tres son cuatro! ¡Has conquistado todos los Amigos del Cinco!",

    # Nivel 10: ¡El Despertar de las Decenas! (2 Columnas)
    "l10_c1_prompt": "¡Mira! ¡Apareció la columna de las decenas a la izquierda! Sube una bolita en decenas para hacer el diez.",
    "l10_c1_win": "¡Eso es el número diez! ¡Una decena y cero unidades!",
    "l10_c2_prompt": "¡Ahora el número veinte! Sube dos bolitas en la columna de las decenas.",
    "l10_c2_win": "¡Veinte! ¡Dos decenas perfectas!",
    "l10_c3_prompt": "¡El número cincuenta! Baja la superbolita de arriba en las decenas.",
    "l10_c3_win": "¡Cincuenta! ¡Esa superbolita en decenas vale cincuenta!",

    # Nivel 11: Decenas y Unidades Amigas (2 Columnas)
    "l11_c1_prompt": "¡Hagamos el doce! Pon uno en las decenas y dos en las unidades.",
    "l11_c1_win": "¡El doce! ¡Qué fácil se ve en dos columnas!",
    "l11_c2_prompt": "¡Ahora el quince! Uno en las decenas y baja el cinco en unidades.",
    "l11_c2_win": "¡Quince! ¡Una decena y cinco unidades!",
    "l11_c3_prompt": "¡El número veinticuatro! Dos en las decenas y cuatro en las unidades.",
    "l11_c3_win": "¡Veinticuatro! ¡Eres imparable!",

    # Nivel 12: Números Grandes de 2 Cifras (2 Columnas)
    "l12_c1_prompt": "¡Treinta y cinco! Tres en las decenas y baja el cinco en unidades.",
    "l12_c1_win": "¡Treinta y cinco! ¡Fantástico!",
    "l12_c2_prompt": "¡Sesenta y ocho! Pon seis en las decenas y ocho en unidades.",
    "l12_c2_win": "¡Sesenta y ocho! ¡Ya manejas números grandes!",
    "l12_c3_prompt": "¡El número noventa y nueve! Todas las bolitas de ambas columnas a la barra.",
    "l12_c3_win": "¡Noventa y nueve! ¡El rey de las dos columnas!",

    # Nivel 13: El Salto del 10 (Llevadas entre Columnas)
    "l13_c1_prompt": "Tienes nueve en unidades. ¡Suma uno! Quita el nueve en unidades y sube uno en decenas.",
    "l13_c1_win": "¡Nueve más uno son diez! ¡Hiciste tu primera llevada japonesa!",
    "l13_c2_prompt": "Tienes diecinueve y sumas uno. Limpia las unidades y sube otra decena.",
    "l13_c2_win": "¡Diecinueve más uno son veinte! ¡Magia pura!",
    "l13_c3_prompt": "Tienes ocho y sumas cinco. ¡Haz el trece! Uno en decenas y tres en unidades.",
    "l13_c3_win": "¡Ocho más cinco son trece! ¡Increíble cálculo!",

    # Nivel 14: ¡Despiertan las Centenas! (3 Columnas)
    "l14_c1_prompt": "¡Wao! ¡Apareció la tercera columna de las centenas! Sube una bolita en centenas para hacer cien.",
    "l14_c1_win": "¡Cien! ¡Has entrado al club de las centenas!",
    "l14_c2_prompt": "¡Doscientos cincuenta! Dos en centenas y baja el cinco en decenas.",
    "l14_c2_win": "¡Doscientos cincuenta! ¡Qué bien se ve!",
    "l14_c3_prompt": "¡Quinientos! Baja la superbolita de arriba en las centenas.",
    "l14_c3_win": "¡Quinientos! ¡Poder máximo en centenas!",

    # Nivel 15: Maestros de 3 Cifras (3 Columnas)
    "l15_c1_prompt": "¡Ciento veinticinco! Uno en centenas, dos en decenas y cinco en unidades.",
    "l15_c1_win": "¡Ciento veinticinco! ¡Un cálculo impecable!",
    "l15_c2_prompt": "¡Trescientos cuarenta y dos! Tres en centenas, cuatro en decenas y dos en unidades.",
    "l15_c2_win": "¡Trescientos cuarenta y dos! ¡Extraordinario!",
    "l15_c3_prompt": "¡Novecientos noventa y nueve! Activa todas las bolitas de las tres columnas.",
    "l15_c3_win": "¡Novecientos noventa y nueve! ¡Tres columnas dominadas al cien por ciento!",

    # Nivel 16: ¡El Templo de los Miles! (4 Columnas)
    "l16_c1_prompt": "¡Impresionante! ¡El ábaco completo de cuatro columnas! Sube uno en los miles para hacer mil.",
    "l16_c1_win": "¡MIL! ¡Llegaste al número mil!",
    "l16_c2_prompt": "¡Dos mil veintiséis! Dos en miles, cero en centenas, dos en decenas y seis en unidades.",
    "l16_c2_win": "¡Dos mil veintiséis! ¡Un año épico en el ábaco!",
    "l16_c3_prompt": "¡Cinco mil! Baja la superbolita de arriba en la columna de los miles.",
    "l16_c3_win": "¡Cinco mil! ¡Eres una gran maestra del Soroban japonés!",

    # Recordatorios e inacción
    "reminder_idle": "¡Mira la mano mágica! Mueve la bolita que brilla hacia la barra.",
    "reminder_try": "¡Tú puedes amiguito! Intenta mover la bolita brillante.",
    "hint_more": "¡Te faltan bolitas! Sube otra más hacia la barra.",
    "hint_less": "¡Pusiste de más! Baja una bolita para separarla de la barra.",

    # Números individuales
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
    print(f"Regenerando audios con {VOICE}...")
    sem = asyncio.Semaphore(4)

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
    print("¡Audios actualizados exitosamente!")

if __name__ == "__main__":
    asyncio.run(generate())
