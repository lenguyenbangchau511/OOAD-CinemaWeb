package com.cinema.util;

import java.security.SecureRandom;

/** Sinh mã ngẫu nhiên dễ đọc (bỏ ký tự dễ nhầm như 0/O, 1/I), ví dụ V7KQ2M4X. */
public final class SinhMa {
    private static final String KY_TU = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom NGAU_NHIEN = new SecureRandom();

    private SinhMa() {}

    public static String ngauNhien(String tienTo, int doDai) {
        StringBuilder sb = new StringBuilder(tienTo);
        for (int i = 0; i < doDai; i++) {
            sb.append(KY_TU.charAt(NGAU_NHIEN.nextInt(KY_TU.length())));
        }
        return sb.toString();
    }
}
