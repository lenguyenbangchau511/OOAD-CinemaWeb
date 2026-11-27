package com.cinema.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "CHITIETPHIEUNHAPKHO")
@IdClass(ChiTietPhieuNhapKho.Khoa.class)
public class ChiTietPhieuNhapKho {
    @Id
    @Column(name = "maSanPham", nullable = false, length = 10)
    private String maSanPham;

    @Id
    @Column(name = "maPhieuNhap", nullable = false, length = 20)
    private String maPhieuNhap;

    @Column(name = "soLuongNhap", nullable = false)
    private int soLuongNhap;

    @Column(name = "donGiaNhap", nullable = false, precision = 18, scale = 2)
    private BigDecimal donGiaNhap;

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getMaPhieuNhap() { return maPhieuNhap; }
    public void setMaPhieuNhap(String maPhieuNhap) { this.maPhieuNhap = maPhieuNhap; }

    public int getSoLuongNhap() { return soLuongNhap; }
    public void setSoLuongNhap(int soLuongNhap) { this.soLuongNhap = soLuongNhap; }

    public BigDecimal getDonGiaNhap() { return donGiaNhap; }
    public void setDonGiaNhap(BigDecimal donGiaNhap) { this.donGiaNhap = donGiaNhap; }

    public static class Khoa implements Serializable {
        private static final long serialVersionUID = 1L;

        private String maSanPham;
        private String maPhieuNhap;

        public Khoa() {
        }

        public Khoa(String maSanPham, String maPhieuNhap) {
            this.maSanPham = maSanPham;
            this.maPhieuNhap = maPhieuNhap;
        }

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof Khoa khoa)) {
                return false;
            }
            return Objects.equals(maSanPham, khoa.maSanPham)
                    && Objects.equals(maPhieuNhap, khoa.maPhieuNhap);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maSanPham, maPhieuNhap);
        }
    }
}
