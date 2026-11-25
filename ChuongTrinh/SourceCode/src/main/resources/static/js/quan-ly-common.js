/* Hàm dùng chung cho các màn hình của Giang (24, 25, 28, 36, 37, 39, 45). */

/** Tên trang của thành viên khác. Nhóm đặt tên khác thì chỉ sửa ở đây. */
export const TRANG = {
    danhSachKhachHang: 'khach-hang.html',   // giao diện 27 (Hiền)
    danhSachNhanVien: 'nhan-vien.html',     // giao diện 38 (Hiền)
    lichSuVe: 'lich-su-ve.html'             // giao diện 12 (Hậu)
};

export const $ = (id) => document.getElementById(id);
export const thamSo = (ten) => new URLSearchParams(location.search).get(ten);

/** Gọi API, trả về JSON. Lỗi thì ném Error kèm câu thông báo. */
export async function goiApi(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    const data = await res.json().catch(() => null);
    if (res.ok) return data;
    const loi = new Error(data?.thongBao || 'Có lỗi xảy ra, vui lòng thử lại');
    loi.status = res.status;
    throw loi;
}

/** Đọc dữ liệu từ API. Khi chưa chạy backend thì dùng dữ liệu mẫu để vẫn xem được giao diện. */
export async function docDuLieu(url, duLieuMau) {
    try {
        return await goiApi(url);
    } catch (loi) {
        if (loi.status === 401 || loi.status === 403) throw loi;
        hienThongBao($('thong-bao'), 'Chưa kết nối được máy chủ, đang hiển thị dữ liệu mẫu.', 'thong-tin');
        return structuredClone(duLieuMau);
    }
}

/** Chống chèn mã HTML khi đưa dữ liệu vào innerHTML. */
export function thoat(chuoi) {
    return String(chuoi ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const dinhDangSo = (so) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(so) || 0));
export const dinhDangTien = (so) => dinhDangSo(so) + ' ₫';
export const dinhDangGio = (gio) => (gio || '').slice(0, 5);

/** Số tiền dùng trong bảng: số đậm, ký hiệu ₫ nhỏ. */
export const htmlTien = (so) => `<span class="tien">${dinhDangSo(so)}<small>₫</small></span>`;

/** 2026-11-25 -> 25/11/2026 */
export function dinhDangNgay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

