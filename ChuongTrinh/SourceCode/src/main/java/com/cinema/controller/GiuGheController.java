package com.cinema.controller;

import com.cinema.dto.GiuGheRequest;
import com.cinema.dto.PhienGiuDto;
import com.cinema.service.GiuGheService;
import com.cinema.util.PhienDangNhap;
import jakarta.servlet.http.HttpSession;
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
        return giuGheService.giuGhe(phienDangNhap.yeuCau(session), req);
    }

    @GetMapping("/{maPhienGiu}")
    public PhienGiuDto xemPhien(@PathVariable String maPhienGiu, HttpSession session) {
        return giuGheService.xemPhien(phienDangNhap.yeuCau(session), maPhienGiu);
    }

    @DeleteMapping("/{maPhienGiu}/ghe/{maGheSuat}")
    public PhienGiuDto boGiuGhe(@PathVariable String maPhienGiu, @PathVariable String maGheSuat, HttpSession session) {
        return giuGheService.boGiuGhe(phienDangNhap.yeuCau(session), maPhienGiu, maGheSuat);
    }

    @DeleteMapping("/{maPhienGiu}")
    public ResponseEntity<Void> huyPhien(@PathVariable String maPhienGiu, HttpSession session) {
        giuGheService.huyPhien(phienDangNhap.yeuCau(session), maPhienGiu);
        return ResponseEntity.noContent().build();
    }
}
