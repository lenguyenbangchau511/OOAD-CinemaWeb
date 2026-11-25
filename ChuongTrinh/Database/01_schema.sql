-- MySQL 8.0.16 trở lên. Lược đồ theo mục 3.8 của báo cáo.
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS cinema_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinema_db;

CREATE TABLE IF NOT EXISTS TAIKHOAN (
    maTaiKhoan VARCHAR(10) NOT NULL,
    tenDangNhap VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    matKhauHash VARCHAR(255) NOT NULL,
    vaiTro VARCHAR(30) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maTaiKhoan),
    UNIQUE (tenDangNhap),
    UNIQUE (email),
    CHECK (trangThai IN ('HOAT_DONG', 'KHONG_HOAT_DONG')),
    CHECK (vaiTro IN ('ADMIN', 'QUAN_LY', 'NHAN_VIEN', 'KHACH_HANG'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS KHACHHANG (
    maKhachHang VARCHAR(10) NOT NULL,
    maTaiKhoan VARCHAR(10) NOT NULL,
    hoTen VARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(15) NOT NULL,
    diemTichLuy INT NOT NULL,
    PRIMARY KEY (maKhachHang),
    UNIQUE (maTaiKhoan),
    UNIQUE (soDienThoai),
    FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN (maTaiKhoan),
    CHECK (diemTichLuy >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS NHANVIEN (
    maNhanVien VARCHAR(10) NOT NULL,
    maTaiKhoan VARCHAR(10) NOT NULL,
    hoTen VARCHAR(100) NOT NULL,
    soDienThoai VARCHAR(15) NOT NULL,
    chucVu VARCHAR(100) NOT NULL,
    PRIMARY KEY (maNhanVien),
    UNIQUE (maTaiKhoan),
    FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN (maTaiKhoan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PHIM (
    maPhim VARCHAR(10) NOT NULL,
    tenPhim VARCHAR(100) NOT NULL,
    theLoai VARCHAR(50) NOT NULL,
    thoiLuong INT NOT NULL,
    daoDien VARCHAR(50) NOT NULL,
    dienVien VARCHAR(200) NOT NULL,
    ngayKhoiChieu DATE NOT NULL,
    quocGia VARCHAR(50) NOT NULL,
    noiDung TEXT NOT NULL,
    poster VARCHAR(255) NOT NULL,
    gioiHanDoTuoi VARCHAR(10) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maPhim),
    CHECK (trangThai IN ('SAP_CHIEU', 'DANG_CHIEU', 'NGUNG_CHIEU')),
    CHECK (thoiLuong > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PHONGCHIEU (
    maPhong VARCHAR(10) NOT NULL,
    tenPhong VARCHAR(100) NOT NULL,
    loaiPhong VARCHAR(30) NOT NULL,
    soLuongGhe INT NOT NULL,
    tongSoHang INT NOT NULL,
    tongSoCot INT NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maPhong),
    CHECK (trangThai IN ('HOAT_DONG', 'BAO_TRI', 'DONG_CUA')),
    CHECK (loaiPhong IN ('STANDARD', 'VIP', 'IMAX', '3D')),
    CHECK (soLuongGhe > 0),
    CHECK (tongSoHang > 0),
    CHECK (tongSoCot > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GHE (
    maGhe VARCHAR(10) NOT NULL,
    maPhong VARCHAR(10) NOT NULL,
    tenGhe VARCHAR(10) NOT NULL,
    loaiGhe VARCHAR(30) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maGhe),
    UNIQUE (maPhong, tenGhe),
    FOREIGN KEY (maPhong) REFERENCES PHONGCHIEU (maPhong),
    CHECK (trangThai IN ('BINH_THUONG', 'HONG')),
    CHECK (loaiGhe IN ('STANDARD', 'VIP', 'SWEETBOX'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SUATCHIEU (
    maSuat VARCHAR(10) NOT NULL,
    maPhim VARCHAR(10) NOT NULL,
    maPhong VARCHAR(10) NOT NULL,
    ngayChieu DATE NOT NULL,
    gioBatDau TIME NOT NULL,
    gioKetThuc TIME NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maSuat),
    FOREIGN KEY (maPhim) REFERENCES PHIM (maPhim),
    FOREIGN KEY (maPhong) REFERENCES PHONGCHIEU (maPhong),
    CHECK (trangThai IN ('SAP_CHIEU', 'DANG_CHIEU', 'KET_THUC', 'DA_HUY')),
    CHECK (gioKetThuc > gioBatDau)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GHESUATCHIEU (
    maGheSuat VARCHAR(10) NOT NULL,
    maSuat VARCHAR(10) NOT NULL,
    maGhe VARCHAR(10) NOT NULL,
    giaVe DECIMAL(18,2) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    thoiGianGiu DATETIME NULL,
    maPhienGiu VARCHAR(50) NULL,
    PRIMARY KEY (maGheSuat),
    UNIQUE (maSuat, maGhe),
    FOREIGN KEY (maSuat) REFERENCES SUATCHIEU (maSuat),
    FOREIGN KEY (maGhe) REFERENCES GHE (maGhe),
    CHECK (trangThai IN ('TRONG', 'DANG_GIU', 'DA_DAT')),
    CHECK (giaVe >= 0),
    CHECK ((trangThai = 'DANG_GIU' AND thoiGianGiu IS NOT NULL AND maPhienGiu IS NOT NULL) OR (trangThai <> 'DANG_GIU' AND thoiGianGiu IS NULL AND maPhienGiu IS NULL))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GIAVE (
    maGiaVe VARCHAR(10) NOT NULL,
    loaiVe VARCHAR(30) NOT NULL,
    doiTuongKhachHang VARCHAR(30) NOT NULL,
    loaiGhe VARCHAR(30) NOT NULL,
    mucGia DECIMAL(18,2) NOT NULL,
    loaiNgay VARCHAR(30) NOT NULL,
    khungGioBatDau TIME NOT NULL,
    khungGioKetThuc TIME NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maGiaVe),
    CHECK (trangThai IN ('DANG_AP_DUNG', 'NGUNG_AP_DUNG')),
    CHECK (loaiVe IN ('VE_2D', 'VE_3D', 'VE_IMAX')),
    CHECK (loaiGhe IN ('STANDARD', 'VIP', 'SWEETBOX')),
    CHECK (doiTuongKhachHang IN ('NGUOI_LON', 'HSSV', 'TRE_EM', 'NGUOI_CAO_TUOI')),
    CHECK (loaiNgay IN ('NGAY_THUONG', 'CUOI_TUAN', 'NGAY_LE')),
    CHECK (mucGia >= 0),
    CHECK (ngayKetThuc >= ngayBatDau),
    CHECK (khungGioKetThuc >= khungGioBatDau)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS KHUYENMAI (
    maKhuyenMai VARCHAR(20) NOT NULL,
    tenChuongTrinh VARCHAR(100) NOT NULL,
    noiDung TEXT NOT NULL,
    hinhThucGiam VARCHAR(30) NOT NULL,
    mucGiam DECIMAL(18,2) NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE NOT NULL,
    phamViApDung VARCHAR(30) NOT NULL,
    doiTuongApDung VARCHAR(20) NOT NULL,
    kenhBan VARCHAR(30) NOT NULL,
    giaTriDonToiThieu DECIMAL(18,2) NOT NULL,
    gioiHanLuotSuDung INT NOT NULL,
    soLuotDaSuDung INT NOT NULL,
    mucUuTien INT NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maKhuyenMai),
    CHECK (trangThai IN ('DANG_AP_DUNG', 'NGUNG_AP_DUNG')),
    CHECK (hinhThucGiam IN ('THEO_PHAN_TRAM', 'THEO_SO_TIEN')),
    CHECK (phamViApDung IN ('VE', 'DO_AN_THUC_UONG', 'TOAN_DON')),
    CHECK (kenhBan IN ('TAI_QUAY', 'TRUC_TUYEN', 'TAT_CA')),
    CHECK (mucGiam >= 0),
    CHECK (ngayKetThuc >= ngayBatDau),
    CHECK (giaTriDonToiThieu >= 0),
    CHECK (soLuotDaSuDung BETWEEN 0 AND gioiHanLuotSuDung)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SANPHAM (
    maSanPham VARCHAR(10) NOT NULL,
    tenSanPham VARCHAR(100) NOT NULL,
    loaiSanPham VARCHAR(30) NOT NULL,
    donViTinh VARCHAR(20) NOT NULL,
    giaBan DECIMAL(18,2) NOT NULL,
    moTa TEXT NOT NULL,
    hinhAnh VARCHAR(255) NULL,
    trangThai VARCHAR(30) NOT NULL,
    soLuongTon INT NOT NULL,
    mucTonToiThieu INT NOT NULL,
    PRIMARY KEY (maSanPham),
    CHECK (trangThai IN ('DANG_BAN', 'NGUNG_BAN')),
    CHECK (loaiSanPham IN ('DO_AN', 'THUC_UONG')),
    CHECK (giaBan >= 0),
    CHECK (soLuongTon >= 0),
    CHECK (mucTonToiThieu >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS COMBO (
    maCombo VARCHAR(10) NOT NULL,
    tenCombo VARCHAR(100) NOT NULL,
    giaCombo DECIMAL(18,2) NOT NULL,
    hinhAnh VARCHAR(255) NULL,
    moTa VARCHAR(255) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maCombo),
    CHECK (trangThai IN ('DANG_BAN', 'NGUNG_BAN')),
    CHECK (giaCombo >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CHITIETCOMBO (
    maCombo VARCHAR(10) NOT NULL,
    maSanPham VARCHAR(10) NOT NULL,
    soLuong INT NOT NULL,
    PRIMARY KEY (maCombo, maSanPham),
    FOREIGN KEY (maCombo) REFERENCES COMBO (maCombo),
    FOREIGN KEY (maSanPham) REFERENCES SANPHAM (maSanPham),
    CHECK (soLuong > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PHIEUNHAPKHO (
    maPhieuNhap VARCHAR(20) NOT NULL,
    maNhanVien VARCHAR(10) NOT NULL,
    ngayNhap DATE NOT NULL,
    nhaCungCap VARCHAR(200) NOT NULL,
    ghiChu TEXT NULL,
    thoiDiemLuu DATETIME NOT NULL,
    PRIMARY KEY (maPhieuNhap),
    FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN (maNhanVien)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CHITIETPHIEUNHAPKHO (
    maSanPham VARCHAR(10) NOT NULL,
    maPhieuNhap VARCHAR(20) NOT NULL,
    soLuongNhap INT NOT NULL,
    donGiaNhap DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (maSanPham, maPhieuNhap),
    FOREIGN KEY (maSanPham) REFERENCES SANPHAM (maSanPham),
    FOREIGN KEY (maPhieuNhap) REFERENCES PHIEUNHAPKHO (maPhieuNhap),
    CHECK (soLuongNhap > 0),
    CHECK (donGiaNhap >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PHIEUKIEMKE (
    maPhieuKiemKe VARCHAR(20) NOT NULL,
    maNhanVien VARCHAR(10) NOT NULL,
    thoiDiemLap DATETIME NOT NULL,
    thoiDiemXacNhan DATETIME NULL,
    ghiChu TEXT NULL,
    PRIMARY KEY (maPhieuKiemKe),
    FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN (maNhanVien),
    CHECK (thoiDiemXacNhan >= thoiDiemLap)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CHITIETPHIEUKIEMKE (
    maSanPham VARCHAR(10) NOT NULL,
    maPhieuKiemKe VARCHAR(20) NOT NULL,
    soLuongHeThong INT NOT NULL,
    soLuongThucTe INT NOT NULL,
    lyDoChenhLech TEXT NULL,
    PRIMARY KEY (maSanPham, maPhieuKiemKe),
    FOREIGN KEY (maSanPham) REFERENCES SANPHAM (maSanPham),
    FOREIGN KEY (maPhieuKiemKe) REFERENCES PHIEUKIEMKE (maPhieuKiemKe),
    CHECK (soLuongHeThong >= 0),
    CHECK (soLuongThucTe >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS LICHSUBIENDONGKHO (
    maBienDong BIGINT NOT NULL AUTO_INCREMENT,
    maSanPham VARCHAR(10) NOT NULL,
    maNhanVien VARCHAR(10) NULL,
    thoiDiem DATETIME NOT NULL,
    loai VARCHAR(30) NOT NULL,
    soLuongThayDoi INT NOT NULL,
    tonTruoc INT NOT NULL,
    tonSau INT NOT NULL,
    maThamChieu VARCHAR(50) NOT NULL,
    ghiChu TEXT NULL,
    PRIMARY KEY (maBienDong),
    FOREIGN KEY (maSanPham) REFERENCES SANPHAM (maSanPham),
    FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN (maNhanVien),
    CHECK (loai IN ('NHAP_KHO', 'BAN_HANG', 'KIEM_KE', 'DIEU_CHINH')),
    CHECK (tonTruoc >= 0),
    CHECK (tonSau >= 0),
    CHECK (tonSau = tonTruoc + soLuongThayDoi)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DONHANG (
    maDonHang VARCHAR(10) NOT NULL,
    maKhachHang VARCHAR(10) NULL,
    maNhanVien VARCHAR(10) NULL,
    maKhuyenMai VARCHAR(20) NULL,
    ngayDat DATETIME NOT NULL,
    tongTien DECIMAL(18,2) NOT NULL,
    kenhBan VARCHAR(30) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    soTienGiamTuKhuyenMai DECIMAL(18,2) NOT NULL,
    diemSuDung INT NOT NULL,
    soTienGiamTuDiem DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (maDonHang),
    FOREIGN KEY (maKhachHang) REFERENCES KHACHHANG (maKhachHang),
    FOREIGN KEY (maNhanVien) REFERENCES NHANVIEN (maNhanVien),
    FOREIGN KEY (maKhuyenMai) REFERENCES KHUYENMAI (maKhuyenMai),
    CHECK (trangThai IN ('CHO_THANH_TOAN', 'DA_THANH_TOAN', 'DA_HUY')),
    CHECK (kenhBan IN ('ONLINE', 'TAI_QUAY')),
    CHECK (tongTien >= 0),
    CHECK (diemSuDung >= 0),
    CHECK (soTienGiamTuDiem >= 0),
    CHECK (soTienGiamTuKhuyenMai >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS VE (
    maVe VARCHAR(10) NOT NULL,
    maDonHang VARCHAR(10) NOT NULL,
    maGiaVe VARCHAR(10) NOT NULL,
    donGia DECIMAL(18,2) NOT NULL,
    maGheSuat VARCHAR(10) NOT NULL,
    maQR VARCHAR(255) NOT NULL,
    trangThai VARCHAR(30) NOT NULL,
    thoiDiemCheckIn DATETIME NULL,
    PRIMARY KEY (maVe),
    UNIQUE (maQR),
    FOREIGN KEY (maDonHang) REFERENCES DONHANG (maDonHang),
    FOREIGN KEY (maGiaVe) REFERENCES GIAVE (maGiaVe),
    FOREIGN KEY (maGheSuat) REFERENCES GHESUATCHIEU (maGheSuat),
    CHECK (trangThai IN ('CHUA_SU_DUNG', 'DA_SU_DUNG', 'DA_HUY', 'HET_HAN', 'DA_DOI')),
    CHECK (donGia >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CHITIETDICHVU (
    maChiTietDV VARCHAR(10) NOT NULL,
    maDonHang VARCHAR(10) NOT NULL,
    maCombo VARCHAR(10) NULL,
    maSanPham VARCHAR(10) NULL,
    soLuong INT NOT NULL,
    donGia DECIMAL(18,2) NOT NULL,
    thanhTien DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (maChiTietDV),
    FOREIGN KEY (maDonHang) REFERENCES DONHANG (maDonHang),
    FOREIGN KEY (maCombo) REFERENCES COMBO (maCombo),
    FOREIGN KEY (maSanPham) REFERENCES SANPHAM (maSanPham),
    CHECK ((maCombo IS NULL) <> (maSanPham IS NULL)),
    CHECK (soLuong > 0),
    CHECK (donGia >= 0),
    CHECK (thanhTien = soLuong * donGia)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS THANHTOAN (
    maThanhToan VARCHAR(10) NOT NULL,
    maDonHang VARCHAR(10) NOT NULL,
    phuongThuc VARCHAR(30) NOT NULL,
    soTien DECIMAL(18,2) NOT NULL,
    loaiGiaoDich VARCHAR(30) NOT NULL,
    thoiGianGiaoDich DATETIME NOT NULL,
    maGiaoDichDoiTac VARCHAR(50) NULL,
    trangThai VARCHAR(30) NOT NULL,
    PRIMARY KEY (maThanhToan),
    FOREIGN KEY (maDonHang) REFERENCES DONHANG (maDonHang),
    CHECK (trangThai IN ('CHO_XU_LY', 'THANH_CONG', 'THAT_BAI', 'DA_HOAN')),
    CHECK (phuongThuc IN ('TIEN_MAT', 'MOMO', 'VNPAY', 'THE_NGAN_HANG', 'DIEM_THUONG')),
    CHECK (loaiGiaoDich IN ('THANH_TOAN', 'HOAN_TIEN', 'BU_CHENH_LECH')),
    CHECK (soTien >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GIAODICHDIEM (
    maGiaoDichDiem VARCHAR(10) NOT NULL,
    maKhachHang VARCHAR(10) NOT NULL,
    diemThayDoi INT NOT NULL,
    thoiGian DATETIME NOT NULL,
    lyDo VARCHAR(255) NOT NULL,
    maDonHang VARCHAR(10) NULL,
    PRIMARY KEY (maGiaoDichDiem),
    FOREIGN KEY (maKhachHang) REFERENCES KHACHHANG (maKhachHang),
    FOREIGN KEY (maDonHang) REFERENCES DONHANG (maDonHang)
) ENGINE=InnoDB;
