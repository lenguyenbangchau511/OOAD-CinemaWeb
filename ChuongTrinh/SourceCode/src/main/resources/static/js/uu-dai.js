import { dinhDangNgay, dinhDangTien, goiApi } from './datve-common.js';
import { esc } from './cinema-ui.js';

const status = document.querySelector('#offer-status');
const retry = document.querySelector('#offer-retry');
const list = document.querySelector('#offer-list');
const ranges = { VE: 'Tiền vé', DO_AN_THUC_UONG: 'Đồ ăn và thức uống', TOAN_DON: 'Toàn đơn' };

function card(promo) {
    const discount = promo.hinhThucGiam === 'THEO_PHAN_TRAM'
        ? `${new Intl.NumberFormat('vi-VN').format(promo.mucGiam)}%`
        : dinhDangTien(promo.mucGiam);
    const audience = promo.doiTuongApDung === 'THANH_VIEN' ? 'Thành viên' : 'Tất cả khách hàng';
    const minimum = Number(promo.giaTriDonToiThieu) > 0
        ? dinhDangTien(promo.giaTriDonToiThieu)
        : 'Không yêu cầu';
    return `<article class="promotion-card">
        <p class="promotion-value">Giảm ${esc(discount)}</p>
        <h2>${esc(promo.tenChuongTrinh)}</h2>
        <p>${esc(promo.noiDung)}</p>
        <dl>
            <div><dt>Mã ưu đãi</dt><dd><code>${esc(promo.maKhuyenMai)}</code></dd></div>
            <div><dt>Thời gian</dt><dd>${esc(dinhDangNgay(promo.ngayBatDau))} – ${esc(dinhDangNgay(promo.ngayKetThuc))}</dd></div>
            <div><dt>Phạm vi</dt><dd>${esc(ranges[promo.phamViApDung])}</dd></div>
            <div><dt>Đối tượng</dt><dd>${audience}</dd></div>
            <div><dt>Đơn tối thiểu</dt><dd>${minimum}</dd></div>
        </dl>
    </article>`;
}

async function loadOffers() {
    retry.hidden = true;
    status.textContent = 'Đang tải khuyến mãi…';
    try {
        const offers = await goiApi('/api/khuyen-mai/truc-tuyen', { chuyenKhiChuaDangNhap: false });
        if (!Array.isArray(offers)) throw new Error('Dữ liệu khuyến mãi không hợp lệ.');
        list.innerHTML = offers.map(card).join('');
        status.textContent = offers.length ? `${offers.length} khuyến mãi đang áp dụng` : 'Hiện chưa có khuyến mãi đặt vé trực tuyến.';
    } catch {
        status.textContent = 'Chưa tải được khuyến mãi. Vui lòng thử lại.';
        retry.hidden = false;
    }
}

retry.addEventListener('click', loadOffers);
loadOffers();
