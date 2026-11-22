package com.cinema.entity;

import com.cinema.enums.TrangThaiSuat;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** Lớp SuatChieu (báo cáo 3.7.3.8) - bảng SUATCHIEU. */
@Entity
@Table(name = "SUATCHIEU")
public class SuatChieu {
    @Id
    @Column(name = "maSuat")
    private String maSuat;

    @Column(name = "maPhim")
    private String maPhim;

    @Column(name = "maPhong")
    private String maPhong;

    @Column(name = "ngayChieu")
    private LocalDate ngayChieu;

    @Column(name = "gioBatDau")
    private LocalTime gioBatDau;

    @Column(name = "gioKetThuc")
    private LocalTime gioKetThuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiSuat trangThai;

    public LocalDateTime thoiDiemBatDau() {
        return LocalDateTime.of(ngayChieu, gioBatDau);
    }

    /** Suất còn được phép bán vé: chưa hủy, chưa bắt đầu (UC5.1 bước 2). */
    public boolean conBanVe(LocalDateTime bayGio) {
        return trangThai == TrangThaiSuat.SAP_CHIEU && thoiDiemBatDau().isAfter(bayGio);
    }

    public String getMaSuat() { return maSuat; }
    public void setMaSuat(String maSuat) { this.maSuat = maSuat; }
    public String getMaPhim() { return maPhim; }
    public void setMaPhim(String maPhim) { this.maPhim = maPhim; }
    public String getMaPhong() { return maPhong; }
    public void setMaPhong(String maPhong) { this.maPhong = maPhong; }
    public LocalDate getNgayChieu() { return ngayChieu; }
    public void setNgayChieu(LocalDate ngayChieu) { this.ngayChieu = ngayChieu; }
    public LocalTime getGioBatDau() { return gioBatDau; }
    public void setGioBatDau(LocalTime gioBatDau) { this.gioBatDau = gioBatDau; }
    public LocalTime getGioKetThuc() { return gioKetThuc; }
    public void setGioKetThuc(LocalTime gioKetThuc) { this.gioKetThuc = gioKetThuc; }
    public TrangThaiSuat getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiSuat trangThai) { this.trangThai = trangThai; }
}
