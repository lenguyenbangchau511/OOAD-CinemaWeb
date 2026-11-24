package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/** Một giao dịch trong lịch sử mua vé (giao diện 12). Đơn chưa có vé thì tenPhim = null. */
public record LichSuVeDto(
        String maDonHang, LocalDateTime ngayDat, BigDecimal tongTien, String trangThaiDon, String kenhBan,
        String tenPhim, LocalDate ngayChieu, LocalTime gioBatDau, String tenPhong,
        List<String> dsGhe, int soVe, String trangThaiVe) {
}
