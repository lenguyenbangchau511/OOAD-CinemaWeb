package com.cinema.exception;

import org.springframework.http.HttpStatus;

/**
 * Lỗi nghiệp vụ trả về cho giao diện dạng JSON {"ma": "...", "thongBao": "..."}.
 * Thông báo viết đúng câu chữ trong đặc tả use case để giao diện hiển thị trực tiếp.
 */
public class NghiepVuException extends RuntimeException {
    private final HttpStatus trangThai;
    private final String ma;

    public NghiepVuException(HttpStatus trangThai, String ma, String thongBao) {
        super(thongBao);
        this.trangThai = trangThai;
        this.ma = ma;
    }

    public NghiepVuException(HttpStatus trangThai, String thongBao) {
        this(trangThai, trangThai.name(), thongBao);
    }

    public HttpStatus getTrangThai() { return trangThai; }
    public String getMa() { return ma; }
}
