package com.cinema.controller;

import com.cinema.dto.GiuGheRequest;
import com.cinema.dto.PhienGiuDto;
import com.cinema.exception.NghiepVuException;
import com.cinema.service.GiuGheService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** API giữ ghế tạm thời (UC5.2, giao diện 7). Yêu cầu đã đăng nhập. */
@RestController
@RequestMapping("/api/giu-ghe")
public class GiuGheController {

    private final GiuGheService giuGheService;
    private final PhienDangNhap phienDangNhap;

    public GiuGheController(GiuGheService giuGheService, PhienDangNhap phienDangNhap) {
        this.giuGheService = giuGheService;
        this.phienDangNhap = phienDangNhap;
    }

    /** Giữ thêm ghế; chưa có maPhienGiu thì hệ thống tạo phiên mới. */
    @PostMapping
    public PhienGiuDto giuGhe(@RequestBody GiuGheRequest req, HttpSession session) {
        var nguoiDung = phienDangNhap.yeuCau(session);
        synchronized (session) {
            kiemTraChuaXacNhan(session, req.maPhienGiu());
            return giuGheService.giuGhe(nguoiDung, req);
        }
    }

    @GetMapping("/{maPhienGiu}")
    public PhienGiuDto xemPhien(@PathVariable String maPhienGiu, HttpSession session) {
        return giuGheService.xemPhien(phienDangNhap.yeuCau(session), maPhienGiu);
    }

    @DeleteMapping("/{maPhienGiu}/ghe/{maGheSuat}")
    public PhienGiuDto boGiuGhe(@PathVariable String maPhienGiu, @PathVariable String maGheSuat, HttpSession session) {
        var nguoiDung = phienDangNhap.yeuCau(session);
        synchronized (session) {
            kiemTraChuaXacNhan(session, maPhienGiu);
            return giuGheService.boGiuGhe(nguoiDung, maPhienGiu, maGheSuat);
        }
    }

    @DeleteMapping("/{maPhienGiu}")
    public ResponseEntity<Void> huyPhien(@PathVariable String maPhienGiu, HttpSession session) {
        var nguoiDung = phienDangNhap.yeuCau(session);
        synchronized (session) {
            kiemTraChuaXacNhan(session, maPhienGiu);
            giuGheService.huyPhien(nguoiDung, maPhienGiu);
        }
        return ResponseEntity.noContent().build();
    }

    private void kiemTraChuaXacNhan(HttpSession session, String maPhienGiu) {
        if (maPhienGiu != null && session.getAttribute(DonDatVeController.KHOA_DON_DAT_VE + maPhienGiu) != null) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "Đơn đã được xác nhận. Vui lòng tiếp tục thanh toán.");
        }
    }
}
