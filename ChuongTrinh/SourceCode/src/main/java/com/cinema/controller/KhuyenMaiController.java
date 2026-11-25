package com.cinema.controller;

import com.cinema.util.NguoiDung;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Giao diện 36, 37 - Đọc danh sách khuyến mãi (UC9.4, UC9.5).
 * Thêm, sửa, xóa khuyến mãi là giao diện mẫu nên không có API ghi dữ liệu.
 */
@RestController
@RequestMapping("/api/khuyen-mai")
public class KhuyenMaiController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public KhuyenMaiController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(HttpSession session) {
        NguoiDung nd = dangNhap.yeuCau(session);
        // UC9.4: khách hàng chỉ xem chương trình đang công bố; quản lý, nhân viên xem tất cả.
        String dieuKien = nd.laKhachHang() ? "WHERE trangThai = 'DANG_AP_DUNG'" : "";
        return jdbc.queryForList("""
                SELECT maKhuyenMai, tenChuongTrinh, noiDung, hinhThucGiam, mucGiam,
                       DATE_FORMAT(ngayBatDau, '%Y-%m-%d') AS ngayBatDau,
                       DATE_FORMAT(ngayKetThuc, '%Y-%m-%d') AS ngayKetThuc,
                       phamViApDung, doiTuongApDung, kenhBan, giaTriDonToiThieu,
                       gioiHanLuotSuDung, soLuotDaSuDung, mucUuTien, trangThai
                FROM KHUYENMAI
                """ + dieuKien + " ORDER BY mucUuTien, maKhuyenMai");
    }
}