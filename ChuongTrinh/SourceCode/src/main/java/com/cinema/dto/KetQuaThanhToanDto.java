package com.cinema.dto;

/**
 * Kết quả xử lý một giao dịch. ketQua: THANH_CONG | THAT_BAI | CHO_XAC_MINH | CAN_DOI_SOAT
 * (CAN_DOI_SOAT = cổng đã thu tiền nhưng đơn không thể hoàn tất, không phát hành vé, chờ hoàn tiền - UC5.5 6c).
 */
public record KetQuaThanhToanDto(String maThanhToan, String maDonHang, String ketQua, String thongBao) {
}
