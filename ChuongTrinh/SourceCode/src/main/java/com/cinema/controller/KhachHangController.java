package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.service.KhachHangService;
import com.cinema.util.NguoiDung;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Giao diện 28 - Hồ sơ khách hàng và điểm thành viên (UC7.2, UC7.6).
 * Chỉ đọc: không sửa điểm. Chỉnh sửa hồ sơ là giao diện mẫu.
 */
@RestController
@RequestMapping("/api/khach-hang")
public class KhachHangController {
    private final KhachHangService service;
    private final PhienDangNhap dangNhap;

    public KhachHangController(KhachHangService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping("/toi")
    public Map<String, Object> cuaToi(HttpSession session) {
        NguoiDung nd = dangNhap.yeuCau(session, VaiTro.KHACH_HANG);
        return service.hoSo(nd.maKhachHang());
    }

    @GetMapping("/{ma}")
    public Map<String, Object> theoMa(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.ADMIN, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return service.hoSo(ma);
    }
}
