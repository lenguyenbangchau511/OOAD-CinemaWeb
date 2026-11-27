package com.cinema.service;

import com.cinema.exception.NghiepVuException;
import com.cinema.repository.PhimRepository;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PhimCongKhaiService {
    private final PhimRepository repository;

    public PhimCongKhaiService(PhimRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSach() {
        return repository.danhSachCongKhai();
    }

    public Map<String, Object> chiTiet(String maPhim) {
        return repository.timCongKhai(maPhim).stream().findFirst()
                .orElseThrow(() -> new NghiepVuException(HttpStatus.NOT_FOUND, "Phim không còn tồn tại"));
    }
}
