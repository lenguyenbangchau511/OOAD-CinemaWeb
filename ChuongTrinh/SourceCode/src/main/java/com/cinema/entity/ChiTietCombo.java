package com.cinema.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "CHITIETCOMBO")
@IdClass(ChiTietCombo.Khoa.class)
public class ChiTietCombo {
    @Id
    @Column(name = "maCombo", nullable = false, length = 10)
    private String maCombo;

    @Id
    @Column(name = "maSanPham", nullable = false, length = 10)
    private String maSanPham;

    @Column(name = "soLuong", nullable = false)
    private int soLuong;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "maCombo", insertable = false, updatable = false)
    private Combo combo;

    public String getMaCombo() { return maCombo; }
    public void setMaCombo(String maCombo) { this.maCombo = maCombo; }

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public static class Khoa implements Serializable {
        private static final long serialVersionUID = 1L;

        private String maCombo;
        private String maSanPham;

        public Khoa() {
        }

        public Khoa(String maCombo, String maSanPham) {
            this.maCombo = maCombo;
            this.maSanPham = maSanPham;
        }

        @Override
        public boolean equals(Object other) {
            if (!(other instanceof Khoa khoa)) {
                return false;
            }
            return Objects.equals(maCombo, khoa.maCombo)
                    && Objects.equals(maSanPham, khoa.maSanPham);
        }

        @Override
        public int hashCode() {
            return Objects.hash(maCombo, maSanPham);
        }
    }
}
