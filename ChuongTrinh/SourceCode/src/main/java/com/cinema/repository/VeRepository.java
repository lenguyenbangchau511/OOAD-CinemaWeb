package com.cinema.repository;

import com.cinema.entity.Ve;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeRepository extends JpaRepository<Ve, String> {
    List<Ve> findByMaDonHang(String maDonHang);

    List<Ve> findByMaDonHangIn(Collection<String> dsMaDonHang);

    boolean existsByMaQR(String maQR);

    Optional<Ve> findFirstByMaVeIgnoreCaseOrMaQRIgnoreCase(String maVe, String maQR);

    /** Khóa dòng vé khi check-in để hai nhân viên không thể quét thành công cùng một vé. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where lower(v.maVe) = lower(:ma) or lower(v.maQR) = lower(:ma)")
    Optional<Ve> khoaTheoMaVeHoacQr(@Param("ma") String ma);
}
