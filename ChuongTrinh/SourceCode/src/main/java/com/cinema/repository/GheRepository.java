package com.cinema.repository;

import com.cinema.entity.Ghe;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GheRepository extends JpaRepository<Ghe, String> {
    List<Ghe> findByMaPhong(String maPhong);

    List<Ghe> findByMaGheIn(Collection<String> dsMaGhe);
}
