package com.cinema.controller;

import com.cinema.dto.ComboRequest;
import com.cinema.dto.SanPhamRequest;
import com.cinema.dto.TrangThaiRequest;
import com.cinema.enums.VaiTro;
import com.cinema.service.QuanLySanPhamService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/san-pham")
public class QuanLySanPhamController {
    private final QuanLySanPhamService service;
    private final PhienDangNhap dangNhap;

    public QuanLySanPhamController(QuanLySanPhamService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                              @RequestParam(defaultValue = "") String loai,
                                              @RequestParam(defaultValue = "") String trangThai,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.danhSach(tuKhoa, loai, trangThai);
    }

    @GetMapping("/{ma}")
    public Map<String, Object> chiTiet(@PathVariable String ma, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.chiTiet(ma);
    }

    @PostMapping("/mat-hang")
    public Map<String, Object> taoSanPham(@RequestBody SanPhamRequest req, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.taoSanPham(req);
    }

    @PutMapping("/mat-hang/{ma}")
    public Map<String, Object> capNhatSanPham(@PathVariable String ma, @RequestBody SanPhamRequest req,
                                              HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.capNhatSanPham(ma, req);
    }

    @PostMapping("/combo")
    public Map<String, Object> taoCombo(@RequestBody ComboRequest req, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.taoCombo(req);
    }

    @PutMapping("/combo/{ma}")
    public Map<String, Object> capNhatCombo(@PathVariable String ma, @RequestBody ComboRequest req,
                                            HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.capNhatCombo(ma, req);
    }

    @PatchMapping("/{ma}/trang-thai")
    public Map<String, Object> doiTrangThai(@PathVariable String ma, @RequestBody TrangThaiRequest req,
                                            HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return service.doiTrangThai(ma, req);
    }
}
