/* Giao diện 25 - Thêm / sửa / chi tiết giá vé (UC6.1, UC6.2, UC6.5). Giao diện mẫu: kiểm tra dữ liệu, chưa lưu CSDL.
   ?ma=GV01 -> sửa;  ?ma=GV01&xem=1 -> chỉ xem;  không có tham số -> thêm mới. */
import { $, datLoi, dinhDangGio, dinhDangNgay, dinhDangTien, docDuLieu, doLuaChon, hienThongBao, khoaForm, NHAN, ngay, thamSo } from './quan-ly-common.js';
import { GIA_VE } from './du-lieu-mau-quan-ly.js';

const ma = thamSo('ma');
const cheDo = !ma ? 'them' : thamSo('xem') ? 'xem' : 'sua';
// tên trường dữ liệu -> id ô nhập
const O = {
    trangThai: 'trang-thai', loaiVe: 'loai-ve', doiTuongKhachHang: 'doi-tuong', loaiGhe: 'loai-ghe', loaiNgay: 'loai-ngay',
    mucGia: 'muc-gia', khungGioBatDau: 'gio-bat-dau', khungGioKetThuc: 'gio-ket-thuc', ngayBatDau: 'ngay-bat-dau', ngayKetThuc: 'ngay-ket-thuc'
};
let danhSach = [];   // các giá vé đã có, dùng để kiểm tra trùng
let daBamLuu = false;

doLuaChon('trang-thai', NHAN.trangThai);
doLuaChon('loai-ve', NHAN.loaiVe);
doLuaChon('doi-tuong', NHAN.doiTuong);
doLuaChon('loai-ghe', NHAN.loaiGhe);
doLuaChon('loai-ngay', NHAN.loaiNgay);
$('form').addEventListener('input', khiNhap);
$('form').addEventListener('submit', luu);
khoiTao();

async function khoiTao() {
    danhSach = await docDuLieu('/api/gia-ve', GIA_VE);

    if (cheDo === 'them') {
        dienForm({ trangThai: 'DANG_AP_DUNG', khungGioBatDau: '00:00', khungGioKetThuc: '23:59', ngayBatDau: ngay(0), ngayKetThuc: ngay(90) });
        return;
    }
    const gv = danhSach.find((g) => g.maGiaVe === ma);
    if (!gv) {
        hienThongBao($('thong-bao'), 'Giá vé không còn tồn tại.', 'loi');
        $('form').hidden = true;
        return;
    }
    $('ma-gia-ve').value = gv.maGiaVe;
    dienForm(gv);

    if (cheDo === 'sua') {
        $('tieu-de').textContent = `Sửa giá vé ${gv.maGiaVe}`;
        $('duong-dan').textContent = 'Chỉnh sửa';
        $('mo-ta').textContent = 'Thay đổi chỉ áp dụng cho giao dịch mới, giá của vé đã bán được giữ nguyên.';
    } else {
        $('tieu-de').textContent = `Chi tiết giá vé ${gv.maGiaVe}`;
        $('duong-dan').textContent = 'Chi tiết';
        $('mo-ta').textContent = 'Chế độ chỉ xem.';
        khoaForm($('form'));
        $('nut-form').hidden = true;
        $('nut-xem').hidden = false;
        $('nut-sua').href = `gia-ve-form.html?ma=${gv.maGiaVe}`;
    }
    document.title = `$('tieu-de').textContent}`;
}

function dienForm(g) {
    Object.entries(O).forEach(([truong, id]) => {
        if (g[truong] !== undefined) $(id).value = truong.startsWith('khungGio') ? dinhDangGio(g[truong]) : g[truong];
    });
    khiNhap();
}

function docForm() {
    const g = { maGiaVe: $('ma-gia-ve').value };
    Object.entries(O).forEach(([truong, id]) => { g[truong] = $(id).value; });
    return g;
}

