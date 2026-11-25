package com.cinema.dto;

import java.math.BigDecimal;
import java.util.List;

public record XacNhanDonRequest(String maPhienGiu, List<MonChon> dichVu, List<String> maKhuyenMai,
                               String khuyenMaiChon, Integer diem, BigDecimal tongTienDaXem) {
    public record MonChon(String ma, Integer soLuong) {}
}
