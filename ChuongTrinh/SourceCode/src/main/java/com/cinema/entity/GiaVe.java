package com.cinema.entity;

import com.cinema.enums.DoiTuongKhachHang;
import com.cinema.enums.LoaiGhe;
import com.cinema.enums.LoaiNgay;
import com.cinema.enums.LoaiVe;
import com.cinema.enums.TrangThaiGiaVe;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "GIAVE")
public class GiaVe {
    @Id
    @Column(name = "maGiaVe", nullable = false, length = 10)
    private String maGiaVe;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiVe", nullable = false, length = 30)
    private LoaiVe loaiVe;

    @Enumerated(EnumType.STRING)
    @Column(name = "doiTuongKhachHang", nullable = false, length = 30)
    private DoiTuongKhachHang doiTuongKhachHang;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiGhe", nullable = false, length = 30)
    private LoaiGhe loaiGhe;

    @Column(name = "mucGia", nullable = false, precision = 18, scale = 2)
    private BigDecimal mucGia;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiNgay", nullable = false, length = 30)
    private LoaiNgay loaiNgay;

    @Column(name = "khungGioBatDau", nullable = false)
    private LocalTime khungGioBatDau;

    @Column(name = "khungGioKetThuc", nullable = false)
    private LocalTime khungGioKetThuc;

    @Column(name = "ngayBatDau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngayKetThuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiGiaVe trangThai;

    public String getMaGiaVe() { return maGiaVe; }
    public void setMaGiaVe(String maGiaVe) { this.maGiaVe = maGiaVe; }

    public LoaiVe getLoaiVe() { return loaiVe; }
    public void setLoaiVe(LoaiVe loaiVe) { this.loaiVe = loaiVe; }

    public DoiTuongKhachHang getDoiTuongKhachHang() { return doiTuongKhachHang; }
    public void setDoiTuongKhachHang(DoiTuongKhachHang doiTuongKhachHang) { this.doiTuongKhachHang = doiTuongKhachHang; }

    public LoaiGhe getLoaiGhe() { return loaiGhe; }
    public void setLoaiGhe(LoaiGhe loaiGhe) { this.loaiGhe = loaiGhe; }

    public BigDecimal getMucGia() { return mucGia; }
    public void setMucGia(BigDecimal mucGia) { this.mucGia = mucGia; }

    public LoaiNgay getLoaiNgay() { return loaiNgay; }
    public void setLoaiNgay(LoaiNgay loaiNgay) { this.loaiNgay = loaiNgay; }

    public LocalTime getKhungGioBatDau() { return khungGioBatDau; }
    public void setKhungGioBatDau(LocalTime khungGioBatDau) { this.khungGioBatDau = khungGioBatDau; }

    public LocalTime getKhungGioKetThuc() { return khungGioKetThuc; }
    public void setKhungGioKetThuc(LocalTime khungGioKetThuc) { this.khungGioKetThuc = khungGioKetThuc; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }

    public TrangThaiGiaVe getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiGiaVe trangThai) { this.trangThai = trangThai; }
}
