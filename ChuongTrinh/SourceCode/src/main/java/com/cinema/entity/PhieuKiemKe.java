package com.cinema.entity;

import com.cinema.enums.KetQuaKiemKe;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "PHIEUKIEMKE")
public class PhieuKiemKe {
    @Id
    @Column(name = "maPhieuKiemKe", nullable = false, length = 20)
    private String maPhieuKiemKe;

    @Column(name = "maNhanVien", nullable = false, length = 10)
    private String maNhanVien;

    @Column(name = "thoiDiemLap", nullable = false)
    private LocalDateTime thoiDiemLap;

    @Column(name = "thoiDiemXacNhan")
    private LocalDateTime thoiDiemXacNhan;

    @Column(name = "ghiChu", columnDefinition = "TEXT")
    private String ghiChu;

    public KetQuaKiemKe tinhKetQua(List<ChiTietPhieuKiemKe> chiTiet) {
        boolean coChenhLech = chiTiet.stream().anyMatch(dong -> dong.tinhChenhLech() != 0);
        return coChenhLech ? KetQuaKiemKe.CHENH_LECH : KetQuaKiemKe.KHOP;
    }

    public String getMaPhieuKiemKe() { return maPhieuKiemKe; }
    public void setMaPhieuKiemKe(String maPhieuKiemKe) { this.maPhieuKiemKe = maPhieuKiemKe; }

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }

    public LocalDateTime getThoiDiemLap() { return thoiDiemLap; }
    public void setThoiDiemLap(LocalDateTime thoiDiemLap) { this.thoiDiemLap = thoiDiemLap; }

    public LocalDateTime getThoiDiemXacNhan() { return thoiDiemXacNhan; }
    public void setThoiDiemXacNhan(LocalDateTime thoiDiemXacNhan) { this.thoiDiemXacNhan = thoiDiemXacNhan; }

    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}
