/**
 * Hàm dùng chung cho các màn hình của Hậu (7, 10, 11, 12, 18, 19, 20, 21).
 * Thuần JavaScript (ES module), không cần thư viện.
 */

/**
 * TÊN CÁC TRANG CỦA NGƯỜI KHÁC - nếu nhóm đặt tên file khác thì chỉ cần sửa đúng chỗ này.
 */
export const TRANG = {
    trangChu: './',
    dangNhap: 'login.html',                    // giao diện 1 (Hiền)
    noiBo: 'noi-bo.html',                      // giao diện 4 (Hiền)
    chonDoAn: 'chon-do-an.html',               // giao diện 8 (Châu)
    xacNhanDon: 'xac-nhan-don.html',           // giao diện 9 (Châu)
    chiTietVe: 'chi-tiet-ve.html',             // giao diện 13 (Châu), nhận ?maDonHang=
    suatChieuThemSua: 'suat-chieu-form.html',  // giao diện 22 (Trung), nhận ?maSuat= khi sửa
    suatChieuChiTiet: 'suat-chieu-chi-tiet.html' // giao diện 23 (Trung), nhận ?maSuat=
};

/** Khóa sessionStorage lưu "phiên đặt vé" chia sẻ giữa các bước 7 -> 8 -> 9 -> 10 -> 11. */
export function duongDanChonSuat(maPhim, ngay) {
    if (!maPhim) return './';
    const query = new URLSearchParams({ maPhim });
    if (ngay) query.set('ngay', ngay);
    return `chi-tiet-phim.html?${query}#lich-chieu`;
}

const KHOA_DAT_VE = 'cinema.datVe';

/**
 * Phiên đặt vé gồm: maSuat, maPhienGiu (Hậu, bước 7); dichVu (Châu, bước 8);
 * maDonHang, phuongThuc (Châu, bước 9); Hậu đọc maPhienGiu + maDonHang ở bước 10.
 */
export function layPhienDatVe() {
    try { return JSON.parse(sessionStorage.getItem(KHOA_DAT_VE)) || {}; } catch { return {}; }
}

export function luuPhienDatVe(phan) {
    try { sessionStorage.setItem(KHOA_DAT_VE, JSON.stringify({ ...layPhienDatVe(), ...phan })); } catch { /* bỏ qua */ }
}

export function xoaPhienDatVe() {
    try { sessionStorage.removeItem(KHOA_DAT_VE); } catch { /* bỏ qua */ }
}

/** Gọi API, trả JSON. Lỗi ném Error có .thongBao (câu hiển thị), .ma, .status. Chưa đăng nhập -> chuyển tới trang đăng nhập. */
export async function goiApi(url, { method = 'GET', body, chuyenKhiChuaDangNhap = true } = {}) {
    const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin'
    });
    if (res.status === 204) return null;
    let data = null;
    try { data = await res.json(); } catch { /* không có nội dung */ }
    if (res.ok) return data;
    if (res.status === 401 && chuyenKhiChuaDangNhap) {
        location.href = `${TRANG.dangNhap}?quayLai=${encodeURIComponent(location.pathname + location.search)}`;
    }
    const loi = new Error(data?.thongBao || 'Có lỗi xảy ra, vui lòng thử lại');
    loi.thongBao = loi.message; loi.ma = data?.ma; loi.status = res.status;
    throw loi;
}

export const thamSo = (ten) => new URLSearchParams(location.search).get(ten);

export function dinhDangTien(so) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(Number(so) || 0)) + ' ₫';
}

export function dinhDangNgay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

export const dinhDangGio = (gio) => (gio || '').slice(0, 5);

export function dinhDangNgayGio(iso) {
    return iso ? `${dinhDangGio(iso.slice(11))} ${dinhDangNgay(iso)}` : '';
}

