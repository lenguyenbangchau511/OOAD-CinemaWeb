/* Dữ liệu mẫu khớp Database/02_seed.sql. Chỉ dùng khi chưa chạy backend. */
import { ngay } from './quan-ly-common.js';

const cuoiTuan = (iso) => [0, 6].includes(new Date(iso + 'T00:00:00').getDay());
const giaVeThuong = (iso) => (cuoiTuan(iso) ? 85000 : 70000);

// Bảng GIAVE
export const GIA_VE = [
    { maGiaVe: 'GV01', loaiVe: 'VE_2D', doiTuongKhachHang: 'NGUOI_LON', loaiGhe: 'STANDARD', mucGia: 70000, loaiNgay: 'NGAY_THUONG', khungGioBatDau: '00:00:00', khungGioKetThuc: '23:59:59', ngayBatDau: ngay(-60), ngayKetThuc: ngay(60), trangThai: 'DANG_AP_DUNG' },
    { maGiaVe: 'GV02', loaiVe: 'VE_2D', doiTuongKhachHang: 'NGUOI_LON', loaiGhe: 'STANDARD', mucGia: 85000, loaiNgay: 'CUOI_TUAN', khungGioBatDau: '00:00:00', khungGioKetThuc: '23:59:59', ngayBatDau: ngay(-60), ngayKetThuc: ngay(60), trangThai: 'DANG_AP_DUNG' },
    { maGiaVe: 'GV03', loaiVe: 'VE_2D', doiTuongKhachHang: 'NGUOI_LON', loaiGhe: 'VIP', mucGia: 105000, loaiNgay: 'NGAY_THUONG', khungGioBatDau: '00:00:00', khungGioKetThuc: '23:59:59', ngayBatDau: ngay(-60), ngayKetThuc: ngay(60), trangThai: 'DANG_AP_DUNG' },
    { maGiaVe: 'GV04', loaiVe: 'VE_2D', doiTuongKhachHang: 'NGUOI_LON', loaiGhe: 'VIP', mucGia: 120000, loaiNgay: 'CUOI_TUAN', khungGioBatDau: '00:00:00', khungGioKetThuc: '23:59:59', ngayBatDau: ngay(-60), ngayKetThuc: ngay(60), trangThai: 'DANG_AP_DUNG' }
];

// Bảng KHUYENMAI
export const KHUYEN_MAI = [
    { maKhuyenMai: 'KM01', tenChuongTrinh: 'Giảm 10.000đ cho thành viên', noiDung: 'Ưu đãi cho đơn từ 100.000đ.', hinhThucGiam: 'THEO_SO_TIEN', mucGiam: 10000, ngayBatDau: ngay(-14), ngayKetThuc: ngay(14), phamViApDung: 'TOAN_DON', doiTuongApDung: 'THANH_VIEN', kenhBan: 'TAT_CA', giaTriDonToiThieu: 100000, gioiHanLuotSuDung: 50, soLuotDaSuDung: 1, mucUuTien: 1, trangThai: 'DANG_AP_DUNG' },
    { maKhuyenMai: 'KM02', tenChuongTrinh: 'Ưu đãi tháng trước', noiDung: 'Giảm 10% toàn đơn.', hinhThucGiam: 'THEO_PHAN_TRAM', mucGiam: 10, ngayBatDau: ngay(-60), ngayKetThuc: ngay(-30), phamViApDung: 'TOAN_DON', doiTuongApDung: 'THANH_VIEN', kenhBan: 'TAT_CA', giaTriDonToiThieu: 0, gioiHanLuotSuDung: 50, soLuotDaSuDung: 0, mucUuTien: 2, trangThai: 'NGUNG_AP_DUNG' }
];

// Bảng KHACHHANG + TAIKHOAN + GIAODICHDIEM (mới nhất trước)
export const KHACH_HANG = {
    KH01: {
        maKhachHang: 'KH01', hoTen: 'Phạm Ngọc Mai', soDienThoai: '0900000005', diemTichLuy: 24,
        tenDangNhap: 'khach1', email: 'khach1@cinema.test', trangThaiTaiKhoan: 'HOAT_DONG',
        giaoDichDiem: [
            { maGiaoDichDiem: 'GD03', diemThayDoi: 17, thoiGian: ngay(-2) + 'T16:00:00', lyDo: 'Tích điểm', maDonHang: 'DH02' },
            { maGiaoDichDiem: 'GD02', diemThayDoi: -10, thoiGian: ngay(-2) + 'T16:00:00', lyDo: 'Dùng điểm', maDonHang: 'DH02' },
            { maGiaoDichDiem: 'GD01', diemThayDoi: 17, thoiGian: ngay(-3) + 'T15:00:00', lyDo: 'Tích điểm', maDonHang: 'DH01' }
        ]
    },
    KH02: {
        maKhachHang: 'KH02', hoTen: 'Võ Anh Tuấn', soDienThoai: '0900000006', diemTichLuy: 0,
        tenDangNhap: 'khach2', email: 'khach2@cinema.test', trangThaiTaiKhoan: 'HOAT_DONG', giaoDichDiem: []
    }
};

