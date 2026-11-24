package com.cinema.entity;

import com.cinema.enums.LoaiPhong;
import com.cinema.enums.TrangThaiPhong;
import jakarta.persistence.*;

/** Lớp PhongChieu (báo cáo 3.7.3.6) - bảng PHONGCHIEU. */
@Entity
@Table(name = "PHONGCHIEU")
public class PhongChieu {
    @Id
    @Column(name = "maPhong")
    private String maPhong;

    @Column(name = "tenPhong")
    private String tenPhong;

    @Convert(converter = LoaiPhongConverter.class)
    @Column(name = "loaiPhong")
    private LoaiPhong loaiPhong;

    @Column(name = "soLuongGhe")
    private int soLuongGhe;

    @Column(name = "tongSoHang")
    private int tongSoHang;

    @Column(name = "tongSoCot")
    private int tongSoCot;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiPhong trangThai;

    /** Phòng chỉ được dùng để xếp lịch và bán vé khi đang hoạt động. */
    public boolean dangHoatDong() {
        return trangThai == TrangThaiPhong.HOAT_DONG;
    }

    public String getMaPhong() { return maPhong; }
    public void setMaPhong(String maPhong) { this.maPhong = maPhong; }
    public String getTenPhong() { return tenPhong; }
    public void setTenPhong(String tenPhong) { this.tenPhong = tenPhong; }
    public LoaiPhong getLoaiPhong() { return loaiPhong; }
    public void setLoaiPhong(LoaiPhong loaiPhong) { this.loaiPhong = loaiPhong; }
    public int getSoLuongGhe() { return soLuongGhe; }
    public void setSoLuongGhe(int soLuongGhe) { this.soLuongGhe = soLuongGhe; }
    public int getTongSoHang() { return tongSoHang; }
    public void setTongSoHang(int tongSoHang) { this.tongSoHang = tongSoHang; }
    public int getTongSoCot() { return tongSoCot; }
    public void setTongSoCot(int tongSoCot) { this.tongSoCot = tongSoCot; }
    public TrangThaiPhong getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiPhong trangThai) { this.trangThai = trangThai; }
}
