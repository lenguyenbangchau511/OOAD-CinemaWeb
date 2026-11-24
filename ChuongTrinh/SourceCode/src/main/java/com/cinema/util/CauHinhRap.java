package com.cinema.util;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Các tham số "theo cấu hình của rạp" mà báo cáo nhắc tới. Có thể đổi trong application.properties,
 * không khai báo thì dùng giá trị mặc định bên dưới (khớp dữ liệu mẫu: 1 điểm = 1.000đ, 10.000đ = 1 điểm).
 */
@Component
public class CauHinhRap {

    /** Thời gian giữ ghế (phút) - UC5.2. */
    @Value("${cinema.giu-ghe.so-phut:10}")
    public int soPhutGiuGhe;

    /** Số ghế tối đa mỗi giao dịch - UC5.2 luồng ngoại lệ 2b. */
    @Value("${cinema.giu-ghe.so-ghe-toi-da:8}")
    public int soGheToiDa;

    /** Mỗi bao nhiêu đồng chi tiêu được 1 điểm tích lũy. */
    @Value("${cinema.diem.dong-moi-diem-tich:10000}")
    public long dongMoiDiemTich;

    /** 1 điểm quy đổi thành bao nhiêu đồng giảm giá. */
    @Value("${cinema.diem.dong-moi-diem-doi:1000}")
    public long dongMoiDiemDoi;

    public int diemTichDuoc(BigDecimal tongTien) {
        return (int) (tongTien.longValue() / dongMoiDiemTich);
    }
}
