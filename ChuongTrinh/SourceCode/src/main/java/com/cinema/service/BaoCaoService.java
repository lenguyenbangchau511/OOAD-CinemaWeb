package com.cinema.service;

import com.cinema.exception.NghiepVuException;
import com.cinema.repository.BaoCaoRepository;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class BaoCaoService {
    private final BaoCaoRepository repository;

    public BaoCaoService(BaoCaoRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> doanhThu(String tuNgay, String denNgay) {
        LocalDate tu;
        LocalDate den;
        try {
            tu = LocalDate.parse(tuNgay);
            den = LocalDate.parse(denNgay);
        } catch (DateTimeParseException e) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "NGAY_KHONG_HOP_LE", "Khoảng thời gian không hợp lệ");
        }
        if (tu.isAfter(den)) {
            throw new NghiepVuException(HttpStatus.BAD_REQUEST, "NGAY_KHONG_HOP_LE", "Ngày bắt đầu không được sau ngày kết thúc");
        }

        return repository.doanhThu(tu, den.plusDays(1));
    }
}
