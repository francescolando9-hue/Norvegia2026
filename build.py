#!/usr/bin/env python3
"""
Preparazione del rilascio.

Due cose, in quest'ordine:

1. Allinea il nome della cache del service worker all'impronta dei file.
   Serve perché il telefono, una volta installata l'app, continua a servire
   la versione in cache finché il nome non cambia. Calcolarlo da un hash del
   contenuto toglie di mezzo la disciplina manuale: se i file cambiano, il
   nome cambia, e il telefono scarica la versione nuova.

2. Genera ViaggioNorvegia2026.html, un unico file autonomo con CSS, dati e
   logica inlinati, da aprire direttamente dal telefono senza server.

Uso:
    python3 build.py            allinea la cache e genera il file singolo
    python3 build.py --check    non scrive niente, esce con 1 se la cache
                                e' disallineata (lo usa la GitHub Action)
"""

from pathlib import Path
import hashlib
import re
import sys

HERE = Path(__file__).parent
OUT = HERE / "ViaggioNorvegia2026.html"
SW = HERE / "sw.js"

# entrano nell'impronta: se cambia uno di questi, cambia la cache
FINGERPRINT = ["index.html", "app.css", "data.js", "store.js",
               "ui.js", "weather.js", "views.js", "app.js",
               "manifest.webmanifest"]

# ordine di caricamento degli script nel file singolo
SCRIPTS = ["data.js", "store.js", "ui.js", "weather.js", "views.js", "app.js"]

# opzionale, mai nel repo: entra solo nel file singolo generato in locale
SECRETS = "secrets.js"

CHECK = "--check" in sys.argv


def version():
    """Versione dichiarata in data.js, per tenere il nome leggibile."""
    m = re.search(r'version:\s*"([^"]+)"', (HERE / "data.js").read_text(encoding="utf-8"))
    return m.group(1) if m else "v0"


def fingerprint():
    h = hashlib.sha256()
    for name in FINGERPRINT:
        h.update((HERE / name).read_bytes())
    return h.hexdigest()[:8]


def sync_sw(cache_name):
    """Riscrive la costante CACHE in sw.js. Ritorna True se era gia' allineata."""
    txt = SW.read_text(encoding="utf-8")
    current = re.search(r'const CACHE = "([^"]+)"', txt)
    if current and current.group(1) == cache_name:
        return True
    if CHECK:
        return False
    SW.write_text(
        re.sub(r'const CACHE = "[^"]+"', 'const CACHE = "' + cache_name + '"', txt, count=1),
        encoding="utf-8")
    return False


def check_shell():
    """Ogni file citato da sw.js deve esistere, altrimenti l'install del SW fallisce."""
    txt = SW.read_text(encoding="utf-8")
    block = re.search(r"const SHELL = \[(.*?)\];", txt, re.S)
    missing = []
    if block:
        for name in re.findall(r'"([^"]+)"', block.group(1)):
            if name == "./":
                continue
            if not (HERE / name).exists():
                missing.append(name)
    return missing


def build_single():
    html = (HERE / "index.html").read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="app.css">',
        "<style>\n" + (HERE / "app.css").read_text(encoding="utf-8") + "\n</style>")

    names = ([SECRETS] if (HERE / SECRETS).exists() else []) + SCRIPTS
    bundle = "\n".join(
        "/* ===== " + name + " ===== */\n" + (HERE / name).read_text(encoding="utf-8")
        for name in names)

    html = re.sub(r'\s*<!-- opzionale[^>]*-->\s*<script src="secrets\.js"[^>]*></script>', "", html)
    html = html.replace('<script src="' + SCRIPTS[0] + '"></script>',
                        "<script>\n" + bundle + "\n</script>")
    for name in SCRIPTS[1:]:
        html = html.replace('<script src="' + name + '"></script>\n', "")

    # in un file autonomo il manifest non e' raggiungibile
    html = re.sub(r'\s*<link rel="manifest"[^>]*>', "", html)

    OUT.write_text(html, encoding="utf-8")
    return OUT.stat().st_size / 1024


def main():
    cache = "vn2026-" + version() + "-" + fingerprint()

    missing = check_shell()
    if missing:
        print("ERRORE - sw.js elenca file che non esistono: " + ", ".join(missing))
        return 1

    aligned = sync_sw(cache)

    if CHECK:
        if aligned:
            print("Cache allineata: " + cache)
            return 0
        print("Cache DISALLINEATA. Attesa: " + cache)
        print("Esegui `python3 build.py` e ricommitta sw.js.")
        return 1

    print("Cache service worker: " + cache + ("  (gia' allineata)" if aligned else "  (aggiornata)"))
    kb = build_single()
    con_pin = " (PIN inclusi da secrets.js)" if (HERE / SECRETS).exists() else " (senza PIN)"
    print("File singolo: %s - %.0f KB%s" % (OUT.name, kb, con_pin))
    return 0


if __name__ == "__main__":
    sys.exit(main())
