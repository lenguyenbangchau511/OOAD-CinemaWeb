package com.cinema.repository;

import com.cinema.entity.Ve;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeRepository extends JpaRepository<Ve, String> {
    List<Ve> findByMaDonHang(String maDonHang);

    List<Ve> findByMaDonHangIn(Collection<String> dsMaDonHang);

    boolean existsByMaQR(String maQR);
}
