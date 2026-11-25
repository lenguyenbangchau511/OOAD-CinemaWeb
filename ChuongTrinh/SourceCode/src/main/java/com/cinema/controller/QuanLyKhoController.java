
package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.util.PhienDangNhap;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpSession;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/ton-kho")
public class QuanLyKhoController {

    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public QuanLyKhoController(
            JdbcTemplate jdbc,
            PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    // API 1: Danh sách tồn kho
    @GetMapping
    public List<Map<String, Object>> danhSach(
            @RequestParam(defaultValue = "") String tuKhoa,
            @RequestParam(defaultValue = "") String loai,
            @RequestParam(defaultValue = "") String tinhTrang,
            HttpSession session) {

        dangNhap.yeuCau(
                session,
                VaiTro.QUAN_LY,
                VaiTro.NHAN_VIEN
        );

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
                """)
                .stream()

                .filter(p ->
                    tuKhoa.isBlank()
                    || TimKiem.chua(
                        String.valueOf(p.get("maSanPham")),
                        tuKhoa
                    )
                    || TimKiem.chua(
                        String.valueOf(p.get("tenSanPham")),
                        tuKhoa
                    )
                )

                .filter(p ->
                    loai.isBlank()
                    || loai.equals(p.get("loaiSanPham"))
                )

                .filter(p -> {
                    int ton = ((Number)p.get("soLuongTon")).intValue();
                    int min = ((Number)p.get("mucTonToiThieu")).intValue();

                    return switch (tinhTrang) {
                        case "het-hang" -> ton == 0;
                        case "sap-het" -> ton > 0 && ton <= min;
                        case "binh-thuong" -> ton > min;
                        default -> true;
                    };
                })

                .toList();
    }

    // API 2: Lịch sử biến động kho
    @GetMapping("/bien-dong")
    public List<Map<String, Object>> lichSuBienDong(
            @RequestParam(defaultValue = "") String maSanPham,
            @RequestParam(defaultValue = "") String loai,
            HttpSession session) {

        dangNhap.yeuCau(
                session,
                VaiTro.QUAN_LY,
                VaiTro.NHAN_VIEN
        );

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

        return jdbc.queryForList(
                sql,
                maSanPham,
                maSanPham,
                loai,
                loai
        );
    }

    // API 3: Chi tiết sản phẩm hoặc combo (phục vụ giao diện chi tiết).
    @GetMapping("/chi-tiet/{ma}")
    public Map<String, Object> chiTiet(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);

        List<Map<String, Object>> sp = jdbc.queryForList("""
                SELECT maSanPham, tenSanPham, loaiSanPham, donViTinh, giaBan,
                       hinhAnh, moTa, trangThai, soLuongTon, mucTonToiThieu
                FROM SANPHAM WHERE maSanPham = ?
                """, ma);
        if (!sp.isEmpty()) {
            Map<String, Object> result = new java.util.LinkedHashMap<>(sp.get(0));
            result.put("loaiDoiTuong", "SAN_PHAM");
            return result;
        }

        List<Map<String, Object>> combos = jdbc.queryForList("""
                SELECT maCombo, tenCombo, giaCombo, hinhAnh, moTa, trangThai
                FROM COMBO WHERE maCombo = ?
                """, ma);
        if (combos.isEmpty()) {
            throw new com.cinema.exception.NghiepVuException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "KHONG_TIM_THAY",
                    "Không tìm thấy sản phẩm hoặc combo"
            );
        }
        Map<String, Object> result = new java.util.LinkedHashMap<>(combos.get(0));
        result.put("loaiDoiTuong", "COMBO");
        result.put("thanhPhan", jdbc.queryForList("""
                SELECT c.maSanPham, s.tenSanPham, s.donViTinh, c.soLuong
                FROM CHITIETCOMBO c
                JOIN SANPHAM s ON s.maSanPham = c.maSanPham
                WHERE c.maCombo = ?
                ORDER BY s.tenSanPham
                """, ma));
        return result;
    }
}
