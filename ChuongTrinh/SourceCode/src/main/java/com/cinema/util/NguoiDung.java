package com.cinema.util;

import com.cinema.enums.VaiTro;

/** Thông tin người đang đăng nhập lấy từ HttpSession (xem {@link PhienDangNhap}). */
public record NguoiDung(String maTaiKhoan, VaiTro vaiTro, String maKhachHang, String maNhanVien) {

    public boolean laKhachHang() { return vaiTro == VaiTro.KHACH_HANG; }

    public boolean laNhanVienHoacQuanLy() {
        return vaiTro == VaiTro.NHAN_VIEN || vaiTro == VaiTro.QUAN_LY;
    }
}