/** Mỗi lần nhập: cập nhật gợi ý giá, kiểm tra trùng, và kiểm tra lại các ô nếu đã bấm Lưu. */
function khiNhap() {
    const g = docForm();
    $('goi-y-gia').textContent = g.mucGia ? `= ${dinhDangTien(g.mucGia)}` : 'Lớn hơn 0, là bội số của 1.000 ₫';
    hienTrung(timTrung(g));
    if (daBamLuu) kiemTra(g);
}

/** Trùng khi: cùng điều kiện, cả hai đang áp dụng, chồng lấn ngày hiệu lực và khung giờ. Không so với chính nó (UC6.2). */
function timTrung(g) {
    if (g.trangThai !== 'DANG_AP_DUNG' || !g.ngayBatDau || !g.ngayKetThuc || !g.khungGioBatDau || !g.khungGioKetThuc) return [];
    return danhSach.filter((k) => k.maGiaVe !== g.maGiaVe && k.trangThai === 'DANG_AP_DUNG'
        && k.loaiVe === g.loaiVe && k.doiTuongKhachHang === g.doiTuongKhachHang && k.loaiGhe === g.loaiGhe && k.loaiNgay === g.loaiNgay
        && k.ngayBatDau <= g.ngayKetThuc && g.ngayBatDau <= k.ngayKetThuc
        && dinhDangGio(k.khungGioBatDau) < g.khungGioKetThuc && g.khungGioBatDau < dinhDangGio(k.khungGioKetThuc));
}

function hienTrung(ds) {
    $('canh-bao-trung').hidden = !ds.length || cheDo === 'xem';
    $('canh-bao-trung').innerHTML = 'Đã tồn tại giá vé có cùng điều kiện áp dụng trong khoảng thời gian này: '
        + ds.map((k) => `<a href="gia-ve-form.html?ma=${k.maGiaVe}&xem=1" target="_blank">${k.maGiaVe}</a>
            (${dinhDangTien(k.mucGia)}, ${dinhDangNgay(k.ngayBatDau)} – ${dinhDangNgay(k.ngayKetThuc)})`).join(', ');
}

/** Kiểm tra từng ô theo quy tắc UC6.1. Trả về true nếu tất cả hợp lệ. */
function kiemTra(g) {
    const gia = Number(g.mucGia);
    const ketQua = [
        datLoi('muc-gia', !g.mucGia ? 'Vui lòng nhập mức giá'
            : gia <= 0 ? 'Mức giá phải lớn hơn 0'
                : gia % 1000 ? 'Mức giá phải là bội số của 1.000 ₫' : ''),
        datLoi('gio-bat-dau', g.khungGioBatDau ? '' : 'Vui lòng chọn giờ bắt đầu'),
        datLoi('gio-ket-thuc', !g.khungGioKetThuc ? 'Vui lòng chọn giờ kết thúc'
            : g.khungGioKetThuc <= g.khungGioBatDau ? 'Giờ kết thúc phải sau giờ bắt đầu' : ''),
        datLoi('ngay-bat-dau', g.ngayBatDau ? '' : 'Vui lòng chọn ngày bắt đầu'),
        datLoi('ngay-ket-thuc', !g.ngayKetThuc ? 'Vui lòng chọn ngày kết thúc'
            : g.ngayKetThuc <= g.ngayBatDau ? 'Ngày bắt đầu phải trước ngày kết thúc' : '')
    ];
    return ketQua.every(Boolean);
}

function luu(e) {
    e.preventDefault();
    daBamLuu = true;
    const g = docForm();
    if (!kiemTra(g)) {
        hienThongBao($('thong-bao'), 'Thông tin chưa hợp lệ, vui lòng kiểm tra các ô được đánh dấu.', 'loi');
        return;
    }
    if (timTrung(g).length) {
        hienThongBao($('thong-bao'), 'Đã tồn tại giá vé có cùng điều kiện áp dụng trong khoảng thời gian này.', 'loi');
        return;
    }
    hienThongBao($('thong-bao'), cheDo === 'them'
        ? 'Thêm giá vé thành công (giao diện mẫu, chưa lưu vào CSDL).'
        : 'Cập nhật giá vé thành công (giao diện mẫu, chưa lưu vào CSDL).', 'thanh-cong');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}