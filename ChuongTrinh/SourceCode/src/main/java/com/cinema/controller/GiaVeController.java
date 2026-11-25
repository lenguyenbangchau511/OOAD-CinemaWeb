package com.cinema.controller;

import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Giao diện 24, 25 - Đọc danh sách giá vé (UC6.4, UC6.5).
 * Thêm, sửa, xóa giá vé là giao diện mẫu nên không có API ghi dữ liệu.
 */
@RestController
@RequestMapping("/api/gia-ve")
public class GiaVeController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public GiaVeController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(HttpSession session) {
        dangNhap.yeuCau(session);   // UC6.4: người dùng đã đăng nhập
        // Đổi ngày giờ sang chuỗi để giao diện hiển thị đúng, không bị lệch múi giờ.
        return jdbc.queryForList("""
                SELECT maGiaVe, loaiVe, doiTuongKhachHang, loaiGhe, mucGia, loaiNgay,
                       TIME_FORMAT(khungGioBatDau, '%H:%i:%s') AS khungGioBatDau,
                       TIME_FORMAT(khungGioKetThuc, '%H:%i:%s') AS khungGioKetThuc,
                       DATE_FORMAT(ngayBatDau, '%Y-%m-%d') AS ngayBatDau,
                       DATE_FORMAT(ngayKetThuc, '%Y-%m-%d') AS ngayKetThuc,
                       trangThai
                FROM GIAVE
                ORDER BY maGiaVe
                """);
    }
}