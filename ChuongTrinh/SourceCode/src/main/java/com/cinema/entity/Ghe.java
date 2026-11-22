package com.cinema.entity;

import com.cinema.enums.LoaiGhe;
import com.cinema.enums.TrangThaiGhe;
import jakarta.persistence.*;

/** Lớp Ghe (báo cáo 3.7.3.7) - bảng GHE. Ghế thuộc đúng một phòng chiếu. */
@Entity
@Table(name = "GHE")
public class Ghe {
    @Id
    @Column(name = "maGhe")
    private String maGhe;

    @Column(name = "maPhong")
    private String maPhong;

    /** Tên ghế dạng hàng + số cột, ví dụ A01, B10. */
    @Column(name = "tenGhe")
    private String tenGhe;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiGhe")
    private LoaiGhe loaiGhe;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiGhe trangThai;

    /** Ghế hỏng được hiển thị là "bảo trì" và không được chọn. */
    public boolean dungDuoc() {
        return trangThai == TrangThaiGhe.BINH_THUONG;
    }

    /** Hàng ghế: phần chữ của tên ghế (A01 -> A). */
    public String layHang() {
        return tenGhe.replaceAll("[0-9]", "");
    }

    /** Cột ghế: phần số của tên ghế (A01 -> 1). */
    public int layCot() {
        String so = tenGhe.replaceAll("[^0-9]", "");
        return so.isEmpty() ? 0 : Integer.parseInt(so);
    }

    public String getMaGhe() { return maGhe; }
    public void setMaGhe(String maGhe) { this.maGhe = maGhe; }
    public String getMaPhong() { return maPhong; }
    public void setMaPhong(String maPhong) { this.maPhong = maPhong; }
    public String getTenGhe() { return tenGhe; }
    public void setTenGhe(String tenGhe) { this.tenGhe = tenGhe; }
    public LoaiGhe getLoaiGhe() { return loaiGhe; }
    public void setLoaiGhe(LoaiGhe loaiGhe) { this.loaiGhe = loaiGhe; }
    public TrangThaiGhe getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiGhe trangThai) { this.trangThai = trangThai; }
}
