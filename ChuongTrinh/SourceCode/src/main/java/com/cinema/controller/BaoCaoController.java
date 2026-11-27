package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.service.BaoCaoService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Giao diện 45 - Báo cáo doanh thu (UC11.1). Các tab thống kê khác và xuất Excel là giao diện mẫu.
 */
@RestController
@RequestMapping("/api/bao-cao")
public class BaoCaoController {
    private final BaoCaoService service;
    private final PhienDangNhap dangNhap;

    public BaoCaoController(BaoCaoService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping("/doanh-thu")
    public List<Map<String, Object>> doanhThu(@RequestParam String tuNgay, @RequestParam String denNgay,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.doanhThu(tuNgay, denNgay);
    }
}
