package com.cinema.entity;

import com.cinema.enums.HinhThucGiam;
import com.cinema.enums.KenhBan;
import com.cinema.enums.PhamViApDung;
import com.cinema.enums.TrangThaiKhuyenMai;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "KHUYENMAI")
public class KhuyenMai {
    @Id
    @Column(name = "maKhuyenMai", nullable = false, length = 20)
    private String maKhuyenMai;

    @Column(name = "tenChuongTrinh", nullable = false, length = 100)
    private String tenChuongTrinh;

    @Column(name = "noiDung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Enumerated(EnumType.STRING)
    @Column(name = "hinhThucGiam", nullable = false, length = 30)
    private HinhThucGiam hinhThucGiam;

    @Column(name = "mucGiam", nullable = false, precision = 18, scale = 2)
    private BigDecimal mucGiam;

    @Column(name = "ngayBatDau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngayKetThuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Enumerated(EnumType.STRING)
    @Column(name = "phamViApDung", nullable = false, length = 30)
    private PhamViApDung phamViApDung;

    @Column(name = "doiTuongApDung", nullable = false, length = 20)
    private String doiTuongApDung;

    @Enumerated(EnumType.STRING)
    @Column(name = "kenhBan", nullable = false, length = 30)
    private KenhBan kenhBan;

    @Column(name = "giaTriDonToiThieu", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaTriDonToiThieu;

    @Column(name = "gioiHanLuotSuDung", nullable = false)
    private int gioiHanLuotSuDung;

    @Column(name = "soLuotDaSuDung", nullable = false)
    private int soLuotDaSuDung;

    @Column(name = "mucUuTien", nullable = false)
    private int mucUuTien;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiKhuyenMai trangThai;

    public String getMaKhuyenMai() { return maKhuyenMai; }
    public void setMaKhuyenMai(String maKhuyenMai) { this.maKhuyenMai = maKhuyenMai; }

    public String getTenChuongTrinh() { return tenChuongTrinh; }
    public void setTenChuongTrinh(String tenChuongTrinh) { this.tenChuongTrinh = tenChuongTrinh; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public HinhThucGiam getHinhThucGiam() { return hinhThucGiam; }
    public void setHinhThucGiam(HinhThucGiam hinhThucGiam) { this.hinhThucGiam = hinhThucGiam; }

    public BigDecimal getMucGiam() { return mucGiam; }
    public void setMucGiam(BigDecimal mucGiam) { this.mucGiam = mucGiam; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }

    public PhamViApDung getPhamViApDung() { return phamViApDung; }
    public void setPhamViApDung(PhamViApDung phamViApDung) { this.phamViApDung = phamViApDung; }

    public String getDoiTuongApDung() { return doiTuongApDung; }
    public void setDoiTuongApDung(String doiTuongApDung) { this.doiTuongApDung = doiTuongApDung; }

    public KenhBan getKenhBan() { return kenhBan; }
    public void setKenhBan(KenhBan kenhBan) { this.kenhBan = kenhBan; }

    public BigDecimal getGiaTriDonToiThieu() { return giaTriDonToiThieu; }
    public void setGiaTriDonToiThieu(BigDecimal giaTriDonToiThieu) { this.giaTriDonToiThieu = giaTriDonToiThieu; }

    public int getGioiHanLuotSuDung() { return gioiHanLuotSuDung; }
    public void setGioiHanLuotSuDung(int gioiHanLuotSuDung) { this.gioiHanLuotSuDung = gioiHanLuotSuDung; }

    public int getSoLuotDaSuDung() { return soLuotDaSuDung; }
    public void setSoLuotDaSuDung(int soLuotDaSuDung) { this.soLuotDaSuDung = soLuotDaSuDung; }

    public int getMucUuTien() { return mucUuTien; }
    public void setMucUuTien(int mucUuTien) { this.mucUuTien = mucUuTien; }

    public TrangThaiKhuyenMai getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiKhuyenMai trangThai) { this.trangThai = trangThai; }
}
