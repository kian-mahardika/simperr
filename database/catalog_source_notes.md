# Asal data katalog

Katalog publik Perpustakaan PKN STAN dapat diperiksa di https://opac.pknstan.ac.id/. Contoh entri yang terlihat pada hasil pencarian: *Harry Potter and the Sorcerer's Stone* (J.K. Rowling), *Handbook of Corporate Tax Planning* (E. A. Srinivas), *Analisis Jalur Untuk Riset Bisnis dengan SPSS* (Jonathan Sarwono), *Change Management untuk Birokrasi* (Riant Nugroho), dan *Manajemen Risiko Korporat Terintegrasi* (Bramantya Djohanputro). Sumber halaman: https://opac.pknstan.ac.id/index.php?author=&page=131&search=Search (diperiksa 7 Oktober 2026).

`opac_sample_verified.csv` menyimpan 12 contoh metadata yang dibaca dari halaman tersebut. Angka ketersediaan adalah cuplikan saat penelusuran, bukan stok langsung.

`catalog_seed.csv` adalah data rancangan berisi 520 judul unik, 1.534 eksemplar, kode, lokasi rak, nilai penggantian, dan path sampul ilustratif. Judul, penulis generik, nilai, jumlah copy, serta rak pada CSV tidak diekspor dari OPAC. Berkas Excel awal yang tersedia memuat 500 baris tetapi hanya 122 judul unik dan banyak metadata contoh, sehingga tidak dipakai sebagai klaim inventaris resmi. Untuk layanan nyata, ekspor terotorisasi OPAC harus mengganti data rancangan, khususnya barcode, rak, stok, nilai buku, dan gambar sampul.
