package com.cinema.repository;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GiaVeRepository {
    private final JdbcTemplate jdbc;

    public GiaVeRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> danhSach() {
        // Định dạng ngày giờ theo hợp đồng trả dữ liệu của API.
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
