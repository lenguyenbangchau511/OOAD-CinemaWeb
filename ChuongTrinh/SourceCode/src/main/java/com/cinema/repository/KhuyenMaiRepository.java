package com.cinema.repository;

import java.sql.Date;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class KhuyenMaiRepository {
    private final JdbcTemplate jdbc;

    public KhuyenMaiRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> danhSachTrucTuyen(Date homNay) {
        return jdbc.queryForList("""
                SELECT maKhuyenMai, tenChuongTrinh, noiDung, hinhThucGiam, mucGiam,
                       DATE_FORMAT(ngayBatDau, '%Y-%m-%d') AS ngayBatDau,
                       DATE_FORMAT(ngayKetThuc, '%Y-%m-%d') AS ngayKetThuc,
                       phamViApDung, doiTuongApDung, giaTriDonToiThieu
                FROM KHUYENMAI
                WHERE trangThai = 'DANG_AP_DUNG'
                  AND ? BETWEEN ngayBatDau AND ngayKetThuc
                  AND kenhBan IN ('TRUC_TUYEN', 'TAT_CA')
                  AND doiTuongApDung IN ('THANH_VIEN', 'TAT_CA')
                  AND soLuotDaSuDung < gioiHanLuotSuDung
                ORDER BY mucUuTien, maKhuyenMai
                """, homNay);
    }

    public List<Map<String, Object>> danhSach(boolean chiDangApDung) {
        String dieuKien = chiDangApDung ? "WHERE trangThai = 'DANG_AP_DUNG'" : "";
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
