package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.util.PhienDangNhap;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/san-pham")
public class QuanLySanPhamController {
    private static final Pattern MA_HOP_LE = Pattern.compile("^[A-Z0-9_-]{2,10}$");
    private static final Set<String> LOAI_SAN_PHAM = Set.of("DO_AN", "THUC_UONG");
    private static final Set<String> TRANG_THAI = Set.of("DANG_BAN", "NGUNG_BAN");

    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public QuanLySanPhamController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    public record SanPhamRequest(
            String maSanPham, String tenSanPham, String loaiSanPham,
            String donViTinh, BigDecimal giaBan, String moTa,
            String hinhAnh, String trangThai, Integer mucTonToiThieu) {}

    public record ThanhPhanCombo(String maSanPham, Integer soLuong) {}

    public record ComboRequest(
            String maCombo, String tenCombo, BigDecimal giaCombo,
            String hinhAnh, String moTa, String trangThai,
            List<ThanhPhanCombo> thanhPhan) {}

    public record TrangThaiRequest(String trangThai) {}

    @GetMapping
    public List<Map<String, Object>> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                              @RequestParam(defaultValue = "") String loai,
                                              @RequestParam(defaultValue = "") String trangThai,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return jdbc.queryForList("""
                SELECT maSanPham AS ma, tenSanPham AS ten, loaiSanPham AS loai, giaBan AS gia,
                       hinhAnh, moTa, trangThai FROM SANPHAM
                UNION ALL
                SELECT maCombo, tenCombo, 'COMBO', giaCombo, hinhAnh, moTa, trangThai FROM COMBO
                ORDER BY ten
                """).stream()
                .filter(m -> loai.isBlank() || loai.equals(m.get("loai")))
                .filter(m -> trangThai.isBlank() || trangThai.equals(m.get("trangThai")))
                .filter(m -> tuKhoa.isBlank() || TimKiem.chua((String) m.get("ten"), tuKhoa)
                        || TimKiem.chua((String) m.get("ma"), tuKhoa))
                .toList();
    }

    @GetMapping("/{ma}")
    public Map<String, Object> chiTiet(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        List<Map<String, Object>> sp = jdbc.queryForList("""
                SELECT maSanPham, tenSanPham, loaiSanPham, donViTinh, giaBan,
                       hinhAnh, moTa, trangThai, soLuongTon, mucTonToiThieu
                FROM SANPHAM WHERE maSanPham = ?
                """, ma);
        if (!sp.isEmpty()) {
            Map<String, Object> result = new LinkedHashMap<>(sp.get(0));
            result.put("loaiDoiTuong", "SAN_PHAM");
            return result;
        }
        List<Map<String, Object>> combos = jdbc.queryForList("""
                SELECT maCombo, tenCombo, giaCombo, hinhAnh, moTa, trangThai
                FROM COMBO WHERE maCombo = ?
                """, ma);
        if (combos.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm hoặc combo");
        }
        Map<String, Object> result = new LinkedHashMap<>(combos.get(0));
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

    @PostMapping("/mat-hang")
    @Transactional
    public Map<String, Object> taoSanPham(@RequestBody SanPhamRequest req, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        String ma = chuanHoaMa(req.maSanPham(), "Mã sản phẩm");
        kiemTraSanPham(req);
        if (daTonTaiMa(ma)) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã sản phẩm hoặc combo đã tồn tại");
        }
        int mucMin = req.mucTonToiThieu() == null ? 5 : req.mucTonToiThieu();
        jdbc.update("""
                INSERT INTO SANPHAM (maSanPham, tenSanPham, loaiSanPham, donViTinh, giaBan,
                                     moTa, hinhAnh, trangThai, soLuongTon, mucTonToiThieu)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
                """,
                ma, req.tenSanPham().trim(), req.loaiSanPham(), req.donViTinh().trim(),
                req.giaBan(), req.moTa().trim(), rongThanhNull(req.hinhAnh()),
                req.trangThai(), mucMin);
        return chiTiet(ma, session);
    }

    @PutMapping("/mat-hang/{ma}")
    @Transactional
    public Map<String, Object> capNhatSanPham(@PathVariable String ma, @RequestBody SanPhamRequest req,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        kiemTraSanPham(req);
        int updated = jdbc.update("""
                UPDATE SANPHAM
                SET tenSanPham = ?, loaiSanPham = ?, donViTinh = ?, giaBan = ?,
                    moTa = ?, hinhAnh = ?, trangThai = ?,
                    mucTonToiThieu = COALESCE(?, mucTonToiThieu)
                WHERE maSanPham = ?
                """,
                req.tenSanPham().trim(), req.loaiSanPham(), req.donViTinh().trim(),
                req.giaBan(), req.moTa().trim(), rongThanhNull(req.hinhAnh()),
                req.trangThai(), req.mucTonToiThieu(), ma);
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm");
        }
        return chiTiet(ma, session);
    }

    @PostMapping("/combo")
    @Transactional
    public Map<String, Object> taoCombo(@RequestBody ComboRequest req, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        String ma = chuanHoaMa(req.maCombo(), "Mã combo");
        kiemTraCombo(req);
        if (daTonTaiMa(ma)) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã sản phẩm hoặc combo đã tồn tại");
        }
        jdbc.update("""
                INSERT INTO COMBO (maCombo, tenCombo, giaCombo, hinhAnh, moTa, trangThai)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                ma, req.tenCombo().trim(), req.giaCombo(), rongThanhNull(req.hinhAnh()),
                req.moTa().trim(), req.trangThai());
        luuThanhPhanCombo(ma, req.thanhPhan());
        return chiTiet(ma, session);
    }

    @PutMapping("/combo/{ma}")
    @Transactional
    public Map<String, Object> capNhatCombo(@PathVariable String ma, @RequestBody ComboRequest req,
                                            HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        kiemTraCombo(req);
        int updated = jdbc.update("""
                UPDATE COMBO
                SET tenCombo = ?, giaCombo = ?, hinhAnh = ?, moTa = ?, trangThai = ?
                WHERE maCombo = ?
                """,
                req.tenCombo().trim(), req.giaCombo(), rongThanhNull(req.hinhAnh()),
                req.moTa().trim(), req.trangThai(), ma);
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy combo");
        }
        jdbc.update("DELETE FROM CHITIETCOMBO WHERE maCombo = ?", ma);
        luuThanhPhanCombo(ma, req.thanhPhan());
        return chiTiet(ma, session);
    }

    @PatchMapping("/{ma}/trang-thai")
    @Transactional
    public Map<String, Object> doiTrangThai(@PathVariable String ma, @RequestBody TrangThaiRequest req,
                                            HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        if (req == null || !TRANG_THAI.contains(req.trangThai())) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ");
        }
        int updated = jdbc.update("UPDATE SANPHAM SET trangThai = ? WHERE maSanPham = ?", req.trangThai(), ma);
        if (updated == 0) {
            updated = jdbc.update("UPDATE COMBO SET trangThai = ? WHERE maCombo = ?", req.trangThai(), ma);
        }
        if (updated == 0) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm hoặc combo");
        }
        return Map.of("ma", ma, "trangThai", req.trangThai());
    }

    private String chuanHoaMa(String raw, String nhan) {
        String ma = raw == null ? "" : raw.trim().toUpperCase();
        if (!MA_HOP_LE.matcher(ma).matches()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, nhan + " gồm 2–10 ký tự chữ in hoa, số, _ hoặc -");
        }
        return ma;
    }

    private boolean daTonTaiMa(String ma) {
        Integer spCount = jdbc.queryForObject("SELECT COUNT(*) FROM SANPHAM WHERE maSanPham = ?", Integer.class, ma);
        Integer cbCount = jdbc.queryForObject("SELECT COUNT(*) FROM COMBO WHERE maCombo = ?", Integer.class, ma);
        return (spCount != null && spCount > 0) || (cbCount != null && cbCount > 0);
    }

    private void kiemTraSanPham(SanPhamRequest req) {
        if (req == null || isBlank(req.tenSanPham()) || isBlank(req.donViTinh()) || isBlank(req.moTa())
                || !LOAI_SAN_PHAM.contains(req.loaiSanPham()) || !TRANG_THAI.contains(req.trangThai())
                || req.giaBan() == null || req.giaBan().signum() < 0
                || (req.mucTonToiThieu() != null && req.mucTonToiThieu() < 0)) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đầy đủ thông tin và giá bán hợp lệ");
        }
        if (req.tenSanPham().trim().length() > 100 || req.donViTinh().trim().length() > 20) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Tên hoặc đơn vị tính vượt quá độ dài cho phép");
        }
    }

    private void kiemTraCombo(ComboRequest req) {
        if (req == null || isBlank(req.tenCombo()) || isBlank(req.moTa())
                || !TRANG_THAI.contains(req.trangThai())
                || req.giaCombo() == null || req.giaCombo().signum() < 0
                || req.thanhPhan() == null || req.thanhPhan().isEmpty()) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Vui lòng nhập đủ thông tin combo và ít nhất một sản phẩm thành phần");
        }
        if (req.tenCombo().trim().length() > 100 || req.moTa().trim().length() > 255) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Tên hoặc mô tả combo vượt quá độ dài cho phép");
        }
        Set<String> seen = new HashSet<>();
        for (ThanhPhanCombo tp : req.thanhPhan()) {
            if (tp == null || isBlank(tp.maSanPham()) || tp.soLuong() == null || tp.soLuong() <= 0) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Mỗi thành phần combo cần sản phẩm và số lượng nguyên dương");
            }
            if (!seen.add(tp.maSanPham())) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Không chọn trùng một sản phẩm trong nhiều dòng");
            }
            Integer tonTai = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM SANPHAM WHERE maSanPham = ?", Integer.class, tp.maSanPham());
            if (tonTai == null || tonTai == 0) {
                throw new NghiepVuException(HttpStatus.BAD_REQUEST, "Sản phẩm thành phần không tồn tại: " + tp.maSanPham());
            }
        }
    }

    private void luuThanhPhanCombo(String maCombo, List<ThanhPhanCombo> thanhPhan) {
        for (ThanhPhanCombo tp : thanhPhan) {
            jdbc.update("INSERT INTO CHITIETCOMBO (maCombo, maSanPham, soLuong) VALUES (?, ?, ?)",
                    maCombo, tp.maSanPham(), tp.soLuong());
        }
    }

    private String rongThanhNull(String s) {
        return s == null || s.trim().isEmpty() ? null : s.trim();
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