/** Ngày yyyy-mm-dd cách hôm nay soNgay ngày. */
export function ngay(soNgay = 0) {
    const d = new Date();
    d.setDate(d.getDate() + soNgay);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Hiện thông báo. loai: 'loi' | 'thanh-cong' | 'thong-tin'. Nội dung rỗng thì ẩn. */
export function hienThongBao(el, noiDung, loai = 'thong-tin') {
    el.hidden = !noiDung;
    el.className = `alert ${loai}`;
    el.textContent = noiDung || '';
}

/** Nhãn tiếng Việt cho các mã lưu trong CSDL. */
export const NHAN = {
    trangThai: { DANG_AP_DUNG: 'Đang áp dụng', NGUNG_AP_DUNG: 'Ngừng áp dụng' },
    loaiVe: { VE_2D: 'Vé 2D', VE_3D: 'Vé 3D', VE_IMAX: 'Vé IMAX' },
    doiTuong: { NGUOI_LON: 'Người lớn', HSSV: 'Học sinh, sinh viên', TRE_EM: 'Trẻ em', NGUOI_CAO_TUOI: 'Người cao tuổi' },
    loaiGhe: { STANDARD: 'Thường', VIP: 'VIP', SWEETBOX: 'Sweetbox' },
    loaiNgay: { NGAY_THUONG: 'Ngày thường', CUOI_TUAN: 'Cuối tuần', NGAY_LE: 'Ngày lễ' },
    hinhThucGiam: { THEO_PHAN_TRAM: 'Theo phần trăm', THEO_SO_TIEN: 'Theo số tiền' },
    phamVi: { VE: 'Vé', DO_AN_THUC_UONG: 'Đồ ăn, thức uống', TOAN_DON: 'Toàn đơn' },
    doiTuongKM: { TAT_CA: 'Tất cả khách hàng', THANH_VIEN: 'Khách hàng thành viên' },
    kenhBan: { TAT_CA: 'Tất cả kênh', TRUC_TUYEN: 'Trực tuyến', TAI_QUAY: 'Tại quầy' },
    vaiTro: { ADMIN: 'Quản trị viên', QUAN_LY: 'Quản lý', NHAN_VIEN: 'Nhân viên', KHACH_HANG: 'Khách hàng' },
    trangThaiTK: { HOAT_DONG: 'Hoạt động', KHONG_HOAT_DONG: 'Đã khóa' }
};

/** Chip trạng thái có màu (kèm chữ, không chỉ dựa vào màu). */
export function chip(ma, bang) {
    const mau = { DANG_AP_DUNG: 'tot', HOAT_DONG: 'tot', NGUNG_AP_DUNG: 'trung-tinh', KHONG_HOAT_DONG: 'xau' }[ma] || 'trung-tinh';
    return `<span class="chip ${mau}">${thoat(bang[ma] || ma)}</span>`;
}

/** Tình trạng hiệu lực thực tế, tính từ trạng thái và ngày hiệu lực. Trả về HTML chip. */
export function chipHieuLuc(trangThai, ngayBatDau, ngayKetThuc) {
    const homNay = ngay(0);
    if (trangThai !== 'DANG_AP_DUNG') return '<span class="chip trung-tinh">Ngừng áp dụng</span>';
    if (ngayKetThuc < homNay) return '<span class="chip xau">Hết hiệu lực</span>';
    if (ngayBatDau > homNay) return '<span class="chip cho">Chưa hiệu lực</span>';
    const conLai = Math.round((new Date(ngayKetThuc) - new Date(homNay)) / 86400000);
    if (conLai <= 7) return `<span class="chip cho">Còn ${conLai} ngày</span>`;
    return '<span class="chip tot">Đang áp dụng</span>';
}

/** Mức giảm hiển thị: "10%" hoặc "10.000 ₫". */
export const moTaMucGiam = (km) => (km.hinhThucGiam === 'THEO_PHAN_TRAM' ? `${Number(km.mucGiam)}%` : dinhDangTien(km.mucGiam));

/** Đổ các lựa chọn vào thẻ select từ bảng nhãn. coTatCa = true thì thêm dòng "Tất cả" (dùng cho bộ lọc). */
export function doLuaChon(idSelect, bang, coTatCa = false) {
    $(idSelect).innerHTML = (coTatCa ? '<option value="">Tất cả</option>' : '')
        + Object.entries(bang).map(([ma, nhan]) => `<option value="${ma}">${nhan}</option>`).join('');
}

/** Báo lỗi dưới một ô nhập. Không có lỗi thì xóa báo lỗi. Trả về true nếu hợp lệ. */
export function datLoi(idO, noiDung) {
    const field = $(idO).closest('.field');
    field.classList.toggle('invalid', Boolean(noiDung));
    let loi = field.querySelector('.error');
    if (!loi) {
        loi = document.createElement('span');
        loi.className = 'error';
        field.append(loi);
    }
    loi.textContent = noiDung || '';
    return !noiDung;
}

/** Chế độ chỉ xem: khóa mọi ô nhập trong form. */
export function khoaForm(form) {
    form.querySelectorAll('input, select, textarea').forEach((o) => { o.disabled = true; });
}

/** Thanh tab: bấm tab nào thì hiện panel của tab đó (panel có id = aria-controls của tab). */
export function ganTab(tablist) {
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab) => tab.addEventListener('click', () => {
        tabs.forEach((t) => {
            t.setAttribute('aria-selected', t === tab);
            $(t.getAttribute('aria-controls')).hidden = t !== tab;
        });
    }));
}