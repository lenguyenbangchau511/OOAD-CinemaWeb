/* Giao diện 37 - Thêm / sửa / chi tiết khuyến mãi (UC9.1, UC9.2, UC9.5). Giao diện mẫu: kiểm tra dữ liệu, chưa lưu CSDL.
   ?ma=KM01 -> sửa;  ?ma=KM01&xem=1 -> chỉ xem;  không có tham số -> thêm mới. */
import { $, datLoi, dinhDangTien, docDuLieu, doLuaChon, hienThongBao, khoaForm, NHAN, ngay, thamSo } from './quan-ly-common.js';
import { KHUYEN_MAI } from './du-lieu-mau-quan-ly.js';

const ma = thamSo('ma');
const cheDo = !ma ? 'them' : thamSo('xem') ? 'xem' : 'sua';
// tên trường dữ liệu -> id ô nhập
const O = {
    maKhuyenMai: 'ma-km', trangThai: 'trang-thai', tenChuongTrinh: 'ten', noiDung: 'noi-dung',
    hinhThucGiam: 'hinh-thuc', mucGiam: 'muc-giam', phamViApDung: 'pham-vi', giaTriDonToiThieu: 'don-toi-thieu',
    doiTuongApDung: 'doi-tuong', kenhBan: 'kenh-ban', ngayBatDau: 'ngay-bat-dau', ngayKetThuc: 'ngay-ket-thuc',
    gioiHanLuotSuDung: 'gioi-han', mucUuTien: 'uu-tien'
};
let danhSach = [];
let soLuotDaSuDung = 0;
let daBamLuu = false;

doLuaChon('trang-thai', NHAN.trangThai);
doLuaChon('hinh-thuc', NHAN.hinhThucGiam);
doLuaChon('pham-vi', NHAN.phamVi);
doLuaChon('doi-tuong', NHAN.doiTuongKM);
doLuaChon('kenh-ban', NHAN.kenhBan);
$('ma-km').addEventListener('input', () => { $('ma-km').value = $('ma-km').value.toUpperCase(); });
$('form').addEventListener('input', khiNhap);
$('form').addEventListener('submit', luu);
khoiTao();

async function khoiTao() {
    danhSach = await docDuLieu('/api/khuyen-mai', KHUYEN_MAI);

    if (cheDo === 'them') {
        dienForm({ trangThai: 'DANG_AP_DUNG', hinhThucGiam: 'THEO_SO_TIEN', phamViApDung: 'TOAN_DON', doiTuongApDung: 'THANH_VIEN',
            kenhBan: 'TAT_CA', giaTriDonToiThieu: 0, ngayBatDau: ngay(0), ngayKetThuc: ngay(30), gioiHanLuotSuDung: 100, mucUuTien: 1 });
        return;
    }
    const km = danhSach.find((k) => k.maKhuyenMai === ma);
    if (!km) {
        hienThongBao($('thong-bao'), 'Khuyến mãi không còn tồn tại.', 'loi');
        $('form').hidden = true;
        return;
    }
    soLuotDaSuDung = km.soLuotDaSuDung;
    dienForm(km);
    $('ma-km').readOnly = true;   // UC9.2: không chỉnh sửa mã khuyến mãi
    $('goi-y-ma').textContent = 'Mã khuyến mãi không thể thay đổi';

    if (cheDo === 'sua') {
        $('tieu-de').textContent = `Sửa khuyến mãi ${km.maKhuyenMai}`;
        $('duong-dan').textContent = 'Chỉnh sửa';
        $('mo-ta').textContent = 'Thay đổi không ảnh hưởng đến khoản giảm đã ghi nhận trong các giao dịch trước đó.';
    } else {
        $('tieu-de').textContent = `Chi tiết khuyến mãi ${km.maKhuyenMai}`;
        $('duong-dan').textContent = 'Chi tiết';
        $('mo-ta').textContent = 'Chế độ chỉ xem.';
        khoaForm($('form'));
        $('nut-form').hidden = true;
        $('nut-xem').hidden = false;
        $('nut-sua').href = `khuyen-mai-form.html?ma=${km.maKhuyenMai}`;
    }
    document.title = `$('tieu-de').textContent}`;
}

function dienForm(km) {
    Object.entries(O).forEach(([truong, id]) => { if (km[truong] !== undefined) $(id).value = km[truong]; });
    khiNhap();
}

function docForm() {
    const km = {};
    Object.entries(O).forEach(([truong, id]) => { km[truong] = $(id).value.trim(); });
    return km;
}

