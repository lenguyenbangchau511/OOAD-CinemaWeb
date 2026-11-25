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
    private final com.cinema.service.KhoiPhucMatKhauService khoiPhuc;
    public AuthController(XacThucService service, com.cinema.service.KhoiPhucMatKhauService khoiPhuc) { this.service = service; this.khoiPhuc = khoiPhuc; }
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
    public record TaoThanhVienRequest(String hoTen, String email, String soDienThoai,
                                      String tenDangNhap, String matKhau, String xacNhan, boolean noiBo) {}
    @PostMapping(value = "/dang-ky", consumes = "application/json")
    public ResponseEntity<Void> dangKy(@RequestBody TaoThanhVienRequest body, HttpServletRequest request) {
        service.dangKy(body.hoTen(), body.email(), body.soDienThoai(), body.tenDangNhap(),
                body.matKhau(), body.xacNhan(), body.noiBo(), request.getSession(false));
        return ResponseEntity.status(201).header("Cache-Control", "no-store").build();
    }
    public record MatKhauRequest(String hienTai) {}
    @PostMapping(value = "/toi/kiem-tra-mat-khau", consumes = "application/json")
    public ResponseEntity<Void> kiemTraMatKhau(@RequestBody MatKhauRequest body, HttpServletRequest request) {
        service.kiemTraMatKhau(body.hienTai(), request.getSession(false));
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
    public record DoiMatKhauRequest(String hienTai, String matKhauMoi, String xacNhan) {}
    @PostMapping(value = "/toi/doi-mat-khau", consumes = "application/json")
    public ResponseEntity<Void> doiMatKhau(@RequestBody DoiMatKhauRequest body, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        service.doiMatKhau(body.hienTai(), body.matKhauMoi(), body.xacNhan(), session);
        // Service đã hủy mọi phiên của tài khoản sau khi cập nhật thành công.
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
    public record HoSoRequest(String hoTen, String soDienThoai) {}
    @PostMapping(value = "/toi/ho-so", consumes = "application/json")
    public ResponseEntity<XacThucService.ThongTin> capNhatHoSo(@RequestBody HoSoRequest body, HttpServletRequest request) {
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(service.capNhatHoSo(body.hoTen(), body.soDienThoai(), request.getSession(false)));
    }
    public record QuenRequest(String email) {}
    public record TokenRequest(String token) {}
    public record DatLaiRequest(String token, String matKhauMoi, String xacNhan) {}
    @GetMapping("/khoi-phuc/trang-thai")
    public ResponseEntity<java.util.Map<String, String>> trangThaiKhoiPhuc() {
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(java.util.Map.of("cheDo", khoiPhuc.cheDo()));
    }
    @PostMapping(value = "/quen-mat-khau", consumes = "application/json")
    public ResponseEntity<Void> quen(@RequestBody QuenRequest body) {
        khoiPhuc.yeuCau(body.email());
        return ResponseEntity.accepted().header("Cache-Control", "no-store").build();
    }
    @PostMapping(value = "/kiem-tra-lien-ket", consumes = "application/json")
    public ResponseEntity<Void> kiemTraLienKet(@RequestBody TokenRequest body) {
        khoiPhuc.kiemTra(body.token());
        return ResponseEntity.noContent().header("Cache-Control", "no-store").build();
    }
    @PostMapping(value = "/dat-lai-mat-khau", consumes = "application/json")
    public ResponseEntity<Void> datLai(@RequestBody DatLaiRequest body) {
        khoiPhuc.datLai(body.token(), body.matKhauMoi(), body.xacNhan());
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
