package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Giao diện 45 - Báo cáo doanh thu (UC11.1). Các tab thống kê khác và xuất Excel là giao diện mẫu.
 */
@RestController
@RequestMapping("/api/bao-cao")
public class BaoCaoController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public BaoCaoController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    /** Doanh thu theo từng ngày trong khoảng [tuNgay, denNgay]. Chỉ tính đơn đã thanh toán thành công. */
    @GetMapping("/doanh-thu")
    public List<Map<String, Object>> doanhThu(@RequestParam String tuNgay, @RequestParam String denNgay,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        LocalDate tu;
        LocalDate den;
        try {
            tu = LocalDate.parse(tuNgay);
            den = LocalDate.parse(denNgay);
        } catch (DateTimeParseException e) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "NGAY_KHONG_HOP_LE", "Khoảng thời gian không hợp lệ");
        }
        if (tu.isAfter(den)) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "NGAY_KHONG_HOP_LE", "Ngày bắt đầu không được sau ngày kết thúc");
        }

        // Cộng tiền vé và F&B theo từng đơn trước (bảng con), rồi mới gộp theo ngày, để không bị cộng trùng.
        return jdbc.queryForList("""
                SELECT DATE_FORMAT(d.ngayDat, '%Y-%m-%d') AS ngay,
                       COUNT(*) AS soDon,
                       SUM(COALESCE(v.tien, 0)) AS doanhThuVe,
                       SUM(COALESCE(f.tien, 0)) AS doanhThuFnb,
                       SUM(d.soTienGiamTuKhuyenMai + d.soTienGiamTuDiem) AS giamGia,
                       SUM(d.tongTien) AS tongThu
                FROM DONHANG d
                LEFT JOIN (SELECT maDonHang, SUM(donGia) AS tien FROM VE GROUP BY maDonHang) v
                       ON v.maDonHang = d.maDonHang
                LEFT JOIN (SELECT maDonHang, SUM(thanhTien) AS tien FROM CHITIETDICHVU GROUP BY maDonHang) f
                       ON f.maDonHang = d.maDonHang
                WHERE d.trangThai = 'DA_THANH_TOAN'
                  AND d.ngayDat >= ? AND d.ngayDat < ?
                GROUP BY DATE_FORMAT(d.ngayDat, '%Y-%m-%d')
                ORDER BY ngay
                """, tu, den.plusDays(1));
    }
}