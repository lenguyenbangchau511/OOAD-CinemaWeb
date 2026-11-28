package com.cinema.controller;

import com.cinema.dto.PhimForm;
import com.cinema.entity.Phim;
import com.cinema.enums.VaiTro;
import com.cinema.service.QuanLyPhimService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-ly/phim")
public class QuanLyPhimController {
    private final QuanLyPhimService service;
    private final PhienDangNhap dangNhap;

    public QuanLyPhimController(QuanLyPhimService service, PhienDangNhap dangNhap) {
        this.service = service;
        this.dangNhap = dangNhap;
    }

    @GetMapping
    public List<Phim> danhSach(@RequestParam(defaultValue = "") String tuKhoa,
                                             @RequestParam(defaultValue = "") String trangThai,
                                             @RequestParam(defaultValue = "") String theLoai,
                                             @RequestParam(defaultValue = "") String gioiHanDoTuoi,
                                             HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return service.danhSach(tuKhoa, theLoai, gioiHanDoTuoi, trangThai);
    }

    @GetMapping("/{maPhim}")
    public QuanLyPhimService.ChiTietPhim chiTiet(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        return service.chiTiet(maPhim);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void them(@RequestBody PhimForm p, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        service.them(p);
    }

    @PutMapping("/{maPhim}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sua(@PathVariable String maPhim, @RequestBody PhimForm p, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        service.sua(maPhim, p);
    }

    @PatchMapping("/{maPhim}/ngung-chieu")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void ngungChieu(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        service.ngungChieu(maPhim);
    }

    @DeleteMapping("/{maPhim}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void xoa(@PathVariable String maPhim, HttpSession session) {
        dangNhap.yeuCau(session, VaiTro.QUAN_LY);
        service.xoa(maPhim);
    }
}
