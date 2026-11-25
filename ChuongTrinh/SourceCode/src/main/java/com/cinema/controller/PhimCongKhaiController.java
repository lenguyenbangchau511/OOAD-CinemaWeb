package com.cinema.controller;

import com.cinema.exception.NghiepVuException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phim")
public class PhimCongKhaiController {
    private static final String SQL = """
            SELECT maPhim, tenPhim, theLoai, thoiLuong, daoDien, dienVien, ngayKhoiChieu,
                   quocGia, noiDung, poster, gioiHanDoTuoi, trangThai
            FROM PHIM WHERE trangThai IN ('DANG_CHIEU', 'SAP_CHIEU')
            """;
    private final JdbcTemplate jdbc;

    public PhimCongKhaiController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach() {
        return jdbc.queryForList(SQL + " ORDER BY maPhim");
    }

    @GetMapping("/{maPhim}")
    public Map<String, Object> chiTiet(@PathVariable String maPhim) {
        return jdbc.queryForList(SQL + " AND maPhim = ?", maPhim).stream().findFirst()
                .orElseThrow(() -> new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại"));
    }
}
