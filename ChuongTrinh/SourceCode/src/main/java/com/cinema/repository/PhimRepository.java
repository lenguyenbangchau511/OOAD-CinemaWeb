package com.cinema.repository;

import com.cinema.entity.Phim;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class PhimRepository {
    private final JdbcTemplate jdbc;

    public PhimRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Phim> PHIM = new BeanPropertyRowMapper<>(Phim.class);

    public List<Phim> danhSachQuanLy() {
        return jdbc.query("SELECT * FROM PHIM ORDER BY tenPhim", PHIM);
    }

    public Phim timTheoMa(String maPhim) {
        return jdbc.query("SELECT * FROM PHIM WHERE maPhim = ?", PHIM, maPhim).stream().findFirst().orElse(null);
    }

    public Phim khoaTheoMa(String maPhim) {
        return jdbc.query("SELECT * FROM PHIM WHERE maPhim = ? FOR UPDATE", PHIM, maPhim)
                .stream().findFirst().orElse(null);
    }

    public boolean trungTenVaNgay(String tenPhim, LocalDate ngay, String maBoQua) {
        String sql = "SELECT maPhim FROM PHIM WHERE tenPhim = ? AND ngayKhoiChieu = ?";
        if (maBoQua == null) {
            return !jdbc.queryForList(sql + " FOR UPDATE", String.class, tenPhim, ngay).isEmpty();
        }
        return !jdbc.queryForList(sql + " AND maPhim <> ? FOR UPDATE", String.class, tenPhim, ngay, maBoQua).isEmpty();
    }

    public record LichChieu(String maSuat, String maPhim, String maPhong, LocalDateTime batDau,
                            LocalDateTime ketThuc, String trangThai) {
        public boolean dangHoacSapChieu(LocalDateTime bayGio) {
            return !"DA_HUY".equals(trangThai) && !"KET_THUC".equals(trangThai) && ketThuc.isAfter(bayGio);
        }

        public boolean canDoiThoiLuong(String maPhimCanSua, LocalDateTime bayGio) {
            return maPhim.equals(maPhimCanSua) && "SAP_CHIEU".equals(trangThai) && batDau.isAfter(bayGio);
        }
    }

    private static final RowMapper<LichChieu> LICH = (rs, row) -> {
        LocalDate ngay = rs.getObject("ngayChieu", LocalDate.class);
        return new LichChieu(rs.getString("maSuat"), rs.getString("maPhim"), rs.getString("maPhong"),
                ngay.atTime(rs.getObject("gioBatDau", LocalTime.class)),
                ngay.atTime(rs.getObject("gioKetThuc", LocalTime.class)), rs.getString("trangThai"));
    };

    public List<LichChieu> suatChieuCuaPhim(String maPhim) {
        return jdbc.query("SELECT * FROM SUATCHIEU WHERE maPhim = ?", LICH, maPhim);
    }

    public List<LichChieu> khoaLichChieuTu(LocalDate ngay) {
        return jdbc.query("""
                SELECT * FROM SUATCHIEU WHERE ngayChieu >= ? AND trangThai IN ('SAP_CHIEU', 'DANG_CHIEU')
                FOR UPDATE
                """, LICH, ngay);
    }

    public void capNhatGioKetThuc(String maSuat, LocalTime gioKetThuc) {
        jdbc.update("UPDATE SUATCHIEU SET gioKetThuc = ? WHERE maSuat = ?", gioKetThuc, maSuat);
    }

    public int them(Phim phim) {
        return jdbc.update("""
                INSERT INTO PHIM (tenPhim, theLoai, thoiLuong, daoDien, dienVien, ngayKhoiChieu,
                                  quocGia, noiDung, poster, gioiHanDoTuoi, trangThai, maPhim)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, phim.getTenPhim(), phim.getTheLoai(), phim.getThoiLuong(), phim.getDaoDien(), phim.getDienVien(),
                phim.getNgayKhoiChieu(), phim.getQuocGia(), phim.getNoiDung(), phim.getPoster(),
                phim.getGioiHanDoTuoi(), phim.getTrangThai().name(), phim.getMaPhim());
    }

    public int sua(Phim phim) {
        return jdbc.update("""
                UPDATE PHIM SET tenPhim = ?, theLoai = ?, thoiLuong = ?, daoDien = ?, dienVien = ?,
                                ngayKhoiChieu = ?, quocGia = ?, noiDung = ?, poster = ?,
                                gioiHanDoTuoi = ?, trangThai = ?
                WHERE maPhim = ?
                """, phim.getTenPhim(), phim.getTheLoai(), phim.getThoiLuong(), phim.getDaoDien(), phim.getDienVien(),
                phim.getNgayKhoiChieu(), phim.getQuocGia(), phim.getNoiDung(), phim.getPoster(),
                phim.getGioiHanDoTuoi(), phim.getTrangThai().name(), phim.getMaPhim());
    }

    public int xoa(String maPhim) {
        return jdbc.update("DELETE FROM PHIM WHERE maPhim = ?", maPhim);
    }
}
