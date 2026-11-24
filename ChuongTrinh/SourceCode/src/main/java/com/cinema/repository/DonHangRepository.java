package com.cinema.repository;

import com.cinema.entity.DonHang;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DonHangRepository extends JpaRepository<DonHang, String> {

    List<DonHang> findAllByOrderByNgayDatDesc();

    List<DonHang> findByMaKhachHangOrderByNgayDatDesc(String maKhachHang);

    /** Khóa đơn hàng khi ghi nhận thanh toán để một đơn chỉ được hoàn tất một lần. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DonHang d where d.maDonHang = :ma")
    Optional<DonHang> khoaTheoMa(@Param("ma") String ma);
}
