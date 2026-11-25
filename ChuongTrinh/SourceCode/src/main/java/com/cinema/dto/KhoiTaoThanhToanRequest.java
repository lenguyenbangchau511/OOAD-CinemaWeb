package com.cinema.dto;

import java.util.List;

/**
 * Bắt đầu thanh toán trực tuyến. phuongThuc: MOMO | VNPAY | THE_NGAN_HANG.
 * dsMaGheSuat = danh sách ghế đã chốt của đơn (từ bước chọn ghế); hệ thống đối chiếu đúng với ghế đang giữ của phiên.
 */
public record KhoiTaoThanhToanRequest(String maDonHang, String maPhienGiu, String phuongThuc, List<String> dsMaGheSuat) {
}
