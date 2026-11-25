package com.cinema.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * Một giao dịch trong lịch sử mua vé (giao diện 12). Đơn chưa có vé thì tenPhim = null.
 * soVeTheoTrangThai: số vé của đơn theo từng trạng thái (vd {CHUA_SU_DUNG=1, DA_HUY=1}) để kết quả lọc theo trạng thái vé dễ hiểu.
 */
public record LichSuVeDto(
        String maDonHang, LocalDateTime ngayDat, BigDecimal tongTien, String trangThaiDon, String kenhBan,
        String tenPhim, LocalDate ngayChieu, LocalTime gioBatDau, String tenPhong,
        List<String> dsGhe, int soVe, Map<String, Long> soVeTheoTrangThai) {
}
