package com.cinema.service;

import com.cinema.repository.KhuyenMaiRepository;
import com.cinema.util.ThoiGian;
import java.sql.Date;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class KhuyenMaiService {
    private final KhuyenMaiRepository repository;

    public KhuyenMaiService(KhuyenMaiRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSachTrucTuyen() {
        Date homNay = Date.valueOf(ThoiGian.bayGio().toLocalDate());
        return repository.danhSachTrucTuyen(homNay);
    }

    public List<Map<String, Object>> danhSach(boolean laKhachHang) {
        return repository.danhSach(laKhachHang);
    }
}
