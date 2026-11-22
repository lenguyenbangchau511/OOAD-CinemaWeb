package com.cinema.repository;

import com.cinema.entity.SuatChieu;
import com.cinema.enums.TrangThaiSuat;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuatChieuRepository extends JpaRepository<SuatChieu, String> {
    List<SuatChieu> findByNgayChieu(LocalDate ngayChieu);

    List<SuatChieu> findByMaPhimAndNgayChieu(String maPhim, LocalDate ngayChieu);

    List<SuatChieu> findByMaPhongAndTrangThaiIn(String maPhong, Collection<TrangThaiSuat> dsTrangThai);
}
