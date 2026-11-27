package com.cinema.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GIAODICHDIEM")
public class GiaoDichDiem {
    @Id
    @Column(name = "maGiaoDichDiem", nullable = false, length = 10)
    private String maGiaoDichDiem;

    @Column(name = "maKhachHang", nullable = false, length = 10)
    private String maKhachHang;

    @Column(name = "diemThayDoi", nullable = false)
    private int diemThayDoi;

    @Column(name = "thoiGian", nullable = false)
    private LocalDateTime thoiGian;

    @Column(name = "lyDo", nullable = false, length = 255)
    private String lyDo;

    @Column(name = "maDonHang", length = 10)
    private String maDonHang;

    public String getMaGiaoDichDiem() { return maGiaoDichDiem; }
    public void setMaGiaoDichDiem(String maGiaoDichDiem) { this.maGiaoDichDiem = maGiaoDichDiem; }

    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }

    public int getDiemThayDoi() { return diemThayDoi; }
    public void setDiemThayDoi(int diemThayDoi) { this.diemThayDoi = diemThayDoi; }

    public LocalDateTime getThoiGian() { return thoiGian; }
    public void setThoiGian(LocalDateTime thoiGian) { this.thoiGian = thoiGian; }

    public String getLyDo() { return lyDo; }
    public void setLyDo(String lyDo) { this.lyDo = lyDo; }

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
}
