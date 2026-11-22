package com.cinema.dto;

import java.util.List;

/** Yêu cầu giữ ghế. maPhienGiu để trống ở lần giữ đầu tiên - hệ thống sinh mã phiên và trả về. */
public record GiuGheRequest(String maSuat, String maPhienGiu, List<String> dsMaGheSuat) {
}
