package com.cinema.repository;

import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class KhachHangRepository {
    private final JdbcTemplate jdbc;

    public KhachHangRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> timHoSo(String ma) {
        return jdbc.queryForList("""
                SELECT k.maKhachHang, k.hoTen, k.soDienThoai, k.diemTichLuy,
                       t.tenDangNhap, t.email, t.trangThai AS trangThaiTaiKhoan
                FROM KHACHHANG k JOIN TAIKHOAN t ON t.maTaiKhoan = k.maTaiKhoan
                WHERE k.maKhachHang = ?
                """, ma);
    }

    public List<Map<String, Object>> lichSuDiem(String ma) {
        return jdbc.queryForList("""
                SELECT maGiaoDichDiem, diemThayDoi, lyDo, maDonHang,
                       DATE_FORMAT(thoiGian, '%Y-%m-%dT%H:%i:%s') AS thoiGian
                FROM GIAODICHDIEM
                WHERE maKhachHang = ?
                ORDER BY thoiGian DESC, maGiaoDichDiem DESC
                """, ma);
    }
}
