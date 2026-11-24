package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.util.PhienDangNhap;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/phim")
public class QuanLyPhimController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public QuanLyPhimController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                             @RequestParam(defaultValue = "") String trangThai,
                                             HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return jdbc.queryForList("SELECT * FROM PHIM ORDER BY tenPhim").stream()
                .filter(p -> trangThai.isBlank() || trangThai.equals(p.get("trangThai")))
                .filter(p -> tuKhoa.isBlank() || TimKiem.chua((String) p.get("tenPhim"), tuKhoa)
                        || TimKiem.chua((String) p.get("maPhim"), tuKhoa))
                .toList();
    }

    @GetMapping("/{maPhim}")
    public Map<String, Object> chiTiet(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return jdbc.queryForList("SELECT * FROM PHIM WHERE maPhim = ?", maPhim).stream().findFirst()
                .orElseThrow(() -> new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
    }
}
