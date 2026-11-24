package com.cinema.entity;

import com.cinema.enums.LoaiPhong;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Lưu LoaiPhong dưới dạng chuỗi STANDARD / VIP / IMAX / 3D. */
@Converter
public class LoaiPhongConverter implements AttributeConverter<LoaiPhong, String> {
    @Override
    public String convertToDatabaseColumn(LoaiPhong loai) {
        return loai == null ? null : loai.getMa();
    }

    @Override
    public LoaiPhong convertToEntityAttribute(String ma) {
        return ma == null ? null : LoaiPhong.tuMa(ma);
    }
}
