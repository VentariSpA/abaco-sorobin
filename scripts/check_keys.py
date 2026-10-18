import re
import os

with open('js/levels.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Match each challenge block
blocks = re.findall(r'\{[^{}]*audioKey:[^{}]*\}', content)
print(f"Found {len(blocks)} challenges in js/levels.js:")
for b in blocks:
    ak_m = re.search(r'audioKey:\s*[\'"]([^\'"]+)[\'"]', b)
    wak_m = re.search(r'winAudioKey:\s*[\'"]([^\'"]+)[\'"]', b)
    txt_m = re.search(r'text:\s*[\'"]([^\'"]+)[\'"]', b)
    ak = ak_m.group(1) if ak_m else 'MISSING'
    wak = wak_m.group(1) if wak_m else 'MISSING'
    txt = txt_m.group(1) if txt_m else 'MISSING'
    mp3_path = os.path.join('audio', 'tts', f"{ak}.mp3")
    exists = os.path.exists(mp3_path)
    print(f"KEY: {ak:<15} EXISTS: {exists!s:<5} TEXT: {txt}")
