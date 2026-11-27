package com.cinema.controller;

import com.cinema.service.KhuyenMaiService;
import com.cinema.util.NguoiDung;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Giao diện 36, 37 - Đọc danh sách khuyến mãi (UC9.4, UC9.5).
 * Thêm, sửa, xóa khuyến mãi là giao diện mẫu nên không có API ghi dữ liệu.
 */
@RestController
@RequestMapping("/api/khuyen-mai")
public class KhuyenMaiController {
    private final KhuyenMaiService service;
    private final PhienDangNhap dangNhap;

    public KhuyenMaiController(KhuyenMaiService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping("/truc-tuyen")
    public List<Map<String, Object>> danhSachTrucTuyen() {
        return service.danhSachTrucTuyen();
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(HttpSession session) {
        NguoiDung nd = dangNhap.yeuCau(session);
        return service.danhSach(nd.laKhachHang());
    }
}
