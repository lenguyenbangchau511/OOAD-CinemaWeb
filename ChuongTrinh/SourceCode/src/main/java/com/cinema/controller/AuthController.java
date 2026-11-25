package com.cinema.controller;

import com.cinema.service.XacThucService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final XacThucService service;
    public AuthController(XacThucService service) { this.service = service; }
    public record DangNhapRequest(String taiKhoan, String matKhau) {}

    @PostMapping(value = "/dang-nhap", consumes = "application/json")
    public ResponseEntity<XacThucService.ThongTin> dangNhap(@RequestBody DangNhapRequest body, HttpServletRequest request) {
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(service.dangNhap(body.taiKhoan(), body.matKhau(), request));
    }
    public record SoDienThoaiRequest(String soDienThoai) {}
    @PostMapping(value = "/kiem-tra-so-dien-thoai", consumes = "application/json")
    public ResponseEntity<Void> kiemTraSoDienThoai(@RequestBody SoDienThoaiRequest body) {
        service.kiemTraSoDienThoai(body.soDienThoai(), null, false);
        return ResponseEntity.noContent().build();
    }
    @PostMapping(value = "/toi/kiem-tra-so-dien-thoai", consumes = "application/json")
    public ResponseEntity<Void> kiemTraSoDienThoaiCaNhan(@RequestBody SoDienThoaiRequest body, HttpServletRequest request) {
        service.kiemTraSoDienThoai(body.soDienThoai(), request.getSession(false), true);
        return ResponseEntity.noContent().build();
    }
    public record DangKyRequest(String email, String tenDangNhap, String soDienThoai) {}
    @PostMapping(value = "/kiem-tra-dang-ky", consumes = "application/json")
    public ResponseEntity<Void> kiemTraDangKy(@RequestBody DangKyRequest body) {
        service.kiemTraDangKy(body.email(), body.tenDangNhap(), body.soDienThoai());
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
    public record MatKhauRequest(String hienTai) {}
    @PostMapping(value = "/toi/kiem-tra-mat-khau", consumes = "application/json")
    public ResponseEntity<Void> kiemTraMatKhau(@RequestBody MatKhauRequest body, HttpServletRequest request) {
        service.kiemTraMatKhau(body.hienTai(), request.getSession(false));
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
    @GetMapping("/toi")
    public ResponseEntity<XacThucService.ThongTin> toi(HttpServletRequest request) {
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(service.hienTai(request.getSession(false)));
    }
    @PostMapping(value = "/dang-xuat", consumes = "application/json")
    public ResponseEntity<Void> dangXuat(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
}
