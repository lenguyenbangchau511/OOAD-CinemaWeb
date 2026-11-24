package com.cinema.repository;

import com.cinema.entity.PhongChieu;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhongChieuRepository extends JpaRepository<PhongChieu, String> {
    List<PhongChieu> findAllByOrderByTenPhongAsc();
}
