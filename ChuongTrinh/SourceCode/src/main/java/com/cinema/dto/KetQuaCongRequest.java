package com.cinema.dto;

import java.math.BigDecimal;

/**
 * Kết quả do cổng thanh toán (sandbox mô phỏng) báo về cho hệ thống:
 * THANH_CONG | THAT_BAI | CHO_XAC_MINH (chưa xác định được kết quả).
 */
public record KetQuaCongRequest(String maPhienGiu, String ketQua, BigDecimal soTien) {
}
