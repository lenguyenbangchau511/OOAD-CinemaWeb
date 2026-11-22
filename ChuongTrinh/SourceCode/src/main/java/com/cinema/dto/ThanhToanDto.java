package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Một giao dịch thanh toán. trangThai: CHO_XU_LY | THANH_CONG | THAT_BAI | DA_HOAN. */
public record ThanhToanDto(String maThanhToan, String maDonHang, String phuongThuc, BigDecimal soTien,
                           String loaiGiaoDich, String trangThai, String maGiaoDichDoiTac,
                           LocalDateTime thoiGianGiaoDich) {
}
