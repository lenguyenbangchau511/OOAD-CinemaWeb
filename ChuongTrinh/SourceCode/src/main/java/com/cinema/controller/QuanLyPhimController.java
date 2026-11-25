package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.exception.NghiepVuException;
import com.cinema.util.PhienDangNhap;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/phim")
public class QuanLyPhimController {
    private final JdbcTemplate jdbc;
    private final PhienDangNhap dangNhap;

    public QuanLyPhimController(JdbcTemplate jdbc, PhienDangNhap dangNhap) {
        this.jdbc = jdbc;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                             @RequestParam(defaultValue = "") String trangThai,
                                             HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return jdbc.queryForList("SELECT * FROM PHIM ORDER BY tenPhim").stream()
                .filter(p -> trangThai.isBlank() || trangThai.equals(p.get("trangThai")))
                .filter(p -> tuKhoa.isBlank() || TimKiem.chua((String) p.get("tenPhim"), tuKhoa)
                        || TimKiem.chua((String) p.get("maPhim"), tuKhoa))
                .toList();
    }

    @GetMapping("/{maPhim}")
    public Map<String, Object> chiTiet(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return jdbc.queryForList("SELECT * FROM PHIM WHERE maPhim = ?", maPhim).stream().findFirst()
                .orElseThrow(() -> new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void them(@RequestBody PhimForm p, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        String maPhim = chuoi(p.maPhim(), "Mã phim", 10, true);
        if (!maPhim.matches("[A-Za-z0-9_-]+")) throw khongHopLe("Mã phim chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới");
        try {
            jdbc.update("""
                    INSERT INTO PHIM (tenPhim, theLoai, thoiLuong, daoDien, dienVien, ngayKhoiChieu,
                                      quocGia, noiDung, poster, gioiHanDoTuoi, trangThai, maPhim)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, duLieu(p, maPhim));
        } catch (DuplicateKeyException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Mã phim đã tồn tại");
        }
    }

    @PutMapping("/{maPhim}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sua(@PathVariable String maPhim, @RequestBody PhimForm p, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        int soDong = jdbc.update("""
                UPDATE PHIM SET tenPhim = ?, theLoai = ?, thoiLuong = ?, daoDien = ?, dienVien = ?,
                                ngayKhoiChieu = ?, quocGia = ?, noiDung = ?, poster = ?,
                                gioiHanDoTuoi = ?, trangThai = ?
                WHERE maPhim = ?
                """, duLieu(p, maPhim));
        if (soDong == 0) chiTiet(maPhim, session);
    }

    @PatchMapping("/{maPhim}/ngung-chieu")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ngungChieu(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        int soDong = jdbc.update("UPDATE PHIM SET trangThai = 'NGUNG_CHIEU' WHERE maPhim = ?", maPhim);
        if (soDong == 0) chiTiet(maPhim, session);
    }

    @DeleteMapping("/{maPhim}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        try {
            if (jdbc.update("DELETE FROM PHIM WHERE maPhim = ?", maPhim) == 0) {
                throw new NghiepVuException(HttpStatus.NOT_FOUND, "Không tìm thấy phim");
            }
        } catch (DataIntegrityViolationException e) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Phim đã có suất chiếu. Hãy dùng Ngừng chiếu để giữ lịch sử.");
        }
    }

    private Object[] duLieu(PhimForm p, String maPhim) {
        if (p.thoiLuong() == null || p.thoiLuong() < 1) throw khongHopLe("Thời lượng phải lớn hơn 0");
        if (p.ngayKhoiChieu() == null) throw khongHopLe("Vui lòng nhập ngày khởi chiếu");
        String tuoi = chuoi(p.gioiHanDoTuoi(), "Giới hạn độ tuổi", 10, true);
        String trangThai = chuoi(p.trangThai(), "Trạng thái", 30, true);
        if (!Set.of("P", "K", "T13", "T16", "T18", "C").contains(tuoi)) throw khongHopLe("Giới hạn độ tuổi không hợp lệ");
        if (!Set.of("SAP_CHIEU", "DANG_CHIEU", "NGUNG_CHIEU").contains(trangThai)) throw khongHopLe("Trạng thái không hợp lệ");
        String poster = chuoi(p.poster(), "Tên file poster", 255, false);
        if (poster.contains("/") || poster.contains("\\") || poster.equals(".") || poster.equals("..")) {
            throw khongHopLe("Poster phải là tên file trong thư mục images");
        }
        String noiDung = p.noiDung() == null ? "" : p.noiDung().strip();
        if (noiDung.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 65_535) {
            throw khongHopLe("Nội dung phim quá dài");
        }
        return new Object[]{chuoi(p.tenPhim(), "Tên phim", 100, true),
                chuoi(p.theLoai(), "Thể loại", 50, true), p.thoiLuong(),
                chuoi(p.daoDien(), "Đạo diễn", 50, false), chuoi(p.dienVien(), "Diễn viên", 200, false),
                p.ngayKhoiChieu(), chuoi(p.quocGia(), "Quốc gia", 50, false),
                noiDung, poster, tuoi, trangThai, maPhim};
    }

    private String chuoi(String giaTri, String nhan, int gioiHan, boolean batBuoc) {
        String ketQua = giaTri == null ? "" : giaTri.strip();
        if (batBuoc && ketQua.isEmpty()) throw khongHopLe("Vui lòng nhập " + nhan.toLowerCase());
        if (ketQua.length() > gioiHan) throw khongHopLe(nhan + " dài tối đa " + gioiHan + " ký tự");
        return ketQua;
    }

    private NghiepVuException khongHopLe(String thongBao) {
        return new NghiepVuException(HttpStatus.BAD_REQUEST, thongBao);
    }

    public record PhimForm(String maPhim, String tenPhim, String theLoai, Integer thoiLuong,
                           String daoDien, String dienVien, LocalDate ngayKhoiChieu, String quocGia,
                           String noiDung, String poster, String gioiHanDoTuoi, String trangThai) {}
}
