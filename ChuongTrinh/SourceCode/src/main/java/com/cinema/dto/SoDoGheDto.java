package com.cinema.dto;

import java.math.BigDecimal;
import java.util.List;

/** Sơ đồ ghế của một suất chiếu (UC5.1 bước 5-6, giao diện 7). */
    public record SoDoGheDto(
        SuatChieuDto suat, int tongSoHang, int tongSoCot,
        int soGheToiDa, int soPhutGiu,
        String thongBao,                // khác null khi suất không còn được bán (vd "Suất chiếu không khả dụng")
        List<Ghe> ghe) {

    /** trangThai: TRONG | DANG_GIU | DA_DAT | BAO_TRI. cuaToi = ghế đang được giữ bởi phiên hiện tại. */
    public record Ghe(String maGheSuat, String maGhe, String tenGhe, String hang, int cot,
                      String loaiGhe, BigDecimal giaVe, String trangThai, boolean cuaToi) {
    }
}
