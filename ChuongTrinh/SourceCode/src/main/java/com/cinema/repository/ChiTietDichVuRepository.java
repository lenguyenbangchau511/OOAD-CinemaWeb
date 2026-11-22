package com.cinema.repository;

import com.cinema.entity.ChiTietDichVu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietDichVuRepository extends JpaRepository<ChiTietDichVu, String> {
    List<ChiTietDichVu> findByMaDonHang(String maDonHang);
}
