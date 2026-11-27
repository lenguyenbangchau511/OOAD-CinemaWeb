package com.cinema.dto;

import java.math.BigDecimal;
import java.util.List;

public record ComboRequest(
        String maCombo, String tenCombo, BigDecimal giaCombo,
        String hinhAnh, String moTa, String trangThai,
        List<ThanhPhanCombo> thanhPhan) {}
