import { dinhDangTien, goiApi, hienThongBao, layPhienDatVe, luuPhienDatVe, taoDongHoDemNguoc, thoat } from './datve-common.js';

const phien = layPhienDatVe();
const danhSach = document.querySelector('#mon');
const thongBao = document.querySelector('#thong-bao');
const tiep = document.querySelector('#tiep');
const boQua = document.querySelector('#bo-qua');
const quayLai = document.querySelector('#quay-lai');
quayLai.href = phien.maSuat ? `chon-ghe.html?maSuat=${encodeURIComponent(phien.maSuat)}` : './';

try {
    if (!phien.maPhienGiu) throw new Error('Vui lòng chọn và giữ ghế trước.');
    const [ghe, mon] = await Promise.all([
        goiApi(`/api/giu-ghe/${encodeURIComponent(phien.maPhienGiu)}`), goiApi('/api/don-dat-ve/danh-muc')
    ]);
    if (!ghe.soGiayConLai) throw new Error('Phiên giữ ghế đã hết hạn.');
    let hetHan = false;
    const dongHo = taoDongHoDemNguoc(document.querySelector('#han'), () => {
        hetHan = true;
        tiep.disabled = boQua.disabled = true;
        hienThongBao(thongBao, 'Hết thời gian giữ ghế. Vui lòng chọn lại ghế.', 'loi');
    });
    document.querySelector('#phien-info').textContent = `Phiên ${phien.maPhienGiu} · Suất ${ghe.maSuat || phien.maSuat}`;
    const danhMuc = { DO_AN: 'Đồ ăn', THUC_UONG: 'Thức uống', COMBO: 'Combo' };
    const theMon = m => {
        const daChon = phien.dichVu?.find(d => d.ma === m.ma)?.soLuong || 0;
        return `<article class="chau-card">${m.hinhAnh ? `<img src="${thoat(m.hinhAnh)}" alt="" loading="lazy">` : ''}
            <h2>${thoat(m.ten)}</h2><p>${thoat(m.moTa)}</p><p>${dinhDangTien(m.gia)}</p>
            <label>Số lượng <input data-ma="${thoat(m.ma)}" type="number" min="0" max="${m.khaDung}" step="1"
                value="${Math.min(daChon, m.khaDung)}" ${m.khaDung ? '' : 'disabled'}></label>
            ${m.khaDung ? '' : '<p>Hết hàng</p>'}</article>`;
    };
    danhSach.innerHTML = Object.entries(danhMuc).map(([loai, ten]) => {
        const nhom = mon.filter(m => m.loai === loai);
        return nhom.length ? `<section data-nhom="${loai}"><h2>${ten} <small>${nhom.length} món</small></h2>
            <div class="chau-grid">${nhom.map(theMon).join('')}</div></section>` : '';
    }).join('') || '<p>Hiện chưa có món đang bán.</p>';
    const nutLoc = [...document.querySelectorAll('.mc-category button')];
    for (const nut of nutLoc) nut.addEventListener('click', () => {
        nutLoc.forEach(n => n.setAttribute('aria-pressed', String(n === nut)));
        danhSach.querySelectorAll('[data-nhom]').forEach(nhom => {
            nhom.hidden = Boolean(nut.dataset.loai && nut.dataset.loai !== nhom.dataset.nhom);
        });
    });
    const giaTheoMa = new Map(mon.map(m => [m.ma, m]));
    function hienTong() {
        const chon = [...danhSach.querySelectorAll('input:not(:disabled)')]
            .filter(input => input.validity.valid && Number(input.value) > 0);
        const tienMon = chon.reduce((sum, input) => sum + Number(input.value) * Number(giaTheoMa.get(input.dataset.ma).gia), 0);
        document.querySelector('#tom-tat').innerHTML = `<p>Ghế: ${ghe.dsGhe.map(g => thoat(g.tenGhe)).join(', ')}</p>
            <ul>${chon.map(input => `<li>${thoat(giaTheoMa.get(input.dataset.ma).ten)} × ${Number(input.value)}</li>`).join('')}</ul>
            <dl class="mc-money"><div><dt>Tiền vé</dt><dd>${dinhDangTien(ghe.tamTinh)}</dd></div>
            <div><dt>Tiền món</dt><dd>${dinhDangTien(tienMon)}</dd></div>
            <div><dt>Tổng tạm tính</dt><dd>${dinhDangTien(Number(ghe.tamTinh) + tienMon)}</dd></div></dl>`;
    }
    danhSach.addEventListener('input', hienTong);
    hienTong();
    tiep.disabled = boQua.disabled = false;
    dongHo.bat(ghe.soGiayConLai);
    function luuVaTiep(dichVu) {
        luuPhienDatVe({ dichVu });
        location.href = 'xac-nhan-don.html';
    }
    boQua.addEventListener('click', () => luuVaTiep([]));
    tiep.addEventListener('click', async () => {
        const inputs = [...danhSach.querySelectorAll('input:not(:disabled)')];
        if (!inputs.every(input => input.reportValidity())) return;
        const dichVu = inputs.filter(input => Number(input.value) > 0)
            .map(input => ({ ma: input.dataset.ma, soLuong: Number(input.value) }));
        tiep.disabled = boQua.disabled = true;
        try {
            await goiApi('/api/don-dat-ve/tam-tinh', { method: 'POST', body: { maPhienGiu: phien.maPhienGiu, dichVu } });
            if (!hetHan) luuVaTiep(dichVu);
        } catch (loi) {
            hienThongBao(thongBao, loi.message, 'loi');
            tiep.disabled = boQua.disabled = hetHan;
        }
    });
} catch (loi) {
    hienThongBao(thongBao, loi.message, 'loi');
}
