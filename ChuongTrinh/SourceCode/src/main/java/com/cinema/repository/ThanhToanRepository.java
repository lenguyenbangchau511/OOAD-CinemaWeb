package com.cinema.repository;

import com.cinema.entity.ThanhToan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {
    List<ThanhToan> findByMaDonHangOrderByThoiGianGiaoDichDesc(String maDonHang);
}