/** Mỗi lần nhập: cập nhật nhãn và gợi ý, kiểm tra mã trùng và đồng hạng ưu tiên. */
function khiNhap() {
    const km = docForm();
    const phanTram = km.hinhThucGiam === 'THEO_PHAN_TRAM';

    $('nhan-muc-giam').textContent = phanTram ? 'Mức giảm (%) *' : 'Mức giảm (₫) *';
    $('muc-giam').step = phanTram ? 1 : 1000;
    $('goi-y-giam').textContent = !km.mucGiam ? (phanTram ? 'Từ 1 đến 100%' : 'Lớn hơn 0, là bội số của 1.000 ₫')
        : phanTram ? `Giảm ${km.mucGiam}% trên phần ${NHAN.phamVi[km.phamViApDung].toLowerCase()}`
            : `= ${dinhDangTien(km.mucGiam)}`;
    $('da-dung').textContent = `Đã dùng: ${soLuotDaSuDung} lượt`;

    // Kiểm tra mã trùng ngay khi gõ (chỉ khi thêm mới)
    if (cheDo === 'them' && km.maKhuyenMai) {
        datLoi('ma-km', danhSach.some((k) => k.maKhuyenMai === km.maKhuyenMai) ? 'Mã khuyến mãi đã tồn tại' : '');
    }

    // Cảnh báo đồng hạng: khuyến mãi khác đang áp dụng, cùng mức ưu tiên, trùng thời gian (UC9.7)
    const dongHang = danhSach.filter((k) => k.maKhuyenMai !== km.maKhuyenMai && k.trangThai === 'DANG_AP_DUNG'
        && String(k.mucUuTien) === km.mucUuTien && k.ngayBatDau <= km.ngayKetThuc && km.ngayBatDau <= k.ngayKetThuc);
    const goiY = $('goi-y-uu-tien');
    goiY.classList.toggle('canh-bao', dongHang.length > 0 && cheDo !== 'xem');
    goiY.textContent = dongHang.length && cheDo !== 'xem'
        ? `Đồng hạng với ${dongHang.map((k) => k.maKhuyenMai).join(', ')}: khi cùng hợp lệ, người dùng phải tự chọn một chương trình`
        : 'Số nhỏ hơn được ưu tiên trước khi nhiều khuyến mãi cùng hợp lệ';

    if (daBamLuu) kiemTra(km);
}

/** Kiểm tra từng ô theo quy tắc UC9.1. Trả về true nếu tất cả hợp lệ. */
function kiemTra(km) {
    const phanTram = km.hinhThucGiam === 'THEO_PHAN_TRAM';
    const giam = Number(km.mucGiam);
    const gioiHan = Number(km.gioiHanLuotSuDung);
    const uuTien = Number(km.mucUuTien);

    const ketQua = [
        cheDo !== 'them' || datLoi('ma-km', !km.maKhuyenMai ? 'Vui lòng nhập mã khuyến mãi'
            : !/^[A-Z0-9]{3,20}$/.test(km.maKhuyenMai) ? 'Mã gồm 3–20 ký tự chữ in hoa hoặc số, không dấu, không khoảng trắng'
                : danhSach.some((k) => k.maKhuyenMai === km.maKhuyenMai) ? 'Mã khuyến mãi đã tồn tại' : ''),
        datLoi('ten', km.tenChuongTrinh ? '' : 'Vui lòng nhập tên chương trình'),
        datLoi('noi-dung', km.noiDung ? '' : 'Vui lòng nhập nội dung'),
        datLoi('muc-giam', !km.mucGiam ? 'Vui lòng nhập mức giảm'
            : giam <= 0 ? 'Mức giảm phải lớn hơn 0'
                : phanTram && giam > 100 ? 'Tỷ lệ giảm không vượt quá 100%'
                    : phanTram && !Number.isInteger(giam) ? 'Tỷ lệ giảm phải là số nguyên'
                        : !phanTram && giam % 1000 ? 'Số tiền giảm phải là bội số của 1.000 ₫' : ''),
        datLoi('don-toi-thieu', km.giaTriDonToiThieu === '' || Number(km.giaTriDonToiThieu) < 0 ? 'Giá trị đơn tối thiểu không được âm' : ''),
        datLoi('ngay-bat-dau', km.ngayBatDau ? '' : 'Vui lòng chọn ngày bắt đầu'),
        datLoi('ngay-ket-thuc', !km.ngayKetThuc ? 'Vui lòng chọn ngày kết thúc'
            : km.ngayKetThuc <= km.ngayBatDau ? 'Ngày bắt đầu phải trước ngày kết thúc' : ''),
        datLoi('gioi-han', !Number.isInteger(gioiHan) || gioiHan < 1 ? 'Giới hạn là số nguyên từ 1 trở lên'
            : gioiHan < soLuotDaSuDung ? `Không được nhỏ hơn số lượt đã dùng (${soLuotDaSuDung})` : ''),
        datLoi('uu-tien', !Number.isInteger(uuTien) || uuTien < 1 ? 'Mức ưu tiên là số nguyên từ 1 trở lên' : '')
    ];
    return ketQua.every(Boolean);
}

function luu(e) {
    e.preventDefault();
    daBamLuu = true;
    if (!kiemTra(docForm())) {
        hienThongBao($('thong-bao'), 'Thông tin chưa hợp lệ, vui lòng kiểm tra các ô được đánh dấu.', 'loi');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    hienThongBao($('thong-bao'), cheDo === 'them'
        ? 'Thêm khuyến mãi thành công (giao diện mẫu, chưa lưu vào CSDL).'
        : 'Cập nhật khuyến mãi thành công (giao diện mẫu, chưa lưu vào CSDL).', 'thanh-cong');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}