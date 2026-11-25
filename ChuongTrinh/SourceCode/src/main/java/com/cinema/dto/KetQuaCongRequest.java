package com.cinema.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Kết quả do cổng thanh toán (sandbox mô phỏng) báo về cho hệ thống:
 * THANH_CONG | THAT_BAI | CHO_XAC_MINH (chưa xác định được kết quả).
 * dsMaGheSuat = danh sách ghế đã chốt của đơn, dùng khi hoàn tất đơn.
 */
public record KetQuaCongRequest(String maPhienGiu, String ketQua, BigDecimal soTien, List<String> dsMaGheSuat) {
}
