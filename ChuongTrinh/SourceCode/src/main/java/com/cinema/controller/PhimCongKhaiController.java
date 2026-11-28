package com.cinema.controller;

import com.cinema.entity.Phim;
import com.cinema.service.PhimCongKhaiService;
import com.cinema.service.QuanLyPhimService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phim")
public class PhimCongKhaiController {
    private final PhimCongKhaiService service;

    public PhimCongKhaiController(PhimCongKhaiService service) {
        this.service = service;
    }

    @GetMapping
    public List<Phim> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                @RequestParam(defaultValue = "") String theLoai,
                                @RequestParam(defaultValue = "") String gioiHanDoTuoi,
                                @RequestParam(defaultValue = "") String trangThai) {
        return service.danhSach(tuKhoa, theLoai, gioiHanDoTuoi, trangThai);
    }

    @GetMapping("/{maPhim}")
    public QuanLyPhimService.ChiTietPhim chiTiet(@PathVariable String maPhim) {
        return service.chiTiet(maPhim);
    }
}
