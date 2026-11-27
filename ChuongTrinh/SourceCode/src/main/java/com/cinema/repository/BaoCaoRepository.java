package com.cinema.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class BaoCaoRepository {
    private final JdbcTemplate jdbc;

    public BaoCaoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Map<String, Object>> doanhThu(LocalDate tu, LocalDate denDocQuyen) {
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
                """, tu, denDocQuyen);
    }
}
