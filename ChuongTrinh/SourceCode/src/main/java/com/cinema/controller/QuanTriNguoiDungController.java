package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.repository.TaiKhoanTraCuuRepository;
import com.cinema.service.XacThucService;
import com.cinema.util.TimKiem;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quan-tri")
public class QuanTriNguoiDungController {
    private final XacThucService auth;
    private final TaiKhoanTraCuuRepository repo;
    public QuanTriNguoiDungController(XacThucService auth, TaiKhoanTraCuuRepository repo) {
        this.auth = auth; this.repo = repo;
    }
    @GetMapping("/khach-hang")
    public ResponseEntity<List<Map<String, Object>>> khachHang(@RequestParam(defaultValue = "") String tuKhoa, HttpServletRequest request) {
        auth.hienTai(request.getSession(false), VaiTro.ADMIN, VaiTro.QUAN_LY, VaiTro.NHAN_VIEN);
        var ds = repo.khachHang().stream().filter(r -> List.of("maKhachHang", "hoTen", "soDienThoai", "email", "tenDangNhap").stream()
            .anyMatch(c -> TimKiem.chua((String) r.get(c), tuKhoa))).toList();
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(ds);
    }
    @GetMapping("/nhan-vien")
    public ResponseEntity<List<Map<String, Object>>> nhanVien(HttpServletRequest request) {
        auth.hienTai(request.getSession(false), VaiTro.ADMIN, VaiTro.QUAN_LY);
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(repo.nhanVien());
    }
    @GetMapping("/tai-khoan")
    public ResponseEntity<List<Map<String, Object>>> taiKhoan(HttpServletRequest request) {
        auth.hienTai(request.getSession(false), VaiTro.ADMIN);
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(repo.taiKhoanNhanVien());
    }
    // Kiểm tra trùng khi Admin tạo tài khoản mẫu, kể cả tài khoản khách hàng.
    @PostMapping("/kiem-tra-trung")
    public Map<String, Boolean> kiemTra(@RequestBody Map<String, String> body, HttpServletRequest request) {
        auth.hienTai(request.getSession(false), VaiTro.ADMIN);
        return Map.of("email", repo.trungEmail(body.getOrDefault("email", "")),
                      "tenDangNhap", repo.trungTen(body.getOrDefault("tenDangNhap", "")));
    }
}
