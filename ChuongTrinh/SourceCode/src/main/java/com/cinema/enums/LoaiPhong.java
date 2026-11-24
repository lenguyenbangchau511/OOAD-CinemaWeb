package com.cinema.enums;

/**
 * Phân loại phòng chiếu (báo cáo 3.7.4): STANDARD, VIP, IMAX, 3D.
 * Java không cho tên hằng bắt đầu bằng chữ số nên "3D" được đặt là PHIM_3D,
 * giá trị lưu trong CSDL vẫn là "3D" (xem {@link com.cinema.entity.LoaiPhongConverter}).
 */
public enum LoaiPhong {
    STANDARD("STANDARD"), VIP("VIP"), IMAX("IMAX"), PHIM_3D("3D");

    private final String ma;

    LoaiPhong(String ma) { this.ma = ma; }

    /** Mã lưu trong CSDL và trả cho giao diện. */
    public String getMa() { return ma; }

    /** Đổi mã (STANDARD, VIP, IMAX, 3D) sang enum; trả null nếu không hợp lệ. */
    public static LoaiPhong tuMa(String ma) {
        for (LoaiPhong l : values()) {
            if (l.ma.equalsIgnoreCase(ma)) return l;
        }
        return null;
    }
}
