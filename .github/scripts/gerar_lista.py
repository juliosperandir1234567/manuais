"""Gera lista.json a partir das pastas em manuais/.

Cada subpasta de manuais/ é uma categoria. Dentro dela:
- foto.jpg (ou .jpeg/.png/.webp): foto do cartão da categoria (opcional)
- arquivos .pdf: cada um vira um item. Se o nome começar com "Guia", vira Guia rápido.

A ordem dos cartões segue manuais/ordem.txt (uma categoria por linha).
"""
import json, os, re, sys
from datetime import datetime, timezone

RAIZ = sys.argv[1] if len(sys.argv) > 1 else "."
PASTA = os.path.join(RAIZ, "manuais")
FOTOS = ("foto.jpg", "foto.jpeg", "foto.png", "foto.webp")
ORDEM = ["Tratores", "Colhedoras de cana", "Pulverizadores", "Motoniveladoras"]
_ordem_txt = os.path.join(RAIZ, "manuais", "ordem.txt")
if os.path.isfile(_ordem_txt):
    with open(_ordem_txt, encoding="utf-8") as f:
        ORDEM = [l.strip() for l in f if l.strip() and not l.startswith("#")]


def limpar(nome):
    nome = re.sub(r"\.pdf$", "", nome, flags=re.I)
    tipo = "Guia rápido" if re.match(r"\s*guia", nome, re.I) else "Manual"
    nome = re.sub(r"^\s*(guia\s*r[aá]pido|guia|manual)\s*[-–—:]\s*", "", nome, flags=re.I)
    return nome.strip() or nome, tipo


categorias, itens = [], []
if os.path.isdir(PASTA):
    nomes = sorted(os.listdir(PASTA), key=lambda n: (ORDEM.index(n) if n in ORDEM else 99, n.lower()))
    for cat in nomes:
        d = os.path.join(PASTA, cat)
        if not os.path.isdir(d) or cat.startswith("."):
            continue
        foto = next((f for f in FOTOS if os.path.isfile(os.path.join(d, f))), None)
        categorias.append({"nome": cat, "foto": f"manuais/{cat}/{foto}" if foto else None})
        for arq in sorted(os.listdir(d)):
            if not arq.lower().endswith(".pdf"):
                continue
            nome, tipo = limpar(arq)
            itens.append({
                "nome": nome, "tipo": tipo, "categoria": cat,
                "arquivo": f"manuais/{cat}/{arq}",
                "tamanho": os.path.getsize(os.path.join(d, arq)),
            })

logo = next((f for f in ("logo.png", "logo.jpg", "logo.jpeg", "logo.svg", "logo.webp") if os.path.isfile(os.path.join(RAIZ, f))), None)
saida = {
    "atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "logo": logo, "categorias": categorias, "manuais": itens,
}
with open(os.path.join(RAIZ, "lista.json"), "w", encoding="utf-8") as f:
    json.dump(saida, f, ensure_ascii=False, indent=1)
print(f"{len(categorias)} categorias, {len(itens)} arquivos")
