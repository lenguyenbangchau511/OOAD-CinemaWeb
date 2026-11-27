package com.cinema.dto;

import java.math.BigDecimal;

public record SanPhamRequest(
        String maSanPham, String tenSanPham, String loaiSanPham,
        String donViTinh, BigDecimal giaBan, String moTa,
        String hinhAnh, String trangThai, Integer mucTonToiThieu) {}
