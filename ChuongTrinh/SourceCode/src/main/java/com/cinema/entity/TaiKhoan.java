package com.cinema.entity;

import com.cinema.enums.TrangThaiTaiKhoan;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.cinema.enums.VaiTro;
import jakarta.persistence.*;

@Entity
@Table(name = "TAIKHOAN")
public class TaiKhoan {
    @Id
    @Column(name = "maTaiKhoan", nullable = false, length = 10)
    private String maTaiKhoan;

    @Column(name = "tenDangNhap", nullable = false, length = 50)
    private String tenDangNhap;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "matKhauHash", nullable = false, length = 255)
    private String matKhauHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "vaiTro", nullable = false, length = 30)
    private VaiTro vaiTro;

    @Enumerated(EnumType.STRING)
    @Column(name = "trangThai", nullable = false, length = 30)
    private TrangThaiTaiKhoan trangThai;

    public String getMaTaiKhoan() { return maTaiKhoan; }
    public void setMaTaiKhoan(String maTaiKhoan) { this.maTaiKhoan = maTaiKhoan; }

    public String getTenDangNhap() { return tenDangNhap; }
    public void setTenDangNhap(String tenDangNhap) { this.tenDangNhap = tenDangNhap; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @JsonIgnore
    public String getMatKhauHash() { return matKhauHash; }
    public void setMatKhauHash(String matKhauHash) { this.matKhauHash = matKhauHash; }

    public VaiTro getVaiTro() { return vaiTro; }
    public void setVaiTro(VaiTro vaiTro) { this.vaiTro = vaiTro; }

    public TrangThaiTaiKhoan getTrangThai() { return trangThai; }
    public void setTrangThai(TrangThaiTaiKhoan trangThai) { this.trangThai = trangThai; }
}
