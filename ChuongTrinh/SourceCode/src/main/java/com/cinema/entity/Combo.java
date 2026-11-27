package com.cinema.entity;

import com.cinema.enums.TrangThaiCombo;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "COMBO")
public class Combo {
    @Id
    @Column(name = "maCombo", nullable = false, length = 10)
    private String maCombo;

    @Column(name = "tenCombo", nullable = false, length = 100)
    private String tenCombo;

    @Column(name = "giaCombo", nullable = false, precision = 18, scale = 2)
    private BigDecimal giaCombo;

    @Column(name = "hinhAnh", length = 255)
    private String hinhAnh;

    @Column(name = "moTa", nullable = false, length = 255)
    private String moTa;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiCombo trangThai;

    @OneToMany(mappedBy = "combo")
    private List<ChiTietCombo> thanhPhan = List.of();

    public String getMaCombo() { return maCombo; }
    public void setMaCombo(String maCombo) { this.maCombo = maCombo; }

    public String getTenCombo() { return tenCombo; }
    public void setTenCombo(String tenCombo) { this.tenCombo = tenCombo; }

    public BigDecimal getGiaCombo() { return giaCombo; }
    public void setGiaCombo(BigDecimal giaCombo) { this.giaCombo = giaCombo; }

    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public TrangThaiCombo getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiCombo trangThai) { this.trangThai = trangThai; }

    public List<ChiTietCombo> getThanhPhan() { return List.copyOf(thanhPhan); }
}
