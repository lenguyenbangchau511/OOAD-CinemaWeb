package com.cinema.controller;

import com.cinema.service.GiaVeService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Thêm, sửa, xóa giá vé là giao diện mẫu nên không có API ghi dữ liệu.
 */
@RestController
@RequestMapping("/api/gia-ve")
public class GiaVeController {
    private final GiaVeService service;
    private final PhienDangNhap dangNhap;

    public GiaVeController(GiaVeService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(HttpSession session) {
        dangNhap.yeuCau(session);   // UC6.4: người dùng đã đăng nhập
        return service.danhSach();
    }
}
