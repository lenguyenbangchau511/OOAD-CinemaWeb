/* Giao diện 11 - Kết quả đặt vé và vé điện tử (UC5.6/5.8). Chạy thật với /api/dat-ve/ket-qua/{maDonHang}. */
import {
    dinhDangGio, dinhDangNgay, dinhDangNgayGio, dinhDangTien, goiApi, hienThongBao, layPhienDatVe,
    NHAN, thamSo, thoat, xoaPhienDatVe, chipTrangThai
} from './datve-common.js';

const maDonHang = thamSo('maDonHang') || layPhienDatVe().maDonHang;
const vung = document.getElementById('noi-dung');

khoiTao();

async function khoiTao() {
    if (!maDonHang) {
        vung.innerHTML = '<div class="trong"><h2>Chưa có đơn hàng</h2><p>Không tìm thấy mã đơn hàng cần xem.</p><a class="button primary" href="./">Về trang chủ</a></div>';
        return;
    }
    try {
        const kq = await goiApi(`/api/dat-ve/ket-qua/${encodeURIComponent(maDonHang)}`);
        ve(kq);
    } catch (loi) {
        vung.innerHTML = '';
        hienThongBao(document.getElementById('thong-bao'), loi.thongBao, 'loi');
    }
}

const BIEU_TUONG = { THANH_CONG: '✓', THAT_BAI: '!', CAN_DOI_SOAT: '!', CHO_PHAT_HANH: '…', CHO_XAC_MINH: '…', CHUA_THANH_TOAN: '…' };
const TIEU_DE = {
    THANH_CONG: 'Đặt vé thành công', THAT_BAI: 'Giao dịch không thành công', CAN_DOI_SOAT: 'Đơn hàng không thể hoàn tất', CHO_PHAT_HANH: 'Đã thu tiền, vé đang chờ phát hành',
    CHO_XAC_MINH: 'Giao dịch đang chờ xác minh', CHUA_THANH_TOAN: 'Đơn hàng chưa được thanh toán'
};

function ve(kq) {
    const thanhCong = kq.ketQua === 'THANH_CONG';
    vung.innerHTML = `
        <div class="banner-ket-qua ${thoat(kq.ketQua)}" role="status">
            <span class="bieu-tuong" aria-hidden="true">${BIEU_TUONG[kq.ketQua] || ''}</span>
            <div><h1 style="margin:0 0 4px">${TIEU_DE[kq.ketQua] || 'Kết quả giao dịch'}</h1>
                <p>${thoat(kq.thongBao)}</p>
                <p class="muted">Mã đơn hàng: <strong>${thoat(kq.maDonHang)}</strong>${thanhCong ? ' · Email xác nhận đã được gửi cho bạn (minh họa)' : ''}</p></div>
        </div>
        ${thanhCong ? phanVe(kq) : ''}
        <div class="layout-2" style="margin-top:20px">
            ${thanhCong ? phanDichVu(kq) : '<div></div>'}
            ${phanThanhToan(kq)}
        </div>`;
    document.getElementById('nut-phat-hanh-lai')?.addEventListener('click', phatHanhLai);
    if (thanhCong) {
        veMaQR(kq);
        xoaPhienDatVe();                           // giao dịch đã xong, bỏ dữ liệu phiên đặt vé
    }
}

function phanVe(kq) {
    return `<section aria-labelledby="tieu-de-ve"><h2 id="tieu-de-ve" style="margin-bottom:12px">Vé điện tử (${kq.dsVe.length} vé)</h2>
        ${kq.dsVe.map((v) => `
        <article class="ve" aria-label="Vé ${thoat(v.maVe)}">
            <div class="ve-noi-dung">
                <h3>${thoat(kq.tenPhim)}${kq.gioiHanDoTuoi ? ` <span class="muted">(${thoat(kq.gioiHanDoTuoi)})</span>` : ''}</h3>
                <dl class="dl">
                    <dt>Suất chiếu</dt><dd>${dinhDangGio(kq.gioBatDau)} · ${dinhDangNgay(kq.ngayChieu)}</dd>
                    <dt>Phòng</dt><dd>${thoat(kq.tenPhong)}</dd>
                    <dt>Ghế</dt><dd><strong>${thoat(v.tenGhe)}</strong> · ${NHAN.loaiGhe[v.loaiGhe] || thoat(v.loaiGhe)}</dd>
                    <dt>Giá vé</dt><dd>${dinhDangTien(v.donGia)}</dd>
                    <dt>Trạng thái</dt><dd>${chipTrangThai(v.trangThai, NHAN.trangThaiVe)}</dd>
                </dl>
            </div>
            <div class="ve-qr">
                <div class="khung-qr" data-qr="${thoat(v.maQR)}"></div>
                <span class="ma-ve">${thoat(v.maVe)}</span>
                <span class="muted">Đưa mã này khi vào rạp</span>
            </div>
        </article>`).join('')}</section>`;
}

