package com.cinema.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

/** Giờ hiện tại theo múi giờ Việt Nam (CSDL mẫu cũng nạp theo giờ UTC+7). */
public final class ThoiGian {
    public static final ZoneId VIET_NAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private ThoiGian() {}

    public static LocalDateTime bayGio() {
        return LocalDateTime.now(VIET_NAM);
    }
}
