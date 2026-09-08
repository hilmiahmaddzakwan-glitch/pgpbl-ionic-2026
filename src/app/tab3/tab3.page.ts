import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: false
})
export class Tab3Page {

  // Data dari form
  mataKuliah: string = '';
  jam: string = '';
  ruang: string = '';
  dosen: string = '';

  // Daftar jadwal yang sudah ditambahkan
  jadwal: any[] = [];

  // Fungsi tombol Simpan
  simpanJadwal() {

    // Mengecek kelengkapan form
    if (
      this.mataKuliah.trim() === '' ||
      this.jam.trim() === '' ||
      this.ruang.trim() === '' ||
      this.dosen.trim() === ''
    ) {
      alert('Mohon lengkapi semua data jadwal.');
      return;
    }

    // Menambahkan data jadwal
    this.jadwal.push({
      mataKuliah: this.mataKuliah,
      jam: this.jam,
      ruang: this.ruang,
      dosen: this.dosen
    });

    // Mengosongkan form
    this.mataKuliah = '';
    this.jam = '';
    this.ruang = '';
    this.dosen = '';

    // Pesan berhasil
    alert('Jadwal berhasil disimpan!');
  }

}
