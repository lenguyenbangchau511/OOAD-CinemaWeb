package com.cinema.service;

import com.cinema.exception.NghiepVuException;
import com.cinema.repository.KhachHangRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class KhachHangService {
    private final KhachHangRepository repository;

    public KhachHangService(KhachHangRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> hoSo(String ma) {
        List<Map<String, Object>> ds = repository.timHoSo(ma);
        if (ds.isEmpty()) {
            throw new NghiepVuException(HttpStatus.NOT_FOUND, "KHONG_TIM_THAY", "Không tìm thấy hồ sơ khách hàng");
        }
        Map<String, Object> kq = new LinkedHashMap<>(ds.get(0));
        kq.put("giaoDichDiem", repository.lichSuDiem(ma));
        return kq;
    }
}
