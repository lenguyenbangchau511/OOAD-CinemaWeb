package com.cinema.repository;

import com.cinema.dto.ComboRequest;
import com.cinema.dto.SanPhamRequest;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SanPhamRepository {
    private final JdbcTemplate jdbc;

    public SanPhamRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> danhSachTonKho() {
        return jdbc.queryForList("""
                SELECT
                    maSanPham,
                    tenSanPham,
                    loaiSanPham,
                    donViTinh,
                    giaBan,
                    hinhAnh,
                    moTa,
                    trangThai,
                    soLuongTon,
                    mucTonToiThieu
                FROM SANPHAM
                ORDER BY tenSanPham
                """);
    }

    public List<Map<String, Object>> lichSuBienDong(String maSanPham, String loai) {
        String sql = """
                SELECT
                    b.maBienDong,
                    b.maSanPham,
                    s.tenSanPham,
                    DATE_FORMAT(
                        b.thoiDiem,
                        '%Y-%m-%d %H:%i:%s'
                    ) AS thoiDiem,
                    b.loai,
                    b.soLuongThayDoi,
                    b.tonTruoc,
                    b.tonSau,
                    b.maThamChieu,
                    b.ghiChu
                FROM LICHSUBIENDONGKHO b
                JOIN SANPHAM s
                    ON s.maSanPham = b.maSanPham
                WHERE (? = '' OR b.maSanPham = ?)
                  AND (? = '' OR b.loai = ?)
                ORDER BY b.thoiDiem DESC, b.maBienDong DESC
                """;

        return jdbc.queryForList(sql, maSanPham, maSanPham, loai, loai);
    }

    public List<Map<String, Object>> timSanPham(String ma) {
        return jdbc.queryForList("""
                SELECT maSanPham, tenSanPham, loaiSanPham, donViTinh, giaBan,
                       hinhAnh, moTa, trangThai, soLuongTon, mucTonToiThieu
                FROM SANPHAM WHERE maSanPham = ?
                """, ma);
    }

    public List<Map<String, Object>> timCombo(String ma) {
        return jdbc.queryForList("""
                SELECT maCombo, tenCombo, giaCombo, hinhAnh, moTa, trangThai
                FROM COMBO WHERE maCombo = ?
                """, ma);
    }

    public List<Map<String, Object>> thanhPhanCombo(String ma) {
        return jdbc.queryForList("""
                SELECT c.maSanPham, s.tenSanPham, s.donViTinh, c.soLuong
                FROM CHITIETCOMBO c
                JOIN SANPHAM s ON s.maSanPham = c.maSanPham
                WHERE c.maCombo = ?
                ORDER BY s.tenSanPham
                """, ma);
    }

    public List<Map<String, Object>> danhSachSanPhamVaCombo() {
        return jdbc.queryForList("""
                SELECT maSanPham AS ma, tenSanPham AS ten, loaiSanPham AS loai, giaBan AS gia,
                       hinhAnh, moTa, trangThai FROM SANPHAM
                UNION ALL
                SELECT maCombo, tenCombo, 'COMBO', giaCombo, hinhAnh, moTa, trangThai FROM COMBO
                ORDER BY ten
                """);
    }

    public void themSanPham(String ma, SanPhamRequest req, String hinhAnh, int mucMin) {
        jdbc.update("""
                INSERT INTO SANPHAM (maSanPham, tenSanPham, loaiSanPham, donViTinh, giaBan,
                                     moTa, hinhAnh, trangThai, soLuongTon, mucTonToiThieu)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                """,
                ma, req.tenSanPham().trim(), req.loaiSanPham(), req.donViTinh().trim(),
                req.giaBan(), req.moTa().trim(), hinhAnh,
                req.trangThai(), mucMin);
    }

    public int suaSanPham(String ma, SanPhamRequest req, String hinhAnh) {
        return jdbc.update("""
                UPDATE SANPHAM
                SET tenSanPham = ?, loaiSanPham = ?, donViTinh = ?, giaBan = ?,
                    moTa = ?, hinhAnh = ?, trangThai = ?,
                    mucTonToiThieu = COALESCE(?, mucTonToiThieu)
                WHERE maSanPham = ?
                """,
                req.tenSanPham().trim(), req.loaiSanPham(), req.donViTinh().trim(),
                req.giaBan(), req.moTa().trim(), hinhAnh,
                req.trangThai(), req.mucTonToiThieu(), ma);
    }

    public void themCombo(String ma, ComboRequest req, String hinhAnh) {
        jdbc.update("""
                INSERT INTO COMBO (maCombo, tenCombo, giaCombo, hinhAnh, moTa, trangThai)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                ma, req.tenCombo().trim(), req.giaCombo(), hinhAnh,
                req.moTa().trim(), req.trangThai());
    }

    public int suaCombo(String ma, ComboRequest req, String hinhAnh) {
        return jdbc.update("""
                UPDATE COMBO
                SET tenCombo = ?, giaCombo = ?, hinhAnh = ?, moTa = ?, trangThai = ?
                WHERE maCombo = ?
                """,
                req.tenCombo().trim(), req.giaCombo(), hinhAnh,
                req.moTa().trim(), req.trangThai(), ma);
    }

    public void xoaThanhPhanCombo(String ma) {
        jdbc.update("DELETE FROM CHITIETCOMBO WHERE maCombo = ?", ma);
    }

    public int doiTrangThaiSanPham(String trangThai, String ma) {
        return jdbc.update("UPDATE SANPHAM SET trangThai = ? WHERE maSanPham = ?", trangThai, ma);
    }

    public int doiTrangThaiCombo(String trangThai, String ma) {
        return jdbc.update("UPDATE COMBO SET trangThai = ? WHERE maCombo = ?", trangThai, ma);
    }

    public Integer demSanPham(String ma) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM SANPHAM WHERE maSanPham = ?", Integer.class, ma);
    }

    public Integer demCombo(String ma) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM COMBO WHERE maCombo = ?", Integer.class, ma);
    }

    public void themThanhPhanCombo(String maCombo, String maSanPham, int soLuong) {
        jdbc.update("INSERT INTO CHITIETCOMBO (maCombo, maSanPham, soLuong) VALUES (?, ?, ?)", maCombo, maSanPham, soLuong);
    }
}
