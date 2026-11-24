PHAN VIEC PHAN THANH CONG DANH - GIAO DIEN 30, 31, 32, 33, 34, 35, 44

1. CACH THEM VAO PROJECT
- Giai nen goi patch nay vao mot thu muc tam.
- Copy thu muc ChuongTrinh vao thu muc OOAD-CinemaWeb dang clone tren may.
- Neu Windows hoi ghi de, chi ghi de cac file moi co trong goi patch (cac file nay chua ton tai trong main).
- Khong copy ca project zip main de de len thu muc clone va khong doi ten nhanh git.

2. CAC TRANG MOI
- ton-kho.html / js/ton-kho.js: giao dien 33.
- san-pham-form.html / js/san-pham-form.js: giao dien 30.
- combo-form.html / js/combo-form.js: giao dien 31.
- san-pham-chi-tiet.html / js/san-pham-chi-tiet.js: giao dien 32.
- phieu-nhap-kho.html / js/phieu-nhap-kho.js: giao dien 34.
- phieu-kiem-ke.html / js/phieu-kiem-ke.js: giao dien 35.
- soat-ve.html / js/soat-ve.js: giao dien 44.
- css/kho.css: dinh dang rieng cho cac trang tren.
- js/kho-common.js: du lieu mau va ham dung chung.

3. CHAY THU GIAO DIEN
Can JDK/Maven/MySQL de chay ung dung Spring Boot theo README chinh cua nhom.
Neu chi muon xem frontend khong can Spring:
  cd ChuongTrinh/SourceCode/src/main/resources/static
  py -m http.server 8000
Mo http://localhost:8000/ton-kho.html
Cac module moi dang dung localStorage de minh hoa thao tac, chua ghi vao MySQL.

4. LUU Y KHI KET NOI BACKEND
Trong source zip main luc kiem tra chua co controller/service/repository cho SANPHAM, COMBO, PHIEUNHAPKHO, PHIEUKIEMKE, LICHSUBIENDONGKHO va endpoint check-in VE.
Giao dien 33 va 44 can API Spring Boot that truoc khi demo nghiep vu voi CSDL.
Goi y API:
GET /api/kho/san-pham?tuKhoa=&loai=&tinhTrang=
GET /api/kho/bien-dong?maSanPham=&loai=
POST /api/kho/phieu-nhap
POST /api/kho/phieu-kiem-ke
GET /api/ve/soat-ve/{maVeHoacQr}
POST /api/ve/{maVe}/check-in
API la de xuat tich hop, chua phai endpoint da co trong repository.
