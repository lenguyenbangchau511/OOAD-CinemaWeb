package com.cinema.entity;

import com.cinema.enums.LoaiSanPham;
import com.cinema.enums.TinhTrangTon;
import com.cinema.enums.TrangThaiSanPham;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "SANPHAM")
public class SanPham {
    @Id
    @Column(name = "maSanPham", nullable = false, length = 10)
    private String maSanPham;

    @Column(name = "tenSanPham", nullable = false, length = 100)
    private String tenSanPham;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiSanPham", nullable = false, length = 30)
    private LoaiSanPham loaiSanPham;

    @Column(name = "donViTinh", nullable = false, length = 20)
    private String donViTinh;

    @Column(name = "giaBan", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaBan;

    @Column(name = "moTa", nullable = false, columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiSanPham trangThai;

    @Column(name = "soLuongTon", nullable = false)
    private int soLuongTon;

    @Column(name = "mucTonToiThieu", nullable = false)
    private int mucTonToiThieu;

    public TinhTrangTon xacDinhTinhTrang() {
        if (soLuongTon == 0) {
            return TinhTrangTon.HET_HANG;
        }
        return soLuongTon <= mucTonToiThieu ? TinhTrangTon.SAP_HET : TinhTrangTon.DU_HANG;
    }

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getTenSanPham() { return tenSanPham; }
    public void setTenSanPham(String tenSanPham) { this.tenSanPham = tenSanPham; }

    public LoaiSanPham getLoaiSanPham() { return loaiSanPham; }
    public void setLoaiSanPham(LoaiSanPham loaiSanPham) { this.loaiSanPham = loaiSanPham; }

    public String getDonViTinh() { return donViTinh; }
    public void setDonViTinh(String donViTinh) { this.donViTinh = donViTinh; }

    public BigDecimal getGiaBan() { return giaBan; }
    public void setGiaBan(BigDecimal giaBan) { this.giaBan = giaBan; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }

    public TrangThaiSanPham getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiSanPham trangThai) { this.trangThai = trangThai; }

    public int getSoLuongTon() { return soLuongTon; }
    public void setSoLuongTon(int soLuongTon) { this.soLuongTon = soLuongTon; }

    public int getMucTonToiThieu() { return mucTonToiThieu; }
    public void setMucTonToiThieu(int mucTonToiThieu) { this.mucTonToiThieu = mucTonToiThieu; }
}
