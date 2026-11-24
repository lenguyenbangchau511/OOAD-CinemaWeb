package com.cinema.dto;

import java.util.List;

/**
 * Sơ đồ ghế của phòng chiếu (giao diện 20).
 * biKhoa = ghế đang bán/đang giữ trong suất chưa kết thúc nên không được đổi vị trí (UC3.3 quy tắc nghiệp vụ).
 */
public record SoDoPhongDto(PhongChieuDto phong, boolean coLichChieu, List<Ghe> ghe) {

    public record Ghe(String maGhe, String tenGhe, String hang, int cot,
                      String loaiGhe, String trangThai, boolean biKhoa) {
    }
}
