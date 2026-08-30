# WebGIS Gereja Gerakan Pentakosta

WebGIS ini menampilkan peta persebaran gereja-gereja Gerakan Pentakosta di wilayah DKI Jakarta dan sekitarnya. Aplikasi dibuat dengan HTML, CSS, JavaScript, dan Leaflet untuk menampilkan peta interaktif, pencarian, filter wilayah, serta detail gereja.

## Fitur

- Peta interaktif berbasis Leaflet
- Pilihan basemap beberapa jenis peta
- Marker untuk setiap lokasi gereja
- Search nama gereja atau alamat
- Filter berdasarkan wilayah/Mawil
- Detail gereja dengan foto dan tombol buka Google Maps
- Statistik jumlah gereja dan wilayah

## Struktur Project

- `index.html` — struktur utama halaman web
- `style.css` — styling tampilan
- `app.js` — konfigurasi peta, marker, dan logika aplikasi
- `script.js` — file pendukung/script tambahan
- `gereja.geojson` — data lokasi gereja dalam format GeoJSON
- `FotoGereja/` — folder berisi foto-foto gereja
- `profil-farhana.jpeg` — foto profil pembuat

## Persyaratan

- Browser modern (Chrome, Edge, Firefox)
- Server lokal untuk menjalankan aplikasi agar data GeoJSON dapat dibaca dengan benar

## Cara Menjalankan

1. Buka terminal di folder project ini.
2. Jalankan salah satu cara berikut:

### Opsi 1: Menggunakan Python HTTP Server

```bash
cd "WebGIS Gereja"
python -m http.server 8000
```

Lalu buka di browser:

```text
http://localhost:8000
```

### Opsi 2: Menggunakan VS Code Live Server

- Buka folder project di VS Code
- Klik kanan pada `index.html`
- Pilih `Open with Live Server`

> Catatan: jangan buka file HTML langsung dari file explorer karena `gereja.geojson` dibaca lewat fetch dan perlu server lokal agar berjalan dengan benar.

## Catatan Teknologi

- Leaflet digunakan untuk rendering peta interaktif
- GeoJSON digunakan sebagai sumber data gereja
- Data foto dipetakan ke lokasi gereja berdasarkan ID atau nama file yang tersedia

## Pembuat

- Farhana Fuad
- 21110123140147
- Teknik Geodesi Universitas Diponegoro