/** Chống chèn HTML khi đưa dữ liệu vào innerHTML. */
export function thoat(chuoi) {
    return String(chuoi ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function homNay() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function congNgay(iso, soNgay) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + soNgay);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Hiện thông báo trong một thẻ role="status". loai: 'loi' | 'thanh-cong' | 'thong-tin'. */
export function hienThongBao(el, noiDung, loai = 'thong-tin') {
    if (!el) return;
    if (!noiDung) { el.hidden = true; el.textContent = ''; return; }
    el.className = `alert ${loai}`;
    el.textContent = noiDung;
    el.hidden = false;
}

export const NHAN = {
    trangThaiDon: { CHO_THANH_TOAN: 'Chờ thanh toán', DA_THANH_TOAN: 'Đã thanh toán', DA_HUY: 'Đã hủy' },
    trangThaiVe: { CHUA_SU_DUNG: 'Chưa sử dụng', DA_SU_DUNG: 'Đã sử dụng', DA_HUY: 'Đã hủy', HET_HAN: 'Hết hạn', DA_DOI: 'Đã đổi' },
    trangThaiSuat: { SAP_CHIEU: 'Sắp chiếu', DANG_CHIEU: 'Đang chiếu', KET_THUC: 'Đã kết thúc', DA_HUY: 'Đã hủy' },
    trangThaiPhong: { HOAT_DONG: 'Hoạt động', BAO_TRI: 'Bảo trì', DONG_CUA: 'Đóng cửa' },
    loaiGhe: { STANDARD: 'Thường', VIP: 'VIP', SWEETBOX: 'Sweetbox' },
    loaiPhong: { STANDARD: 'Tiêu chuẩn', VIP: 'VIP', IMAX: 'IMAX', '3D': '3D' },
    phuongThuc: { MOMO: 'Ví MoMo', VNPAY: 'VNPay', THE_NGAN_HANG: 'Thẻ ngân hàng', TIEN_MAT: 'Tiền mặt', DIEM_THUONG: 'Điểm thưởng' },
    kenhBan: { ONLINE: 'Trực tuyến', TAI_QUAY: 'Tại quầy' }
};

/** Màu chip theo trạng thái (kèm chữ nên không chỉ dựa vào màu). */
export const ANH_MON_MAC_DINH = {
    SP01: 'images/butter-popcorn.png',
    SP02: 'images/caramel-popcorn.png',
    SP03: 'images/cheese-popcorn.png',
    SP04: 'images/snack-khoai-tay.jpg',
    SP05: 'images/snack-rong-bien.jpg',
    SP06: 'images/nachos-sot-pho-mai.jpg',
    SP07: 'images/xuc-xich-nuong.jpg',
    SP08: 'images/khoai-tay-chien.jpg',
    SP09: 'images/coca-cola.webp',
    SP10: 'images/soda-chanh.jpg',
    SP11: 'images/nuoc-suoi.webp',
    SP12: 'images/tra-dao.jpg',
    SP13: 'images/tra-xanh.jpg',
    CB01: 'images/combo-ca-nhan.png',
    CB02: 'images/combo-cap-doi-caramel.png',
    CB03: 'images/combo-cap-doi-pho-mai.png',
    CB04: 'images/combo-nhom.png'
};

export function anhMon(mon) {
    return mon?.hinhAnh?.trim() || ANH_MON_MAC_DINH[mon?.ma || mon?.maSanPham || mon?.maCombo] || '';
}

export function chipTrangThai(ma, bang) {
    const nhom = { DA_THANH_TOAN: 'tot', HOAT_DONG: 'tot', CHUA_SU_DUNG: 'tot', SAP_CHIEU: 'tot', DANG_CHIEU: 'tot',
        CHO_THANH_TOAN: 'cho', BAO_TRI: 'cho', DA_SU_DUNG: 'trung-tinh', KET_THUC: 'trung-tinh',
        DA_HUY: 'xau', DONG_CUA: 'xau', HET_HAN: 'xau', DA_DOI: 'trung-tinh' }[ma] || 'trung-tinh';
    return `<span class="chip ${nhom}">${thoat(bang[ma] || ma || '—')}</span>`;
}

export async function layNguoiDungDatVe() {
    try {
        return await goiApi('/api/dat-ve/toi', { chuyenKhiChuaDangNhap: false });
    } catch {
        return null;
    }
}

/** Đếm ngược mm:ss. dongHo.bat(soGiay) để bắt đầu / đồng bộ lại; hết giờ thì gọi khiHetGio(). */
export function taoDongHoDemNguoc(el, khiHetGio) {
    let conLai = 0;
    let timer = null;
    const ve = () => {
        el.textContent = `${String(Math.floor(conLai / 60)).padStart(2, '0')}:${String(conLai % 60).padStart(2, '0')}`;
        el.classList.toggle('sap-het', conLai > 0 && conLai <= 60);
    };
    const dung = () => { clearInterval(timer); timer = null; };
    return {
        bat(soGiay) {
            dung();
            conLai = Math.max(0, Math.floor(soGiay));
            ve();
            if (conLai === 0) return;
            timer = setInterval(() => {
                conLai -= 1;
                ve();
                if (conLai <= 0) { dung(); khiHetGio(); }
            }, 1000);
        },
        dung,
        conLai: () => conLai
    };
}
