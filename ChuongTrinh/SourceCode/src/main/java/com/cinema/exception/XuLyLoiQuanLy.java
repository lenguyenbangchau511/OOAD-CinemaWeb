package com.cinema.exception;

import com.cinema.controller.GiaVeController;
import com.cinema.controller.KhuyenMaiController;
import com.cinema.controller.QuanLyPhimController;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.cinema.controller.KhachHangController;
import com.cinema.controller.BaoCaoController;

/** Đổi NghiepVuException thành JSON {ma, thongBao} cho các API (24, 28, 36, 45). */
@RestControllerAdvice(assignableTypes = {GiaVeController.class, KhuyenMaiController.class, KhachHangController.class, BaoCaoController.class, QuanLyPhimController.class})
public class XuLyLoiQuanLy {

    @ExceptionHandler(NghiepVuException.class)
    public ResponseEntity<Map<String, String>> xuLy(NghiepVuException loi) {
        return ResponseEntity.status(loi.getTrangThai())
                .body(Map.of("ma", loi.getMa(), "thongBao", loi.getMessage()));
    }
}