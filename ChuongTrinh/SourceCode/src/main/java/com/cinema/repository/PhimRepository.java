package com.cinema.repository;

import com.cinema.dto.PhimForm;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PhimRepository {
    private static final String SQL_PHIM_CONG_KHAI = """
            SELECT maPhim, tenPhim, theLoai, thoiLuong, daoDien, dienVien, ngayKhoiChieu,
                   quocGia, noiDung, poster, gioiHanDoTuoi, trangThai
            FROM PHIM WHERE trangThai IN ('DANG_CHIEU', 'SAP_CHIEU')
            """;

    private final JdbcTemplate jdbc;

    public PhimRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> danhSachCongKhai() {
        return jdbc.queryForList(SQL_PHIM_CONG_KHAI + " ORDER BY maPhim");
    }

    public List<Map<String, Object>> timCongKhai(String maPhim) {
        return jdbc.queryForList(SQL_PHIM_CONG_KHAI + " AND maPhim = ?", maPhim);
    }

    public List<Map<String, Object>> danhSachQuanLy() {
        return jdbc.queryForList("SELECT * FROM PHIM ORDER BY tenPhim");
    }

    public List<Map<String, Object>> timTheoMa(String maPhim) {
        return jdbc.queryForList("SELECT * FROM PHIM WHERE maPhim = ?", maPhim);
    }

    public void them(PhimForm phim) {
        jdbc.update("""
                INSERT INTO PHIM (tenPhim, theLoai, thoiLuong, daoDien, dienVien, ngayKhoiChieu,
                                  quocGia, noiDung, poster, gioiHanDoTuoi, trangThai, maPhim)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, phim.tenPhim(), phim.theLoai(), phim.thoiLuong(), phim.daoDien(), phim.dienVien(),
                phim.ngayKhoiChieu(), phim.quocGia(), phim.noiDung(), phim.poster(),
                phim.gioiHanDoTuoi(), phim.trangThai(), phim.maPhim());
    }

    public int sua(PhimForm phim) {
        return jdbc.update("""
                UPDATE PHIM SET tenPhim = ?, theLoai = ?, thoiLuong = ?, daoDien = ?, dienVien = ?,
                                ngayKhoiChieu = ?, quocGia = ?, noiDung = ?, poster = ?,
                                gioiHanDoTuoi = ?, trangThai = ?
                WHERE maPhim = ?
                """, phim.tenPhim(), phim.theLoai(), phim.thoiLuong(), phim.daoDien(), phim.dienVien(),
                phim.ngayKhoiChieu(), phim.quocGia(), phim.noiDung(), phim.poster(),
                phim.gioiHanDoTuoi(), phim.trangThai(), phim.maPhim());
    }

    public int ngungChieu(String maPhim) {
        return jdbc.update("UPDATE PHIM SET trangThai = 'NGUNG_CHIEU' WHERE maPhim = ?", maPhim);
    }

    public int xoa(String maPhim) {
        return jdbc.update("DELETE FROM PHIM WHERE maPhim = ?", maPhim);
    }
}
