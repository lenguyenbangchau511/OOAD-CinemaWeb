package com.cinema.entity;

import com.cinema.enums.LoaiGiaoDich;
import com.cinema.enums.PhuongThucThanhToan;
import com.cinema.enums.TrangThaiThanhToan;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lớp ThanhToan (báo cáo 3.7.3.13) - bảng THANHTOAN: giao dịch thanh toán / hoàn tiền của đơn hàng. */
@Entity
@Table(name = "THANHTOAN")
public class ThanhToan {
    @Id
    @Column(name = "maThanhToan")
    private String maThanhToan;

    @Column(name = "maDonHang")
    private String maDonHang;

    @Enumerated(EnumType.STRING)
    @Column(name = "phuongThuc")
    private PhuongThucThanhToan phuongThuc;

    @Column(name = "soTien")
    private BigDecimal soTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiGiaoDich")
    private LoaiGiaoDich loaiGiaoDich;

    @Column(name = "thoiGianGiaoDich")
    private LocalDateTime thoiGianGiaoDich;

    @Column(name = "maGiaoDichDoiTac")
    private String maGiaoDichDoiTac;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiThanhToan trangThai;

    public String getMaThanhToan() { return maThanhToan; }
    public void setMaThanhToan(String maThanhToan) { this.maThanhToan = maThanhToan; }
    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
    public PhuongThucThanhToan getPhuongThuc() { return phuongThuc; }
    public void setPhuongThuc(PhuongThucThanhToan phuongThuc) { this.phuongThuc = phuongThuc; }
    public BigDecimal getSoTien() { return soTien; }
    public void setSoTien(BigDecimal soTien) { this.soTien = soTien; }
    public LoaiGiaoDich getLoaiGiaoDich() { return loaiGiaoDich; }
    public void setLoaiGiaoDich(LoaiGiaoDich loaiGiaoDich) { this.loaiGiaoDich = loaiGiaoDich; }
    public LocalDateTime getThoiGianGiaoDich() { return thoiGianGiaoDich; }
    public void setThoiGianGiaoDich(LocalDateTime t) { this.thoiGianGiaoDich = t; }
    public String getMaGiaoDichDoiTac() { return maGiaoDichDoiTac; }
    public void setMaGiaoDichDoiTac(String m) { this.maGiaoDichDoiTac = m; }
    public TrangThaiThanhToan getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiThanhToan trangThai) { this.trangThai = trangThai; }
}
