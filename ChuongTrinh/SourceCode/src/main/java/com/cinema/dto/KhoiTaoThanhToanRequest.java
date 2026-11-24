package com.cinema.dto;

/** Bắt đầu thanh toán trực tuyến. phuongThuc: MOMO | VNPAY | THE_NGAN_HANG. */
public record KhoiTaoThanhToanRequest(String maDonHang, String maPhienGiu, String phuongThuc) {
}
