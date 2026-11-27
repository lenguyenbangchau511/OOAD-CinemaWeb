package com.cinema.service;

import com.cinema.repository.GiaVeRepository;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class GiaVeService {
    private final GiaVeRepository repository;

    public GiaVeService(GiaVeRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> danhSach() {
        return repository.danhSach();
    }
}
