package com.cinema.util;

import java.text.Normalizer;

/** Hỗ trợ tìm kiếm tiếng Việt có dấu và không dấu (yêu cầu phi chức năng 3.1.3-c). */
public final class TimKiem {
    private TimKiem() {}

    /** "Phòng 03 VIP" -> "phong 03 vip"; null -> "". */
    public static String chuanHoa(String s) {
        if (s == null) return "";
        String khongDau = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return khongDau.replace('đ', 'd').replace('Đ', 'D').toLowerCase().trim();
    }

    public static boolean chua(String van, String tuKhoa) {
        return chuanHoa(van).contains(chuanHoa(tuKhoa));
    }
}
