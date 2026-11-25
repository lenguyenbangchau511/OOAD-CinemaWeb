package com.cinema.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Tra cứu và cập nhật dữ liệu tài khoản; mọi tham số SQL được truyền riêng. */
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
            SELECT EXISTS(SELECT 1 FROM KHACHHANG WHERE soDienThoai = ? AND (maTaiKhoan IS NULL OR maTaiKhoan <> ?)
                UNION ALL SELECT 1 FROM NHANVIEN WHERE soDienThoai = ? AND (maTaiKhoan IS NULL OR maTaiKhoan <> ?))
            """, Boolean.class, so, maLoaiTru, so, maLoaiTru));
    }
    // So sánh hash cũ để hai yêu cầu đồng thời không ghi đè lên nhau.
    public boolean doiMatKhau(String ma, String vaiTro, String hashCu, String hashMoi) {
        return jdbc.update("""
            UPDATE TAIKHOAN SET matKhauHash = ?
            WHERE maTaiKhoan = ? AND vaiTro = ? AND trangThai = 'HOAT_DONG'
              AND BINARY matKhauHash = BINARY ?
            """, hashMoi, ma, vaiTro, hashCu) == 1;
    }
    public void taoTaiKhoanKhachHang(String ma, String ten, String email, String hash) {
        jdbc.update("INSERT INTO TAIKHOAN (maTaiKhoan, tenDangNhap, email, matKhauHash, vaiTro, trangThai) "
                + "VALUES (?, ?, ?, ?, 'KHACH_HANG', 'HOAT_DONG')", ma, ten, email, hash);
    }
    public void taoHoSoKhachHang(String ma, String maTaiKhoan, String hoTen, String so) {
        jdbc.update("INSERT INTO KHACHHANG (maKhachHang, maTaiKhoan, hoTen, soDienThoai, diemTichLuy) "
                + "VALUES (?, ?, ?, ?, 0)", ma, maTaiKhoan, hoTen, so);
    }
    public TaiKhoan theoEmail(String email) {
        var ds = jdbc.query(SQL + " WHERE t.email = ?", this::doc, email);
        return ds.size() == 1 ? ds.get(0) : null;
    }
    public boolean capNhatHoSo(TaiKhoan tk, String hoTen, String so) {
        String bang = tk.maKhachHang() != null ? "KHACHHANG" : tk.maNhanVien() != null ? "NHANVIEN" : null;
        if (bang == null) return false;
        return jdbc.update("UPDATE " + bang + " SET hoTen = ?, soDienThoai = ? WHERE maTaiKhoan = ?",
                hoTen, so, tk.maTaiKhoan()) == 1;
    }
    public boolean capNhatVaiTro(String ma, String cu, String moi) {
        return jdbc.update("UPDATE TAIKHOAN SET vaiTro = ? WHERE maTaiKhoan = ? AND vaiTro = ? AND vaiTro IN ('NHAN_VIEN','QUAN_LY')",
                moi, ma, cu) == 1;
    }
    public boolean capNhatTrangThai(String ma, String cu, String moi) {
        return jdbc.update("UPDATE TAIKHOAN SET trangThai = ? WHERE maTaiKhoan = ? AND trangThai = ? AND vaiTro IN ('NHAN_VIEN','QUAN_LY')",
                moi, ma, cu) == 1;
    }
    // Chỉ cấp tài khoản cho hồ sơ thật chưa được liên kết. Schema hiện tại chưa cho phép NULL.
    public boolean nhanVienChuaCoTaiKhoan(String ma) {
        return !jdbc.queryForList("SELECT maNhanVien FROM NHANVIEN WHERE maNhanVien = ? AND maTaiKhoan IS NULL FOR UPDATE", ma).isEmpty();
    }
    public void taoTaiKhoanNhanVien(String ma, String ten, String email, String hash) {
        jdbc.update("INSERT INTO TAIKHOAN (maTaiKhoan, tenDangNhap, email, matKhauHash, vaiTro, trangThai) VALUES (?, ?, ?, ?, 'NHAN_VIEN', 'HOAT_DONG')", ma, ten, email, hash);
    }
    public boolean ganTaiKhoanNhanVien(String nv, String tk) {
        return jdbc.update("UPDATE NHANVIEN SET maTaiKhoan = ? WHERE maNhanVien = ? AND maTaiKhoan IS NULL", tk, nv) == 1;
    }
    public List<Map<String, Object>> hoSoNhanVien() {
        return jdbc.queryForList("""
            SELECT n.maNhanVien, n.hoTen, n.soDienThoai, n.chucVu, t.maTaiKhoan, t.tenDangNhap,
                   t.email, t.vaiTro, t.trangThai AS trangThaiTaiKhoan
            FROM NHANVIEN n LEFT JOIN TAIKHOAN t ON t.maTaiKhoan = n.maTaiKhoan ORDER BY n.maNhanVien
            """);
    }

    public boolean trungEmail(String email) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM TAIKHOAN WHERE email = ?)", Boolean.class, email));
    }
    public boolean trungTen(String ten) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM TAIKHOAN WHERE tenDangNhap = ?)", Boolean.class, ten));
    }
}
