# CinemaWeb — Hệ thống quản lý rạp chiếu phim

CinemaWeb là đồ án OOAD của Nhóm 11 về quản lý phim, phòng chiếu, suất chiếu và bán vé. Hệ thống còn bao gồm quản lý thành viên, khuyến mãi, đồ ăn, thức uống, tồn kho và thống kê.

Backend dùng Spring Boot REST API, Spring Data JPA và MySQL. Giao diện dùng HTML, CSS và JavaScript thuần trong `src/main/resources/static/`. JavaScript gọi API bằng `fetch()` và đọc dữ liệu JSON từ phản hồi.

## Cấu trúc thư mục

```text
Nhom11/
├── README.md
├── BaoCao/                              Báo cáo và sơ đồ thiết kế
└── ChuongTrinh/
    ├── Database/                        Script SQL khi triển khai cơ sở dữ liệu
    ├── ThamKhao/                        Tài liệu tham khảo
    └── SourceCode/
        ├── pom.xml                      Cấu hình Maven
        └── src/main/
            ├── java/com/cinema/
            │   ├── CinemaWebApplication.java
            │   ├── entity/              Lớp @Entity ánh xạ bảng, ví dụ Phim và Ve
            │   ├── repository/          Truy vấn dữ liệu qua JpaRepository
            │   ├── service/             Nghiệp vụ và giao dịch
            │   ├── controller/          Endpoint @RestController trả JSON
            │   └── dto/                 Dữ liệu yêu cầu và phản hồi của API
            └── resources/
                ├── application.properties
                └── static/
                    ├── css/             Tệp định kiểu
                    ├── js/              Tệp JavaScript gọi API qua fetch()
                    └── images/          Poster và ảnh sản phẩm
```

Luồng dự kiến của danh sách phim là `fetch('/api/phim')` → controller → service → repository → MySQL. Controller trả danh sách DTO dưới dạng JSON. Kiểu ID của `JpaRepository` phải khớp với kiểu `@Id` của entity.

## Khởi động bộ khung

Cần JDK 24, Maven và MySQL. Tạo schema trống `cinema_db` trên MySQL local rồi đặt `DB_USERNAME` và `DB_PASSWORD` theo tài khoản MySQL của máy. Mở terminal tại `ChuongTrinh/SourceCode` và chạy:

```bash
mvn spring-boot:run
```

Mở `http://localhost:8080/` để xem trang chủ. Trang này đọc danh mục mẫu trong `static/js/home.js`. Tab “Sắp chiếu” dùng một suất chiếu lại giả lập của phim Mai. Các chức năng đặt vé, đăng nhập, bắp nước và khuyến mãi đang ở trạng thái vô hiệu hóa.

Có thể xem riêng giao diện từ thư mục `ChuongTrinh/SourceCode/src/main/resources/static/` bằng lệnh `python -m http.server 8000`, rồi mở `http://localhost:8000/`.

Poster tham khảo từ [World of Reel](https://www.worldofreel.com/blog/2025/11/2/godzilla-minus-one-sequel-has-a-title-say-hello-to-godzilla-minus-one), [Cinenjoy](https://cinenjoy.com/phim/trai-giam-hanh-phuc) và [IDN Times](https://www.idntimes.com/hype/entertainment/3-rekomendasi-film-vietnam-romantis-di-netflix-siap-baper-01-rg9hj-zjrb5f). Khi thiếu ảnh hoặc tải ảnh thất bại, thẻ hiển thị nền màu và tên phim.
