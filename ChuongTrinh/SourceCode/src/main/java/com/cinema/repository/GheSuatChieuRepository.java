package com.cinema.repository;

import com.cinema.entity.GheSuatChieu;
import com.cinema.enums.TrangThaiGheSuat;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GheSuatChieuRepository extends JpaRepository<GheSuatChieu, String> {

    List<GheSuatChieu> findByMaSuat(String maSuat);

    List<GheSuatChieu> findByMaSuatIn(Collection<String> dsMaSuat);

    List<GheSuatChieu> findByMaPhienGiu(String maPhienGiu);

    long countByMaSuat(String maSuat);

    long countByMaSuatAndTrangThai(String maSuat, TrangThaiGheSuat trangThai);

    /** Khóa dòng ghế (SELECT ... FOR UPDATE) để hai người không giữ trùng một ghế. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GheSuatChieu g where g.maGheSuat in :dsMa order by g.maGheSuat")
    List<GheSuatChieu> khoaTheoMa(@Param("dsMa") Collection<String> dsMa);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GheSuatChieu g where g.maPhienGiu = :maPhien order by g.maGheSuat")
    List<GheSuatChieu> khoaTheoPhien(@Param("maPhien") String maPhien);

    /** Giải phóng mọi ghế đang giữ quá hạn (thoiGianGiu cũ hơn mốc "han"). Trả số ghế đã giải phóng. */
    @Modifying(clearAutomatically = true)
    @Query("update GheSuatChieu g set g.trangThai = :trong, g.thoiGianGiu = null, g.maPhienGiu = null "
            + "where g.trangThai = :giu and g.thoiGianGiu < :han")
    int giaiPhongQuaHan(@Param("trong") TrangThaiGheSuat trong, @Param("giu") TrangThaiGheSuat giu,
                        @Param("han") LocalDateTime han);
}
