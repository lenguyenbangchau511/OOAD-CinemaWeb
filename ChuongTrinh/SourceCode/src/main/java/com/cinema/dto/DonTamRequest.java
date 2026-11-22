package com.cinema.dto;

/** Tạo đơn tạm từ các ghế đang giữ của một phiên (chỉ có vé, chưa có đồ ăn / khuyến mãi). */
public record DonTamRequest(String maPhienGiu) {
}
