package com.cinema.dto;

import java.math.BigDecimal;

/** Đơn hàng vừa tạo (dùng cho đơn tạm khi module xác nhận đơn chưa ghép). */
public record DonHangMoiDto(String maDonHang, BigDecimal tongTien) {
}