/** Vẽ mã QR từ chuỗi maQR. Nếu thư viện QR không tải được (offline) thì hiện chuỗi mã để vẫn đối chiếu được. */
function veMaQR(kq) {
    document.querySelectorAll('.khung-qr').forEach((khung) => {
        const noiDung = khung.dataset.qr;
        try {
            if (!window.QRCode) throw new Error('khong co thu vien');
            new window.QRCode(khung, { text: noiDung, width: 120, height: 120 });
        } catch {
            khung.innerHTML = `<code>${thoat(noiDung)}</code>`;
        }
    });
}

function phanDichVu(kq) {
    const dichVu = kq.dsDichVu.length
        ? kq.dsDichVu.map((d) => `<div class="dong-tien"><span>${thoat(d.ten)} × ${d.soLuong}</span><span>${dinhDangTien(d.thanhTien)}</span></div>`).join('')
        : '<p class="muted">Đơn hàng không có đồ ăn, thức uống.</p>';
    return `<section class="card"><h2>Đồ ăn &amp; thức uống</h2>${dichVu}
        <p class="muted" style="margin-top:12px">Nhận đồ ăn tại quầy bằng mã đơn hàng ${thoat(kq.maDonHang)}.</p></section>`;
}

function phanThanhToan(kq) {
    const thanhCong = kq.ketQua === 'THANH_CONG';
    const dong = (ten, gt, lop = '') => `<div class="dong-tien"><span>${ten}</span><span class="${lop}">${gt}</span></div>`;
    return `<aside class="card"><h2>Thanh toán</h2>
        ${dong('Tiền vé', dinhDangTien(kq.tienVe))}
        ${Number(kq.tienDichVu) > 0 ? dong('Đồ ăn, thức uống', dinhDangTien(kq.tienDichVu)) : ''}
        ${Number(kq.giamKhuyenMai) > 0 ? dong('Khuyến mãi' + (kq.maKhuyenMai ? ` (${thoat(kq.maKhuyenMai)})` : ''), '-' + dinhDangTien(kq.giamKhuyenMai), 'giam') : ''}
        ${Number(kq.giamDiem) > 0 ? dong(`Dùng ${kq.diemSuDung} điểm`, '-' + dinhDangTien(kq.giamDiem), 'giam') : ''}
        <div class="dong-tien tong"><span>Tổng cộng</span><span>${dinhDangTien(kq.tongTien)}</span></div>
        ${kq.phuongThuc ? `<p class="muted">Thanh toán qua ${NHAN.phuongThuc[kq.phuongThuc] || thoat(kq.phuongThuc)}` +
            `${kq.maGiaoDichDoiTac ? ` · Mã giao dịch ${thoat(kq.maGiaoDichDoiTac)}` : ''}</p>` : ''}
        ${thanhCong && kq.diemTichDuoc > 0 ? `<p class="muted">Bạn được tích lũy <strong>${kq.diemTichDuoc}</strong> điểm cho đơn hàng này.</p>` : ''}
        <p class="muted">Đặt lúc ${dinhDangNgayGio(kq.ngayDat)}</p>
        <div class="hanh-dong">
            ${thanhCong ? '<a class="button secondary" href="lich-su-ve.html">Lịch sử mua vé</a><a class="button primary" href="./">Về trang chủ</a>'
                : (kq.ketQua === 'CHO_PHAT_HANH' ? '<button class="button primary" type="button" id="nut-phat-hanh-lai">Thử phát hành lại vé</button><a class="button secondary" href="./">Về trang chủ</a>'
                : kq.ketQua === 'CAN_DOI_SOAT' ? '<a class="button primary" href="./">Về trang chủ</a>'
                    : `<a class="button primary" href="thanh-toan.html?maDonHang=${encodeURIComponent(kq.maDonHang)}">${kq.ketQua === 'CHO_XAC_MINH' ? 'Kiểm tra lại kết quả' : 'Quay lại thanh toán'}</a>`)}
        </div></aside>`;
}

/** Đơn đã thu tiền nhưng chưa phát hành được vé: thử hoàn tất lại, tuyệt đối không bắt thanh toán lần nữa. */
async function phatHanhLai(e) {
    const nut = e.currentTarget;
    const phien = layPhienDatVe();
    nut.disabled = true;
    try {
        await goiApi(`/api/thanh-toan/don-hang/${encodeURIComponent(maDonHang)}/phat-hanh-lai`, {
            method: 'POST',
            body: { maPhienGiu: phien.maPhienGiu, dsMaGheSuat: (phien.dsGhe || []).map((g) => g.maGheSuat) }
        });
        location.reload();
    } catch (loi) {
        hienThongBao(document.getElementById('thong-bao'), loi.thongBao, 'loi');
        nut.disabled = false;
    }
}
