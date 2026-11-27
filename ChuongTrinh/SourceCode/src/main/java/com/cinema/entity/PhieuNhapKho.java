package com.cinema.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PHIEUNHAPKHO")
public class PhieuNhapKho {
    @Id
    @Column(name = "maPhieuNhap", nullable = false, length = 20)
    private String maPhieuNhap;

    @Column(name = "maNhanVien", nullable = false, length = 10)
    private String maNhanVien;

    @Column(name = "ngayNhap", nullable = false)
    private LocalDate ngayNhap;

    @Column(name = "nhaCungCap", nullable = false, length = 200)
    private String nhaCungCap;

    @Column(name = "ghiChu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "thoiDiemLuu", nullable = false)
    private LocalDateTime thoiDiemLuu;

    public String getMaPhieuNhap() { return maPhieuNhap; }
    public void setMaPhieuNhap(String maPhieuNhap) { this.maPhieuNhap = maPhieuNhap; }

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }

    public LocalDate getNgayNhap() { return ngayNhap; }
    public void setNgayNhap(LocalDate ngayNhap) { this.ngayNhap = ngayNhap; }

    public String getNhaCungCap() { return nhaCungCap; }
    public void setNhaCungCap(String nhaCungCap) { this.nhaCungCap = nhaCungCap; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }

    public LocalDateTime getThoiDiemLuu() { return thoiDiemLuu; }
    public void setThoiDiemLuu(LocalDateTime thoiDiemLuu) { this.thoiDiemLuu = thoiDiemLuu; }
}
