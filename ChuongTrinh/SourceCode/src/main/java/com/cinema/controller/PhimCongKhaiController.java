package com.cinema.controller;

import com.cinema.service.PhimCongKhaiService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phim")
public class PhimCongKhaiController {
    private final PhimCongKhaiService service;

    public PhimCongKhaiController(PhimCongKhaiService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> danhSach() {
        return service.danhSach();
    }

    @GetMapping("/{maPhim}")
    public Map<String, Object> chiTiet(@PathVariable String maPhim) {
        return service.chiTiet(maPhim);
    }
}
