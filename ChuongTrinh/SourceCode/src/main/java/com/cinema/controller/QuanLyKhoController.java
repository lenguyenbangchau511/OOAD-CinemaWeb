package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.service.QuanLyKhoService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/ton-kho")
public class QuanLyKhoController {
    private final QuanLyKhoService service;
    private final PhienDangNhap dangNhap;

    public QuanLyKhoController(QuanLyKhoService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

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
        return service.danhSach(tuKhoa, loai, tinhTrang);
    }

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
        return service.lichSuBienDong(maSanPham, loai);
    }

    @GetMapping("/chi-tiet/{ma}")
    public Map<String, Object> chiTiet(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return service.chiTiet(ma);
    }
}
