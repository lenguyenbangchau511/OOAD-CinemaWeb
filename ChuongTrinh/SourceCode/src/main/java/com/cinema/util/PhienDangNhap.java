package com.cinema.util;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * ĐIỂM NỐI VỚI MODULE ĐĂNG NHẬP (giao diện 1 - Trịnh Thanh Hiền).
 *
 * Khi đăng nhập thành công, AuthController phải lưu vào HttpSession các thuộc tính:
 *   "maTaiKhoan" (String), "vaiTro" (String: ADMIN | QUAN_LY | NHAN_VIEN | KHACH_HANG),
 *   "maKhachHang" (String, chỉ có với khách hàng), "maNhanVien" (String, chỉ có với nhân viên/quản lý/admin).
 * Nếu module đăng nhập dùng tên khác chỉ cần sửa đúng file này.
 *
 * Chế độ thử khi CHƯA có đăng nhập: đặt trong application.properties
 *   cinema.dev.vai-tro=KHACH_HANG
 *   cinema.dev.ma-khach-hang=KH01
 * (xóa 3 dòng này khi đã ghép đăng nhập).
 */
@Component
public class PhienDangNhap {

    @Value("${cinema.dev.vai-tro:}")
    private String devVaiTro;
    @Value("${cinema.dev.ma-khach-hang:}")
    private String devMaKhachHang;
    @Value("${cinema.dev.ma-nhan-vien:}")
    private String devMaNhanVien;

    /** Trả người dùng hiện tại hoặc null nếu chưa đăng nhập. */
    public NguoiDung layNguoiDung(HttpSession session) {
        Object vaiTro = session == null ? null : session.getAttribute("vaiTro");
        if (vaiTro != null) {
            return new NguoiDung(
                    (String) session.getAttribute("maTaiKhoan"),
                    VaiTro.valueOf(vaiTro.toString()),
                    (String) session.getAttribute("maKhachHang"),
                    (String) session.getAttribute("maNhanVien"));
        }
        if (!devVaiTro.isBlank()) {
            return new NguoiDung("DEV", VaiTro.valueOf(devVaiTro), blankThanhNull(devMaKhachHang), blankThanhNull(devMaNhanVien));
        }
        return null;
    }

    /** Bắt buộc đã đăng nhập (và đúng vai trò nếu có truyền vai trò). */
    public NguoiDung yeuCau(HttpSession session, VaiTro... duocPhep) {
        NguoiDung nd = layNguoiDung(session);
        if (nd == null) {
            throw new NghiepVuException(HttpStatus.UNAUTHORIZED, "CHUA_DANG_NHAP", "Vui lòng đăng nhập để tiếp tục");
        }
        if (duocPhep.length > 0) {
            for (VaiTro v : duocPhep) {
                if (v == nd.vaiTro()) return nd;
            }
            throw new NghiepVuException(HttpStatus.FORBIDDEN, "KHONG_CO_QUYEN", "Bạn không có quyền thực hiện chức năng này");
        }
        return nd;
    }

    private static String blankThanhNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}
