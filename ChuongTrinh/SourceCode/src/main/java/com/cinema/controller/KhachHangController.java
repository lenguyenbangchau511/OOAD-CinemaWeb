package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.util.NguoiDung;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Giao diện 28 - Hồ sơ khách hàng và điểm thành viên (UC7.2, UC7.6).
 * Chỉ đọc: không sửa điểm. Chỉnh sửa hồ sơ là giao diện mẫu.
 */
@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public KhachHangController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    /** Khách hàng xem hồ sơ của chính mình. */
    @GetMapping("/toi")
    public Map<String, Object> cuaToi(HttpSession session) {
        NguoiDung nd = dangNhap.yeuCau(session, VaiTro.KHACH_HANG);
        return hoSo(nd.maKhachHang());
    }

    /** Admin, Quản lý, Nhân viên xem hồ sơ khách hàng được chọn. */
    @GetMapping("/{ma}")
    public Map<String, Object> theoMa(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.ADMIN, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return hoSo(ma);
    }

    /** Thông tin cá nhân + điểm hiện có + lịch sử biến động điểm (mới nhất trước). Không lấy mật khẩu. */
    private Map<String, Object> hoSo(String ma) {
        List<Map<String, Object>> ds = jdbc.queryForList("""
                SELECT k.maKhachHang, k.hoTen, k.soDienThoai, k.diemTichLuy,
                       t.tenDangNhap, t.email, t.trangThai AS trangThaiTaiKhoan
                FROM KHACHHANG k JOIN TAIKHOAN t ON t.maTaiKhoan = k.maTaiKhoan
                WHERE k.maKhachHang = ?
                """, ma);
        if (ds.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "KHONG_TIM_THAY", "Không tìm thấy hồ sơ khách hàng");
        }
        Map<String, Object> kq = new LinkedHashMap<>(ds.get(0));
        kq.put("giaoDichDiem", jdbc.queryForList("""
                SELECT maGiaoDichDiem, diemThayDoi, lyDo, maDonHang,
                       DATE_FORMAT(thoiGian, '%Y-%m-%dT%H:%i:%s') AS thoiGian
                FROM GIAODICHDIEM
                WHERE maKhachHang = ?
                ORDER BY thoiGian DESC, maGiaoDichDiem DESC
                """, ma));
        return kq;
    }
}