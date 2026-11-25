import { dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao, NHAN, thamSo, thoat } from './datve-common.js';

const maVe = thamSo('maVe');
const maDon = thamSo('maDonHang');
const thongBao = document.querySelector('#thong-bao');
try {
    if (!maVe && !maDon) throw new Error('Vui lòng chọn vé hoặc đơn hàng từ lịch sử.');
    const url = maVe ? '/api/ve/' + encodeURIComponent(maVe) : '/api/dat-ve/ket-qua/' + encodeURIComponent(maDon);
    const d = await goiApi(url);
    document.querySelector('#don').innerHTML = `<h2>Đơn ${thoat(d.maDonHang)}</h2>
        <p>${thoat(d.tenPhim)} · ${thoat(d.tenPhong)} · ${dinhDangNgay(d.ngayChieu)} ${dinhDangGio(d.gioBatDau)}</p>
        <p>${thoat(d.thongBao)}</p><ul>${d.dsDichVu.map(m =>
            `<li>${thoat(m.ten)} × ${m.soLuong}: ${dinhDangTien(m.thanhTien)}</li>`).join('')}</ul>
        <p>Tiền vé: ${dinhDangTien(d.tienVe)} · Đồ ăn: ${dinhDangTien(d.tienDichVu)}</p>
        <p>Giảm khuyến mãi: ${dinhDangTien(d.giamKhuyenMai)} · Giảm từ điểm: ${dinhDangTien(d.giamDiem)}</p>
        <p><strong>Tổng: ${dinhDangTien(d.tongTien)}</strong> · ${thoat(NHAN.phuongThuc[d.phuongThuc] || '')}</p>`;
    const ds = document.querySelector('#ve');
    ds.innerHTML = d.dsVe.map(v => `<article class="chau-card mc-ticket">
        <div><span class="mc-accent"><strong>MegaCine</strong> · Vé điện tử</span>
        <h2>${thoat(d.tenPhim || 'Vé xem phim')}</h2><p>${thoat(d.tenPhong)} · ${dinhDangNgay(d.ngayChieu)} · ${dinhDangGio(d.gioBatDau)}</p>
        <p>Ghế <strong>${thoat(v.tenGhe)}</strong> · ${thoat(v.loaiGhe)} · ${dinhDangTien(v.donGia)}</p>
        ${maVe ? '' : `<a class="mc-accent" href="chi-tiet-ve.html?maVe=${encodeURIComponent(v.maVe)}">Xem vé này</a>`}</div>
        <div class="mc-ticket-code"><span class="mc-pill">${thoat(NHAN.trangThaiVe[v.trangThai] || v.trangThai)}</span>
        <div data-qr="${thoat(v.maQR)}"></div><small>${thoat(v.maVe)}</small></div></article>`).join('')
        || '<p>Đơn hàng chưa có vé được phát hành.</p>';
    ds.querySelectorAll('[data-qr]').forEach(el => {
        if (window.QRCode) new window.QRCode(el, { text: el.dataset.qr, width: 128, height: 128 });
        else el.textContent = el.dataset.qr;
    });
} catch (loi) {
    hienThongBao(thongBao, loi.message, 'loi');
}
