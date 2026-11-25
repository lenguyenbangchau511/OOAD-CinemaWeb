package com.cinema.controller;

import com.cinema.enums.VaiTro;
import com.cinema.repository.TaiKhoanTraCuuRepository;
import com.cinema.service.XacThucService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Cầu nối đọc dữ liệu thật cho giao diện 39 của Giang; không xử lý thêm/sửa hồ sơ. */
@RestController
@RequestMapping("/api/nhan-vien")
public class HoSoNhanVienTraCuuController {
    private final XacThucService auth;
    private final TaiKhoanTraCuuRepository repo;
    public HoSoNhanVienTraCuuController(XacThucService auth, TaiKhoanTraCuuRepository repo) { this.auth = auth; this.repo = repo; }
    @GetMapping
    public ResponseEntity<List<Map<String,Object>>> danhSach(HttpServletRequest request) {
        auth.hienTai(request.getSession(false), VaiTro.ADMIN, VaiTro.QUAN_LY);
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(repo.hoSoNhanVien());
    }
}
