package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Trạng thái một phiên giữ ghế: các ghế đang giữ, giá tạm tính và thời gian còn lại (UC5.2 bước 4). */
public record PhienGiuDto(
        String maPhienGiu, String maSuat,
        LocalDateTime thoiDiemHetHan, long soGiayConLai,
        int soGheToiDa, BigDecimal tamTinh,
        List<GheGiu> dsGhe) {

    public record GheGiu(String maGheSuat, String maGhe, String tenGhe, String loaiGhe, BigDecimal giaVe) {
    }
}
