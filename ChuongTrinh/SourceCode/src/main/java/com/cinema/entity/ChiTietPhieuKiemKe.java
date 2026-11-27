package com.cinema.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "CHITIETPHIEUKIEMKE")
@IdClass(ChiTietPhieuKiemKe.Khoa.class)
public class ChiTietPhieuKiemKe {
    @Id
    @Column(name = "maSanPham", nullable = false, length = 10)
    private String maSanPham;

    @Id
    @Column(name = "maPhieuKiemKe", nullable = false, length = 20)
    private String maPhieuKiemKe;

    @Column(name = "soLuongHeThong", nullable = false)
    private int soLuongHeThong;

    @Column(name = "soLuongThucTe", nullable = false)
    private int soLuongThucTe;

    @Column(name = "lyDoChenhLech", columnDefinition = "TEXT")
    private String lyDoChenhLech;

    public int tinhChenhLech() {
        return soLuongThucTe - soLuongHeThong;
    }

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getMaPhieuKiemKe() { return maPhieuKiemKe; }
    public void setMaPhieuKiemKe(String maPhieuKiemKe) { this.maPhieuKiemKe = maPhieuKiemKe; }

    public int getSoLuongHeThong() { return soLuongHeThong; }
    public void setSoLuongHeThong(int soLuongHeThong) { this.soLuongHeThong = soLuongHeThong; }

    public int getSoLuongThucTe() { return soLuongThucTe; }
    public void setSoLuongThucTe(int soLuongThucTe) { this.soLuongThucTe = soLuongThucTe; }

    public String getLyDoChenhLech() { return lyDoChenhLech; }
    public void setLyDoChenhLech(String lyDoChenhLech) { this.lyDoChenhLech = lyDoChenhLech; }

    public static class Khoa implements Serializable {
        private static final long serialVersionUID = 1L;

        private String maSanPham;
        private String maPhieuKiemKe;

        public Khoa() {
        }

        public Khoa(String maSanPham, String maPhieuKiemKe) {
            this.maSanPham = maSanPham;
            this.maPhieuKiemKe = maPhieuKiemKe;
        }

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof Khoa khoa)) {
                return false;
            }
            return Objects.equals(maSanPham, khoa.maSanPham)
                    && Objects.equals(maPhieuKiemKe, khoa.maPhieuKiemKe);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maSanPham, maPhieuKiemKe);
        }
    }
}
