package com.cinema.entity;

import com.cinema.enums.TrangThaiVe;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lớp Ve (báo cáo 3.7.3.11) - bảng VE. Mỗi vé gắn một ghế của một suất chiếu. */
@Entity
@Table(name = "VE")
public class Ve {
    @Id
    @Column(name = "maVe")
    private String maVe;

    @Column(name = "maDonHang")
    private String maDonHang;

    @Column(name = "maGiaVe")
    private String maGiaVe;

    @Column(name = "donGia")
    private BigDecimal donGia;

    @Column(name = "maGheSuat")
    private String maGheSuat;

    @Column(name = "maQR")
    private String maQR;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiVe trangThai;

    @Column(name = "thoiDiemCheckIn")
    private LocalDateTime thoiDiemCheckIn;

    public String getMaVe() { return maVe; }
    public void setMaVe(String maVe) { this.maVe = maVe; }
    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
    public String getMaGiaVe() { return maGiaVe; }
    public void setMaGiaVe(String maGiaVe) { this.maGiaVe = maGiaVe; }
    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
    public String getMaGheSuat() { return maGheSuat; }
    public void setMaGheSuat(String maGheSuat) { this.maGheSuat = maGheSuat; }
    public String getMaQR() { return maQR; }
    public void setMaQR(String maQR) { this.maQR = maQR; }
    public TrangThaiVe getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiVe trangThai) { this.trangThai = trangThai; }
    public LocalDateTime getThoiDiemCheckIn() { return thoiDiemCheckIn; }
    public void setThoiDiemCheckIn(LocalDateTime thoiDiemCheckIn) { this.thoiDiemCheckIn = thoiDiemCheckIn; }
}
