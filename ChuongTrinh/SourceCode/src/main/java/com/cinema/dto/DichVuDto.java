package com.cinema.dto;

import java.math.BigDecimal;

/** Một dòng đồ ăn / thức uống / combo của đơn hàng. loai: SAN_PHAM | COMBO. */
public record DichVuDto(String loai, String ma, String ten, int soLuong, BigDecimal donGia, BigDecimal thanhTien) {
}
