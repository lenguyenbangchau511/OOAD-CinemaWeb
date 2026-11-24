package com.cinema.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/** Lớp ChiTietDichVu (báo cáo 3.7.3.12) - bảng CHITIETDICHVU. Mỗi dòng là một sản phẩm HOẶC một combo. */
@Entity
@Table(name = "CHITIETDICHVU")
public class ChiTietDichVu {
    @Id
    @Column(name = "maChiTietDV")
    private String maChiTietDV;

    @Column(name = "maDonHang")
    private String maDonHang;

    @Column(name = "maCombo")
    private String maCombo;

    @Column(name = "maSanPham")
    private String maSanPham;

    @Column(name = "soLuong")
    private int soLuong;

    @Column(name = "donGia")
    private BigDecimal donGia;

    @Column(name = "thanhTien")
    private BigDecimal thanhTien;

    public String getMaChiTietDV() { return maChiTietDV; }
    public void setMaChiTietDV(String maChiTietDV) { this.maChiTietDV = maChiTietDV; }
    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
    public String getMaCombo() { return maCombo; }
    public void setMaCombo(String maCombo) { this.maCombo = maCombo; }
    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }
    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }
    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
    public BigDecimal getThanhTien() { return thanhTien; }
    public void setThanhTien(BigDecimal thanhTien) { this.thanhTien = thanhTien; }
}
