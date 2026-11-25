package com.cinema.service;

import com.cinema.entity.ChiTietDichVu;
import com.cinema.util.ThoiGian;
import java.sql.Date;
import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * ĐIỂM NỐI VỚI CÁC MODULE KHÁC (phim, đồ ăn - kho, khuyến mãi, khách hàng, giá vé).
 *
 * Phần đặt vé / thanh toán của Hậu cần ĐỌC hoặc CẬP NHẬT một ít dữ liệu của các module này
 * (tên phim, tồn kho, lượt dùng khuyến mãi, điểm thành viên, bảng giá vé). Để không phụ thuộc vào
 * entity / service của người khác khi họ chưa xong, mọi truy cập đó gom về đây bằng SQL ngắn.
 * Khi module kia hoàn thiện có thể thay từng hàm bằng lời gọi service của họ mà không đụng chỗ khác.
 */
@Component
public class LienKetModuleKhac {

    private final JdbcTemplate jdbc;

    public LienKetModuleKhac(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---------------------------------------------------------------- Phim
    public record PhimTomTat(String maPhim, String tenPhim, String gioiHanDoTuoi, String poster,
                             int thoiLuong, String theLoai, String trangThai) {
        public boolean conBanVe() {
            return !"NGUNG_CHIEU".equals(trangThai);
        }
    }

    private static final String SQL_PHIM = "SELECT maPhim, tenPhim, gioiHanDoTuoi, poster, thoiLuong, theLoai, trangThai FROM PHIM";

    private PhimTomTat docPhim(java.sql.ResultSet rs, int i) throws java.sql.SQLException {
        return new PhimTomTat(rs.getString("maPhim"), rs.getString("tenPhim"), rs.getString("gioiHanDoTuoi"),
                rs.getString("poster"), rs.getInt("thoiLuong"), rs.getString("theLoai"), rs.getString("trangThai"));
    }

    public Map<String, PhimTomTat> layPhim(Collection<String> dsMaPhim) {
        Map<String, PhimTomTat> ketQua = new HashMap<>();
        if (dsMaPhim.isEmpty()) return ketQua;
        String dau = String.join(",", java.util.Collections.nCopies(dsMaPhim.size(), "?"));
        for (PhimTomTat p : jdbc.query(SQL_PHIM + " WHERE maPhim IN (" + dau + ")", this::docPhim, dsMaPhim.toArray())) {
            ketQua.put(p.maPhim(), p);
        }
        return ketQua;
    }

    public List<PhimTomTat> tatCaPhim() {
        return jdbc.query(SQL_PHIM + " ORDER BY tenPhim", this::docPhim);
    }

    // ------------------------------------------------- Sản phẩm, combo, tồn kho
    public String tenSanPham(String maSanPham) {
        return layChuoi("SELECT tenSanPham FROM SANPHAM WHERE maSanPham = ?", maSanPham);
    }

    public String tenCombo(String maCombo) {
        return layChuoi("SELECT tenCombo FROM COMBO WHERE maCombo = ?", maCombo);
    }

    private String layChuoi(String sql, String ma) {
        List<String> ds = jdbc.query(sql, (rs, i) -> rs.getString(1), ma);
        return ds.isEmpty() ? ma : ds.get(0);
    }

    /** Số lượng từng sản phẩm cần xuất kho cho các dòng dịch vụ của đơn (combo được tách thành sản phẩm thành phần). */
    public Map<String, Integer> nhuCauTonKho(List<ChiTietDichVu> dsDichVu) {
        Map<String, Integer> nhuCau = new TreeMap<>();   // TreeMap: luôn khóa theo thứ tự mã, tránh khóa chéo
        for (ChiTietDichVu dv : dsDichVu) {
            if (dv.getMaSanPham() != null) {
                nhuCau.merge(dv.getMaSanPham(), dv.getSoLuong(), Integer::sum);
            } else {
                jdbc.query("SELECT maSanPham, soLuong FROM CHITIETCOMBO WHERE maCombo = ?",
                        rs -> { nhuCau.merge(rs.getString(1), rs.getInt(2) * dv.getSoLuong(), Integer::sum); },
                        dv.getMaCombo());
            }
        }
        return nhuCau;
    }

    /** Trả null nếu đủ tồn kho; ngược lại trả câu thông báo (UC5.3 luồng ngoại lệ 3c). */
    public String kiemTraTonKho(Map<String, Integer> nhuCau) {
        for (Map.Entry<String, Integer> e : nhuCau.entrySet()) {
            List<Integer> ton = jdbc.query("SELECT soLuongTon FROM SANPHAM WHERE maSanPham = ?",
                    (rs, i) -> rs.getInt(1), e.getKey());
            if (ton.isEmpty() || ton.get(0) < e.getValue()) {
                return "Số lượng sản phẩm không đủ đáp ứng";
            }
        }
        return null;
    }

    /** Trừ tồn kho khi thanh toán thành công và ghi lịch sử biến động (loại BAN_HANG). */
    public void truTonKho(Map<String, Integer> nhuCau, String maDonHang, String maNhanVien) {
        for (Map.Entry<String, Integer> e : nhuCau.entrySet()) {
            Integer tonTruoc = jdbc.queryForObject(
                    "SELECT soLuongTon FROM SANPHAM WHERE maSanPham = ? FOR UPDATE", Integer.class, e.getKey());
            int tonSau = tonTruoc - e.getValue();
            if (tonSau < 0) throw new IllegalStateException("Tồn kho không đủ cho " + e.getKey());
            jdbc.update("UPDATE SANPHAM SET soLuongTon = ? WHERE maSanPham = ?", tonSau, e.getKey());
            jdbc.update("INSERT INTO LICHSUBIENDONGKHO (maSanPham, maNhanVien, thoiDiem, loai, soLuongThayDoi, "
                            + "tonTruoc, tonSau, maThamChieu, ghiChu) VALUES (?, ?, ?, 'BAN_HANG', ?, ?, ?, ?, NULL)",
                    e.getKey(), maNhanVien, java.sql.Timestamp.valueOf(ThoiGian.bayGio()),
                    -e.getValue(), tonTruoc, tonSau, maDonHang);
        }
    }

    // ---------------------------------------------------------- Khuyến mãi
    /** Trả null nếu khuyến mãi còn hiệu lực và còn lượt dùng; ngược lại trả thông báo. */
    public String kiemTraKhuyenMai(String maKhuyenMai) {
        List<Map<String, Object>> ds = jdbc.queryForList(
                "SELECT trangThai, ngayBatDau, ngayKetThuc, gioiHanLuotSuDung, soLuotDaSuDung "
                        + "FROM KHUYENMAI WHERE maKhuyenMai = ?", maKhuyenMai);
        if (ds.isEmpty()) return "Khuyến mãi không tồn tại";
        Map<String, Object> km = ds.get(0);
        LocalDate homNay = ThoiGian.bayGio().toLocalDate();
        boolean hopLe = "DANG_AP_DUNG".equals(km.get("trangThai"))
                && !homNay.isBefore(((Date) km.get("ngayBatDau")).toLocalDate())
                && !homNay.isAfter(((Date) km.get("ngayKetThuc")).toLocalDate())
                && ((Number) km.get("soLuotDaSuDung")).intValue() < ((Number) km.get("gioiHanLuotSuDung")).intValue();
        return hopLe ? null : "Khuyến mãi không còn hiệu lực hoặc đã hết lượt sử dụng";
    }

    /** Tăng số lượt đã dùng của khuyến mãi (chỉ tăng khi còn lượt). */
    public boolean tangLuotKhuyenMai(String maKhuyenMai) {
        return jdbc.update("UPDATE KHUYENMAI SET soLuotDaSuDung = soLuotDaSuDung + 1 "
                + "WHERE maKhuyenMai = ? AND soLuotDaSuDung < gioiHanLuotSuDung", maKhuyenMai) == 1;
    }

    // ------------------------------------------------------ Khách hàng, điểm
    public int diemHienCo(String maKhachHang) {
        List<Integer> ds = jdbc.query("SELECT diemTichLuy FROM KHACHHANG WHERE maKhachHang = ?",
                (rs, i) -> rs.getInt(1), maKhachHang);
        return ds.isEmpty() ? 0 : ds.get(0);
    }

    /** Cộng (số dương) hoặc trừ (số âm) điểm và ghi GIAODICHDIEM. Trả false nếu trừ quá số dư. */
    public boolean capNhatDiem(String maKhachHang, int diemThayDoi, String lyDo, String maDonHang) {
        int dong = jdbc.update("UPDATE KHACHHANG SET diemTichLuy = diemTichLuy + ? "
                + "WHERE maKhachHang = ? AND diemTichLuy + ? >= 0", diemThayDoi, maKhachHang, diemThayDoi);
        if (dong != 1) return false;
        jdbc.update("INSERT INTO GIAODICHDIEM (maGiaoDichDiem, maKhachHang, diemThayDoi, thoiGian, lyDo, maDonHang) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                com.cinema.util.SinhMa.ngauNhien("GD", 6), maKhachHang, diemThayDoi,
                java.sql.Timestamp.valueOf(ThoiGian.bayGio()), lyDo, maDonHang);
        return true;
    }

    /** Tìm mã khách hàng theo số điện thoại (khớp một phần) - dùng cho tra cứu lịch sử vé. */
    public List<String> timMaKhachHangTheoSdt(String sdt) {
        return jdbc.query("SELECT maKhachHang FROM KHACHHANG WHERE soDienThoai LIKE ?",
                (rs, i) -> rs.getString(1), "%" + sdt + "%");
    }

    // -------------------------------------------------------------- Giá vé
    /**
     * Chọn mã bảng giá (GIAVE) áp dụng cho một vé: theo loại vé, loại ghế, loại ngày (thường / cuối tuần)
     * và khung giờ. Nếu không có dòng khớp hoàn toàn thì lấy dòng đang áp dụng cùng loại ghế.
     */
    public Optional<String> timMaGiaVe(String loaiVe, String loaiGhe, LocalDate ngay, LocalTime gio) {
        String loaiNgay = (ngay.getDayOfWeek() == DayOfWeek.SATURDAY || ngay.getDayOfWeek() == DayOfWeek.SUNDAY)
                ? "CUOI_TUAN" : "NGAY_THUONG";
        List<String> khop = jdbc.query("SELECT maGiaVe FROM GIAVE WHERE trangThai = 'DANG_AP_DUNG' "
                        + "AND doiTuongKhachHang = 'NGUOI_LON' AND loaiVe = ? AND loaiGhe = ? AND loaiNgay = ? "
                        + "AND ? BETWEEN ngayBatDau AND ngayKetThuc AND ? BETWEEN khungGioBatDau AND khungGioKetThuc "
                        + "ORDER BY maGiaVe LIMIT 1",
                (rs, i) -> rs.getString(1), loaiVe, loaiGhe, loaiNgay, Date.valueOf(ngay), Time.valueOf(gio));
        if (!khop.isEmpty()) return Optional.of(khop.get(0));
        List<String> tam = jdbc.query("SELECT maGiaVe FROM GIAVE WHERE trangThai = 'DANG_AP_DUNG' AND loaiGhe = ? "
                + "ORDER BY maGiaVe LIMIT 1", (rs, i) -> rs.getString(1), loaiGhe);
        return tam.isEmpty() ? Optional.empty() : Optional.of(tam.get(0));
    }
}
