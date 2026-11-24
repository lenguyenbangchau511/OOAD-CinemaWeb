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
import com.cinema.exception.NghiepVuException;
import org.springframework.http.HttpStatus;

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
        phienDangNhap.yeuCau(session);
        if (req.maPhienGiu() != null && !req.maPhienGiu().isBlank()) {
            yeuCauPhien(session, req.maPhienGiu());
        }
        PhienGiuDto phien = giuGheService.giuGhe(req);
        session.setAttribute("giuGhe:" + phien.maPhienGiu(), session.getAttribute("maTaiKhoan") == null
                ? "DEV" : session.getAttribute("maTaiKhoan"));
        return phien;
    }

    @GetMapping("/{maPhienGiu}")
    public PhienGiuDto xemPhien(@PathVariable String maPhienGiu, HttpSession session) {
        phienDangNhap.yeuCau(session);
        yeuCauPhien(session, maPhienGiu);
        return giuGheService.xemPhien(maPhienGiu);
    }

    @DeleteMapping("/{maPhienGiu}/ghe/{maGheSuat}")
    public PhienGiuDto boGiuGhe(@PathVariable String maPhienGiu, @PathVariable String maGheSuat, HttpSession session) {
        phienDangNhap.yeuCau(session);
        yeuCauPhien(session, maPhienGiu);
        return giuGheService.boGiuGhe(maPhienGiu, maGheSuat);
    }

    @DeleteMapping("/{maPhienGiu}")
    public ResponseEntity<Void> huyPhien(@PathVariable String maPhienGiu, HttpSession session) {
        phienDangNhap.yeuCau(session);
        yeuCauPhien(session, maPhienGiu);
        giuGheService.huyPhien(maPhienGiu);
        session.removeAttribute("giuGhe:" + maPhienGiu);
        return ResponseEntity.noContent().build();
    }

    static void yeuCauPhien(HttpSession session, String maPhienGiu) {
        Object taiKhoan = session.getAttribute("maTaiKhoan");
        if (maPhienGiu == null || !(taiKhoan == null ? "DEV" : taiKhoan)
                .equals(session.getAttribute("giuGhe:" + maPhienGiu))) {
            throw new NghiepVuException(HttpStatus.CONFLICT, "HET_GIU_GHE",
                    "Phiên giữ ghế không khả dụng. Vui lòng chọn lại ghế.");
        }
    }
}
