package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.util.PhienDangNhap;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/san-pham")
public class QuanLySanPhamController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public QuanLySanPhamController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                             @RequestParam(defaultValue = "") String loai,
                                             @RequestParam(defaultValue = "") String trangThai,
                                             HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return jdbc.queryForList("""
                SELECT maSanPham AS ma, tenSanPham AS ten, loaiSanPham AS loai, giaBan AS gia,
                       hinhAnh, moTa, trangThai FROM SANPHAM
                UNION ALL
                SELECT maCombo, tenCombo, 'COMBO', giaCombo, hinhAnh, moTa, trangThai FROM COMBO
                ORDER BY ten
                """).stream()
                .filter(m -> loai.isBlank() || loai.equals(m.get("loai")))
                .filter(m -> trangThai.isBlank() || trangThai.equals(m.get("trangThai")))
                .filter(m -> tuKhoa.isBlank() || TimKiem.chua((String) m.get("ten"), tuKhoa)
                        || TimKiem.chua((String) m.get("ma"), tuKhoa))
                .toList();
    }
}
