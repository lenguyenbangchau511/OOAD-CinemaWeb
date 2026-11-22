package com.cinema.exception;

import com.cinema.controller.GiuGheController;
import com.cinema.controller.PhongChieuController;
import com.cinema.controller.SuatChieuController;
import com.cinema.controller.ThanhToanController;
import com.cinema.controller.VeController;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Đổi NghiepVuException thành JSON; chỉ áp dụng cho các controller của phần đặt vé / phòng / suất. */
@RestControllerAdvice(assignableTypes = {
        GiuGheController.class, ThanhToanController.class, VeController.class,
        PhongChieuController.class, SuatChieuController.class})
public class XuLyLoiDatVe {

    @ExceptionHandler(NghiepVuException.class)
    public ResponseEntity<Map<String, String>> xuLy(NghiepVuException loi) {
        return ResponseEntity.status(loi.getTrangThai())
                .body(Map.of("ma", loi.getMa(), "thongBao", loi.getMessage()));
    }
}