// Bảng NHANVIEN + TAIKHOAN
export const NHAN_VIEN = [
    { maNhanVien: 'NV01', hoTen: 'Nguyễn Hoàng An', soDienThoai: '0900000001', chucVu: 'Quản trị viên', tenDangNhap: 'admin', email: 'admin@cinema.test', vaiTro: 'ADMIN', trangThaiTaiKhoan: 'HOAT_DONG' },
    { maNhanVien: 'NV02', hoTen: 'Trần Minh Hà', soDienThoai: '0900000002', chucVu: 'Quản lý', tenDangNhap: 'quanly', email: 'quanly@cinema.test', vaiTro: 'QUAN_LY', trangThaiTaiKhoan: 'HOAT_DONG' },
    { maNhanVien: 'NV03', hoTen: 'Lê Quốc Minh', soDienThoai: '0900000003', chucVu: 'Nhân viên bán vé', tenDangNhap: 'nhanvien1', email: 'nhanvien1@cinema.test', vaiTro: 'NHAN_VIEN', trangThaiTaiKhoan: 'HOAT_DONG' },
    { maNhanVien: 'NV04', hoTen: 'Đỗ Thanh Lan', soDienThoai: '0900000004', chucVu: 'Nhân viên bán vé', tenDangNhap: 'nhanvien2', email: 'nhanvien2@cinema.test', vaiTro: 'NHAN_VIEN', trangThaiTaiKhoan: 'HOAT_DONG' }
];

// Doanh thu theo ngày: chỉ tính đơn đã thanh toán (DH01, DH02). DH03 đã hủy, DH04 chưa thanh toán nên không tính.
export function doanhThuMau(tuNgay, denNgay) {
    const ds = [
        { ngay: ngay(-3), soDon: 1, doanhThuVe: giaVeThuong(ngay(-3)) * 2, doanhThuFnb: 45000, giamGia: 10000 },
        { ngay: ngay(-2), soDon: 1, doanhThuVe: giaVeThuong(ngay(-2)) * 2, doanhThuFnb: 65000, giamGia: 10000 }
    ];
    return ds.filter((d) => d.ngay >= tuNgay && d.ngay <= denNgay)
        .map((d) => ({ ...d, tongThu: d.doanhThuVe + d.doanhThuFnb - d.giamGia }));
}

// Các tab báo cáo còn lại: giao diện mẫu
export const BAO_CAO_MAU = {
    veBan: [
        { nhom: 'Ghế thường', soVe: 84, daHuy: 2, daDoi: 1 },
        { nhom: 'Ghế VIP', soVe: 36, daHuy: 1, daDoi: 0 },
        { nhom: 'Sweetbox', soVe: 8, daHuy: 0, daDoi: 0 }
    ],
    theoPhim: [
        { phim: 'Godzilla Trừ Không', soVe: 42, doanhThu: 3990000 },
        { phim: 'Trại Giam Hạnh Phúc', soVe: 35, doanhThu: 3150000 },
        { phim: 'Ma Mút Con Vượt Kỷ Băng Hà', soVe: 29, doanhThu: 2320000 },
        { phim: 'Chị Chị Em Em 3', soVe: 22, doanhThu: 2220000 }
    ],
    fnb: [
        { ten: 'Combo Bắp + Nước', loai: 'Combo', soLuong: 31, doanhThu: 2015000 },
        { ten: 'Bắp rang bơ', loai: 'Đồ ăn', soLuong: 24, doanhThu: 1080000 },
        { ten: 'Cola', loai: 'Thức uống', soLuong: 30, doanhThu: 900000 }
    ],
    khuyenMai: [
        { ma: 'KM01', ten: 'Giảm 10.000đ cho thành viên', soLuot: 12, tongGiam: 120000 },
        { ma: 'KM02', ten: 'Ưu đãi tháng trước', soLuot: 0, tongGiam: 0 }
    ]
};