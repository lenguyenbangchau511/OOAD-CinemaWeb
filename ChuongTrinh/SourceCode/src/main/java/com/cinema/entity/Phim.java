package com.cinema.entity;

import com.cinema.enums.TrangThaiPhim;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "PHIM")
public class Phim {
    @Id
    @Column(name = "maPhim", nullable = false, length = 10)
    private String maPhim;

    @Column(name = "tenPhim", nullable = false, length = 100)
    private String tenPhim;

    @Column(name = "theLoai", nullable = false, length = 50)
    private String theLoai;

    @Column(name = "thoiLuong", nullable = false)
    private int thoiLuong;

    @Column(name = "daoDien", nullable = false, length = 50)
    private String daoDien;

    @Column(name = "dienVien", nullable = false, length = 200)
    private String dienVien;

    @Column(name = "ngayKhoiChieu", nullable = false)
    private LocalDate ngayKhoiChieu;

    @Column(name = "quocGia", nullable = false, length = 50)
    private String quocGia;

    @Column(name = "noiDung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "poster", nullable = false, length = 255)
    private String poster;

    @Column(name = "gioiHanDoTuoi", nullable = false, length = 10)
    private String gioiHanDoTuoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiPhim trangThai;

    public String getMaPhim() { return maPhim; }
    public void setMaPhim(String maPhim) { this.maPhim = maPhim; }

    public String getTenPhim() { return tenPhim; }
    public void setTenPhim(String tenPhim) { this.tenPhim = tenPhim; }

    public String getTheLoai() { return theLoai; }
    public void setTheLoai(String theLoai) { this.theLoai = theLoai; }

    public int getThoiLuong() { return thoiLuong; }
    public void setThoiLuong(int thoiLuong) { this.thoiLuong = thoiLuong; }

    public String getDaoDien() { return daoDien; }
    public void setDaoDien(String daoDien) { this.daoDien = daoDien; }

    public String getDienVien() { return dienVien; }
    public void setDienVien(String dienVien) { this.dienVien = dienVien; }

    public LocalDate getNgayKhoiChieu() { return ngayKhoiChieu; }
    public void setNgayKhoiChieu(LocalDate ngayKhoiChieu) { this.ngayKhoiChieu = ngayKhoiChieu; }

    public String getQuocGia() { return quocGia; }
    public void setQuocGia(String quocGia) { this.quocGia = quocGia; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public String getPoster() { return poster; }
    public void setPoster(String poster) { this.poster = poster; }

    public String getGioiHanDoTuoi() { return gioiHanDoTuoi; }
    public void setGioiHanDoTuoi(String gioiHanDoTuoi) { this.gioiHanDoTuoi = gioiHanDoTuoi; }

    public TrangThaiPhim getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiPhim trangThai) { this.trangThai = trangThai; }
}
