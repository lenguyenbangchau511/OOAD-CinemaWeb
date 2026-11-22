/* Giao diện 20 - Chi tiết phòng và sơ đồ ghế (UC3.3). Xem thật; chế độ sửa sơ đồ là minh họa. */
import { chipTrangThai, goiApi, hienThongBao, NHAN, thamSo, thoat } from './datve-common.js';

const $ = (id) => document.getElementById(id);
const maPhong = thamSo('maPhong');
const CHU_KY = ['STANDARD', 'VIP', 'SWEETBOX', 'HONG'];
let goc = null, ghe = [], dangSua = false;

(async function () {
    if (!maPhong) { hienThongBao($('thong-bao'), 'Thiếu mã phòng chiếu', 'loi'); return; }
    try {
        goc = await goiApi(`/api/phong-chieu/${encodeURIComponent(maPhong)}/so-do`);
    } catch (loi) { hienThongBao($('thong-bao'), loi.thongBao, 'loi'); return; }
    const p = goc.phong;
    $('ten-phong').textContent = `${p.tenPhong} (${p.maPhong})`;
    $('mo-ta').innerHTML = `${NHAN.loaiPhong[p.loaiPhong] || thoat(p.loaiPhong)} · ${p.tongSoHang} hàng × ${p.tongSoCot} ghế · ${chipTrangThai(p.trangThai, NHAN.trangThaiPhong)}`;
    $('noi-dung').hidden = false; $('nut-sua').hidden = false;
    if (goc.coLichChieu) hienThongBao($('thong-bao'), 'Phòng đang có suất chiếu chưa kết thúc: ghế đang bán hoặc đang giữ không thể sửa.', 'thong-tin');
    chep(); ve();
    $('nut-sua').addEventListener('click', () => bat(true));
    $('nut-huy').addEventListener('click', () => { chep(); bat(false); });
    $('nut-luu').addEventListener('click', () => {
        bat(false);
        hienThongBao($('thong-bao'), 'Minh họa: thay đổi sơ đồ chưa được lưu vào cơ sở dữ liệu.', 'thong-tin');
        chep(); ve();
    });
    $('so-do').addEventListener('click', (e) => {
        const n = e.target.closest('.seat[data-ma]');
        if (!dangSua || !n || n.disabled) return;
        const g = ghe.find((x) => x.maGhe === n.dataset.ma);
        g.loaiMoi = CHU_KY[(CHU_KY.indexOf(g.loaiMoi) + 1) % CHU_KY.length];
        ve();
    });
})();

function loaiHienThi(g) { return g.trangThai === 'HONG' ? 'HONG' : g.loaiGhe; }
function chep() { ghe = goc.ghe.map((g) => ({ ...g, loaiMoi: loaiHienThi(g) })); }
function bat(b) {
    dangSua = b;
    $('nhom-luu').hidden = !b; $('huong-dan').hidden = !b; $('nut-sua').hidden = b;
    $('noi-dung').classList.toggle('che-do-sua', b);
    ve();
}

function ve() {
    const hang = [...new Set(ghe.map((g) => g.hang))];
    $('so-do').innerHTML = hang.map((h) => `<div class="hang-ghe"><span class="hang-nhan">${thoat(h)}</span>` +
        ghe.filter((g) => g.hang === h).sort((a, b) => a.cot - b.cot).map((g) => {
            const hong = g.loaiMoi === 'HONG';
            const lop = hong ? 'BAO_TRI' : g.loaiMoi === 'VIP' ? 'vip' : g.loaiMoi === 'SWEETBOX' ? 'sweetbox' : '';
            return `<button type="button" class="seat ${lop}" data-ma="${thoat(g.maGhe)}" ${g.biKhoa || !dangSua ? 'disabled' : ''}
                title="${thoat(g.tenGhe)}${g.biKhoa ? ' - đang có suất bán' : ''}" aria-label="Ghế ${thoat(g.tenGhe)}, ${hong ? 'hỏng' : NHAN.loaiGhe[g.loaiMoi]}">${hong ? '–' : g.cot}</button>`;
        }).join('') + '</div>').join('');
    const dem = (l) => ghe.filter((g) => g.loaiMoi === l).length;
    $('thong-ke').innerHTML = `<span class="chip trung-tinh">Tổng ${ghe.length} ghế</span><span class="chip tot">Thường ${dem('STANDARD')}</span>` +
        `<span class="chip cho">VIP ${dem('VIP')}</span><span class="chip trung-tinh">Sweetbox ${dem('SWEETBOX')}</span><span class="chip xau">Hỏng ${dem('HONG')}</span>`;
}
