package com.cinema.entity;

import com.cinema.enums.LoaiBienDongKho;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LICHSUBIENDONGKHO")
public class LichSuBienDongKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maBienDong", nullable = false)
    private Long maBienDong;

    @Column(name = "maSanPham", nullable = false, length = 10)
    private String maSanPham;

    @Column(name = "maNhanVien", length = 10)
    private String maNhanVien;

    @Column(name = "thoiDiem", nullable = false)
    private LocalDateTime thoiDiem;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai", nullable = false, length = 30)
    private LoaiBienDongKho loai;

    @Column(name = "soLuongThayDoi", nullable = false)
    private int soLuongThayDoi;

    @Column(name = "tonTruoc", nullable = false)
    private int tonTruoc;

    @Column(name = "tonSau", nullable = false)
    private int tonSau;

    @Column(name = "maThamChieu", nullable = false, length = 50)
    private String maThamChieu;

    @Column(name = "ghiChu", columnDefinition = "TEXT")
    private String ghiChu;

    public Long getMaBienDong() { return maBienDong; }
    public void setMaBienDong(Long maBienDong) { this.maBienDong = maBienDong; }

    public String getMaSanPham() { return maSanPham; }
    public void setMaSanPham(String maSanPham) { this.maSanPham = maSanPham; }

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }

    public LocalDateTime getThoiDiem() { return thoiDiem; }
    public void setThoiDiem(LocalDateTime thoiDiem) { this.thoiDiem = thoiDiem; }

    public LoaiBienDongKho getLoai() { return loai; }
    public void setLoai(LoaiBienDongKho loai) { this.loai = loai; }

    public int getSoLuongThayDoi() { return soLuongThayDoi; }
    public void setSoLuongThayDoi(int soLuongThayDoi) { this.soLuongThayDoi = soLuongThayDoi; }

    public int getTonTruoc() { return tonTruoc; }
    public void setTonTruoc(int tonTruoc) { this.tonTruoc = tonTruoc; }

    public int getTonSau() { return tonSau; }
    public void setTonSau(int tonSau) { this.tonSau = tonSau; }

    public String getMaThamChieu() { return maThamChieu; }
    public void setMaThamChieu(String maThamChieu) { this.maThamChieu = maThamChieu; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}
