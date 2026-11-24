package com.cinema.controller;

import com.cinema.dto.PhongChieuDto;
import com.cinema.dto.SoDoPhongDto;
import com.cinema.enums.TrangThaiPhong;
import com.cinema.enums.VaiTro;
import com.cinema.service.PhongChieuService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** API phòng chiếu cho quản lý (giao diện 18, 19, 20). Phần thêm / sửa / đổi trạng thái là giao diện mẫu. */
@RestController
@RequestMapping("/api/phong-chieu")
public class PhongChieuController {

    private final PhongChieuService phongChieuService;
    private final PhienDangNhap phienDangNhap;

    public PhongChieuController(PhongChieuService phongChieuService, PhienDangNhap phienDangNhap) {
        this.phongChieuService = phongChieuService;
        this.phienDangNhap = phienDangNhap;
    }

    @GetMapping
    public List<PhongChieuDto> danhSach(@RequestParam(required = false) String tuKhoa,
                                        @RequestParam(required = false) String loaiPhong,
                                        @RequestParam(required = false) TrangThaiPhong trangThai,
                                        HttpSession session) {
        phienDangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return phongChieuService.timKiemPhong(tuKhoa, loaiPhong, trangThai);
    }

    @GetMapping("/{maPhong}")
    public PhongChieuDto chiTiet(@PathVariable String maPhong, HttpSession session) {
        phienDangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return phongChieuService.xemChiTietPhong(maPhong);
    }

    @GetMapping("/{maPhong}/so-do")
    public SoDoPhongDto soDo(@PathVariable String maPhong, HttpSession session) {
        phienDangNhap.yeuCau(session, VaiTro.QUAN_LY);
        return phongChieuService.xemSoDo(maPhong);
    }
}
