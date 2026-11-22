package com.cinema.entity;

import com.cinema.enums.KenhBanVe;
import com.cinema.enums.TrangThaiDonHang;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Lớp DonHang (báo cáo 3.7.3.9) - bảng DONHANG. tongTien là số tiền cuối cùng khách phải trả (đã trừ giảm giá). */
@Entity
@Table(name = "DONHANG")
public class DonHang {
    @Id
    @Column(name = "maDonHang")
    private String maDonHang;

    @Column(name = "maKhachHang")
    private String maKhachHang;

    @Column(name = "maNhanVien")
    private String maNhanVien;

    @Column(name = "maKhuyenMai")
    private String maKhuyenMai;

    @Column(name = "ngayDat")
    private LocalDateTime ngayDat;

    @Column(name = "tongTien")
    private BigDecimal tongTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "kenhBan")
    private KenhBanVe kenhBan;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai")
    private TrangThaiDonHang trangThai;

    @Column(name = "soTienGiamTuKhuyenMai")
    private BigDecimal soTienGiamTuKhuyenMai;

    @Column(name = "diemSuDung")
    private int diemSuDung;

    @Column(name = "soTienGiamTuDiem")
    private BigDecimal soTienGiamTuDiem;

    public String getMaDonHang() { return maDonHang; }
    public void setMaDonHang(String maDonHang) { this.maDonHang = maDonHang; }
    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }
    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }
    public String getMaKhuyenMai() { return maKhuyenMai; }
    public void setMaKhuyenMai(String maKhuyenMai) { this.maKhuyenMai = maKhuyenMai; }
    public LocalDateTime getNgayDat() { return ngayDat; }
    public void setNgayDat(LocalDateTime ngayDat) { this.ngayDat = ngayDat; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
    public KenhBanVe getKenhBan() { return kenhBan; }
    public void setKenhBan(KenhBanVe kenhBan) { this.kenhBan = kenhBan; }
    public TrangThaiDonHang getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiDonHang trangThai) { this.trangThai = trangThai; }
    public BigDecimal getSoTienGiamTuKhuyenMai() { return soTienGiamTuKhuyenMai; }
    public void setSoTienGiamTuKhuyenMai(BigDecimal v) { this.soTienGiamTuKhuyenMai = v; }
    public int getDiemSuDung() { return diemSuDung; }
    public void setDiemSuDung(int diemSuDung) { this.diemSuDung = diemSuDung; }
    public BigDecimal getSoTienGiamTuDiem() { return soTienGiamTuDiem; }
    public void setSoTienGiamTuDiem(BigDecimal v) { this.soTienGiamTuDiem = v; }
}
