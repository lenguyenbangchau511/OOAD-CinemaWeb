package com.cinema.util;

import com.cinema.enums.VaiTro;

/** Thông tin người đang đăng nhập lấy từ HttpSession (xem {@link PhienDangNhap}). */
public record NguoiDung(String maTaiKhoan, VaiTro vaiTro, String maKhachHang, String maNhanVien) {

    /** Mã dùng làm "chủ" của phiên giữ ghế: mã khách hàng (đặt online) hoặc mã nhân viên (bán tại quầy). */
    public String maChuPhien() {
        return maKhachHang != null ? maKhachHang : maNhanVien;
    }

    public boolean laKhachHang() { return vaiTro == VaiTro.KHACH_HANG; }

    public boolean laNhanVienHoacQuanLy() {
        return vaiTro == VaiTro.NHAN_VIEN || vaiTro == VaiTro.QUAN_LY;
    }
}
