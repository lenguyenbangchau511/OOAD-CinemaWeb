package com.cinema.exception;

import com.cinema.controller.AuthController;
import com.cinema.controller.QuanTriNguoiDungController;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Không thay đổi advice của các module khác. */
@RestControllerAdvice(assignableTypes = {AuthController.class, QuanTriNguoiDungController.class})
public class XuLyLoiXacThuc {
    @ExceptionHandler(NghiepVuException.class)
    public ResponseEntity<Map<String, String>> xuLy(NghiepVuException loi) {
        return ResponseEntity.status(loi.getTrangThai()).header("Cache-Control", "no-store")
            .body(Map.of("ma", loi.getMa(), "thongBao", loi.getMessage()));
    }
}
