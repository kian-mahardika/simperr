"""Generate a clearly identified, deterministic catalog seed for interface testing."""
import csv
import json
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
subjects = [
    ("Akuntansi Sektor Publik", "Akuntansi", "A"),
    ("Perpajakan", "Perpajakan", "B"),
    ("Keuangan Negara", "Keuangan Publik", "C"),
    ("Audit Sektor Publik", "Audit", "D"),
    ("Sistem Informasi Akuntansi", "Sistem Informasi", "E"),
    ("Manajemen Aset Publik", "Manajemen Aset", "F"),
    ("Hukum Administrasi Negara", "Hukum", "G"),
    ("Statistika Terapan", "Metodologi", "H"),
    ("Ekonomi Publik", "Ekonomi", "I"),
    ("Manajemen Risiko", "Manajemen", "J"),
    ("Penganggaran Negara", "Keuangan Publik", "K"),
    ("Kepabeanan dan Cukai", "Perpajakan", "L"),
    ("Analitika Data", "Sistem Informasi", "M"),
    ("Tata Kelola Organisasi", "Manajemen", "N"),
    ("Pengadaan Barang dan Jasa", "Manajemen Aset", "O"),
    ("Akuntansi Pemerintahan", "Akuntansi", "P"),
    ("Metode Penelitian", "Metodologi", "Q"),
    ("Pelayanan Publik", "Administrasi", "R"),
    ("Kebijakan Fiskal", "Ekonomi", "S"),
    ("Pengendalian Internal", "Audit", "T"),
    ("Keuangan Daerah", "Keuangan Publik", "U"),
    ("Etika Profesi", "Administrasi", "V"),
    ("Perbendaharaan Negara", "Keuangan Publik", "W"),
    ("Hukum Pajak", "Hukum", "X"),
    ("Keamanan Informasi", "Sistem Informasi", "Y"),
    ("Evaluasi Program", "Metodologi", "Z"),
]
topics = [
    "Pengantar dan Kerangka Konseptual", "Perencanaan dan Strategi",
    "Pencatatan dan Dokumentasi", "Analisis Data", "Pengukuran Kinerja",
    "Regulasi dan Kepatuhan", "Studi Kasus Indonesia", "Praktik Lapangan",
    "Manajemen Proses", "Pengendalian dan Pengawasan", "Pelaporan",
    "Inovasi Digital", "Metode Kuantitatif", "Metode Kualitatif",
    "Manajemen Risiko", "Evaluasi Kebijakan", "Transparansi dan Akuntabilitas",
    "Pelayanan dan Pengguna", "Perancangan Sistem", "Isu Kontemporer",
]
palette = [("#123A67", "#88D5F2"), ("#164E63", "#B6E2D4"), ("#382F6C", "#BFC1FA"), ("#6B3B45", "#F3CBD0"), ("#384B6B", "#F4D598")]
books=[]
for i,(name,category,section) in enumerate(subjects):
    for j,topic in enumerate(topics):
        n=i*len(topics)+j+19
        title=f"{name}: {topic}"
        ident=f"B{n:04d}"
        color,accent=palette[i%len(palette)]
        words=escape(name)
        cover=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320" role="img" aria-label="Sampul {escape(title)}"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="{color}"/><stop offset="1" stop-color="#10223f"/></linearGradient></defs><rect width="240" height="320" rx="8" fill="url(#g)"/><rect x="15" y="14" width="210" height="292" rx="5" fill="none" stroke="{accent}" stroke-opacity=".55"/><path d="M35 83h170M35 236h170" stroke="{accent}" stroke-width="2"/><text x="35" y="51" fill="{accent}" font-family="Arial,sans-serif" font-size="12" letter-spacing="2">SIMPER · KOLEKSI</text><text x="35" y="119" fill="white" font-family="Arial,sans-serif" font-size="17" font-weight="bold">{words[:23]}</text><text x="35" y="143" fill="white" font-family="Arial,sans-serif" font-size="15">{escape(topic[:24])}</text><text x="35" y="268" fill="{accent}" font-family="Arial,sans-serif" font-size="12">PKN STAN · {section}-{j+1:02d}</text></svg>'''
        (ROOT/"covers").mkdir(exist_ok=True)
        (ROOT/"covers"/f"{ident}.svg").write_text(cover,encoding="utf8")
        count=2+j%3
        books.append(dict(id=ident,title=title,author="Data katalog rancangan",category=category,isbn=f"SIM-{n:06d}",year=2026,publisher="Koleksi rancangan",shelf=f"Rak {section}-{j+1:02d}",replacementValue=75000+(i%6)*15000,cover=f"./covers/{ident}.svg",source="Katalog rancangan",copies=[dict(barcode=f"{ident}-{k+1:02d}",status="AVAILABLE") for k in range(count)]))
(ROOT/"catalog-data.js").write_text("export const catalogSeed = "+json.dumps(books,ensure_ascii=False,separators=(",",":"))+";\n",encoding="utf8")
with (ROOT/"database"/"catalog_seed.csv").open("w",newline="",encoding="utf-8-sig") as f:
    w=csv.writer(f);w.writerow(["book_id","title","author","category","catalog_code","year","publisher","shelf","replacement_value","cover_path","source","copy_count"])
    for b in books:w.writerow([b[x] for x in ("id","title","author","category","isbn","year","publisher","shelf","replacementValue","cover","source")]+[len(b["copies"])])
for k in range(1,19):
    target=ROOT/"covers"/f"B{k:03d}.svg"
    source=ROOT/"covers"/f"B{k+18:04d}.svg"
    target.write_text(source.read_text(encoding="utf8"),encoding="utf8")
print(len(books),"distinct catalog seed titles")
