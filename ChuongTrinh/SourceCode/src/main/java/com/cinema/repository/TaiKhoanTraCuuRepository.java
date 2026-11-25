package com.cinema.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Chỉ đọc CSDL, không ghi dữ liệu từ các giao diện mẫu. */
@Repository
public class TaiKhoanTraCuuRepository {
    private final JdbcTemplate jdbc;
    public TaiKhoanTraCuuRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record TaiKhoan(String maTaiKhoan, String tenDangNhap, String email, String matKhauHash,
                           String vaiTro, String trangThai, String maKhachHang, String maNhanVien, String hoTen, String soDienThoai, Integer diemTichLuy) {}
    private static final String SQL = """
        SELECT t.maTaiKhoan, t.tenDangNhap, t.email, t.matKhauHash, t.vaiTro, t.trangThai,
               k.maKhachHang, n.maNhanVien, COALESCE(n.hoTen, k.hoTen, t.tenDangNhap) AS hoTen, COALESCE(n.soDienThoai, k.soDienThoai) AS soDienThoai, k.diemTichLuy
        FROM TAIKHOAN t
        LEFT JOIN KHACHHANG k ON k.maTaiKhoan = t.maTaiKhoan
        LEFT JOIN NHANVIEN n ON n.maTaiKhoan = t.maTaiKhoan
        """;
    private TaiKhoan doc(ResultSet r, int i) throws SQLException {
        return new TaiKhoan(r.getString("maTaiKhoan"), r.getString("tenDangNhap"), r.getString("email"),
            r.getString("matKhauHash"), r.getString("vaiTro"), r.getString("trangThai"),
            r.getString("maKhachHang"), r.getString("maNhanVien"), r.getString("hoTen"), r.getString("soDienThoai"), r.getObject("diemTichLuy", Integer.class));
    }
    public TaiKhoan timTaiKhoan(String dinhDanh) {
        var ds = jdbc.query(SQL + " WHERE t.tenDangNhap = ? OR t.email = ?", this::doc, dinhDanh, dinhDanh);
        return ds.size() == 1 ? ds.get(0) : null;
    }
    public TaiKhoan theoMa(String ma) {
        var ds = jdbc.query(SQL + " WHERE t.maTaiKhoan = ?", this::doc, ma);
        return ds.isEmpty() ? null : ds.get(0);
    }
    public List<Map<String, Object>> khachHang() {
        return jdbc.queryForList("""
            SELECT k.maKhachHang, k.hoTen, k.soDienThoai, k.diemTichLuy, t.tenDangNhap, t.email
            FROM KHACHHANG k JOIN TAIKHOAN t ON t.maTaiKhoan = k.maTaiKhoan ORDER BY k.maKhachHang
            """);
    }
    public List<Map<String, Object>> nhanVien() {
        return jdbc.queryForList("""
            SELECT n.maNhanVien, n.hoTen, n.soDienThoai, n.chucVu, t.maTaiKhoan, t.tenDangNhap, t.trangThai
            FROM NHANVIEN n LEFT JOIN TAIKHOAN t ON t.maTaiKhoan = n.maTaiKhoan ORDER BY n.maNhanVien
            """);
    }
    public List<Map<String, Object>> taiKhoanNhanVien() {
        return jdbc.queryForList("""
            SELECT t.maTaiKhoan, t.tenDangNhap, t.email, n.maNhanVien, n.hoTen, t.vaiTro, t.trangThai
            FROM TAIKHOAN t LEFT JOIN NHANVIEN n ON n.maTaiKhoan = t.maTaiKhoan
            WHERE t.vaiTro IN ('ADMIN','QUAN_LY','NHAN_VIEN') ORDER BY t.maTaiKhoan
            """);
    }
    public boolean trungSoDienThoai(String so, String maLoaiTru) {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
            SELECT EXISTS(SELECT 1 FROM KHACHHANG WHERE soDienThoai = ? AND maTaiKhoan <> ?
                UNION ALL SELECT 1 FROM NHANVIEN WHERE soDienThoai = ? AND maTaiKhoan <> ?)
            """, Boolean.class, so, maLoaiTru, so, maLoaiTru));
    }
    public boolean trungEmail(String email) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM TAIKHOAN WHERE email = ?)", Boolean.class, email));
    }
    public boolean trungTen(String ten) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM TAIKHOAN WHERE tenDangNhap = ?)", Boolean.class, ten));
    }
}
