package com.cinema.entity;

import com.cinema.enums.TrangThaiGheSuat;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lớp GheSuatChieu (báo cáo 3.7.3.10) - bảng GHESUATCHIEU: giá và trạng thái của ghế trong từng suất. */
@Entity
@Table(name = "GHESUATCHIEU")
public class GheSuatChieu {
    @Id
    @Column(name = "maGheSuat")
    private String maGheSuat;

    @Column(name = "maSuat")
    private String maSuat;

    @Column(name = "maGhe")
    private String maGhe;

    @Column(name = "giaVe")
    private BigDecimal giaVe;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiGheSuat trangThai;

    /** Thời điểm bắt đầu giữ ghế; thời điểm hết hạn = thoiGianGiu + số phút giữ ghế theo cấu hình rạp. */
    @Column(name = "thoiGianGiu")
    private LocalDateTime thoiGianGiu;

    @Column(name = "maPhienGiu")
    private String maPhienGiu;

    /** khoaGiuGhe: giữ ghế khi ghế đang trống. Trả true nếu giữ được (hoặc ghế đã thuộc chính phiên này). */
    public boolean khoaGiuGhe(String maPhien, LocalDateTime thoiGian) {
        if (trangThai == TrangThaiGheSuat.DANG_GIU && maPhien.equals(maPhienGiu)) {
            return true;
        }
        if (trangThai != TrangThaiGheSuat.TRONG) {
            return false;
        }
        trangThai = TrangThaiGheSuat.DANG_GIU;
        thoiGianGiu = thoiGian;
        maPhienGiu = maPhien;
        return true;
    }

    /** giaiPhongGhe: trả ghế đang giữ về trống (ghế đã bán thì không được giải phóng). */
    public boolean giaiPhongGhe() {
        if (trangThai != TrangThaiGheSuat.DANG_GIU) {
            return false;
        }
        trangThai = TrangThaiGheSuat.TRONG;
        thoiGianGiu = null;
        maPhienGiu = null;
        return true;
    }

    /** Ghế đã thanh toán: chuyển sang đã đặt, xóa thông tin giữ ghế. */
    public void danhDauDaDat() {
        trangThai = TrangThaiGheSuat.DA_DAT;
        thoiGianGiu = null;
        maPhienGiu = null;
    }

    public boolean thuocPhien(String maPhien) {
        return trangThai == TrangThaiGheSuat.DANG_GIU && maPhien != null && maPhien.equals(maPhienGiu);
    }

    public String getMaGheSuat() { return maGheSuat; }
    public void setMaGheSuat(String maGheSuat) { this.maGheSuat = maGheSuat; }
    public String getMaSuat() { return maSuat; }
    public void setMaSuat(String maSuat) { this.maSuat = maSuat; }
    public String getMaGhe() { return maGhe; }
    public void setMaGhe(String maGhe) { this.maGhe = maGhe; }
    public BigDecimal getGiaVe() { return giaVe; }
    public void setGiaVe(BigDecimal giaVe) { this.giaVe = giaVe; }
    public TrangThaiGheSuat getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiGheSuat trangThai) { this.trangThai = trangThai; }
    public LocalDateTime getThoiGianGiu() { return thoiGianGiu; }
    public void setThoiGianGiu(LocalDateTime thoiGianGiu) { this.thoiGianGiu = thoiGianGiu; }
    public String getMaPhienGiu() { return maPhienGiu; }
    public void setMaPhienGiu(String maPhienGiu) { this.maPhienGiu = maPhienGiu; }
}
