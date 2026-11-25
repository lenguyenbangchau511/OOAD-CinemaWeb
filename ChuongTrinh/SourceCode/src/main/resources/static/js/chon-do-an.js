import {
    anhMon, dinhDangGio, dinhDangNgay, duongDanChonSuat, dinhDangTien, goiApi, hienThongBao,
    layPhienDatVe, luuPhienDatVe, taoDongHoDemNguoc, thoat
} from './datve-common.js';

window.addEventListener('pageshow', e => {
    // Khôi phục lựa chọn mới nhất và kiểm tra lại phiên khi trình duyệt dùng bộ nhớ trang.
    if (e.persisted) location.reload();
});

const phien = layPhienDatVe();
if (phien.daXacNhan && phien.maDonHang) {
    location.replace(`thanh-toan.html?maDonHang=${encodeURIComponent(phien.maDonHang)}`);
}

const danhSach = document.querySelector('#mon');
const thongBao = document.querySelector('#thong-bao');
const tiep = document.querySelector('#tiep');
const boQua = document.querySelector('#bo-qua');
const quayLai = document.querySelector('#quay-lai');
const buocChonSuat = document.querySelector('#buoc-chon-suat');
const buocChonGhe = document.querySelector('#buoc-chon-ghe');

const gheHref = phien.maSuat ? `chon-ghe.html?maSuat=${encodeURIComponent(phien.maSuat)}` : './';
const suatHrefMacDinh = phien.maPhim ? `chi-tiet-phim.html?maPhim=${encodeURIComponent(phien.maPhim)}#lich-chieu` : './';
quayLai.href = gheHref;
buocChonGhe.href = gheHref;
buocChonSuat.href = suatHrefMacDinh;

const danhMuc = {
    COMBO: { ten: 'Combo tiết kiệm', nhan: 'Combo', bieuTuong: '🍿🥤' },
    DO_AN: { ten: 'Đồ ăn vặt', nhan: 'Đồ ăn', bieuTuong: '🍿' },
    THUC_UONG: { ten: 'Thức uống mát lạnh', nhan: 'Thức uống', bieuTuong: '🥤' }
};

if (!(phien.daXacNhan && phien.maDonHang)) {
    khoiTao();
}

async function khoiTao() {
    try {
        if (!phien.maPhienGiu) {
            throw new Error('Vui lòng chọn và giữ ghế trước.');
        }
        const [ghe, mon] = await Promise.all([
            goiApi(`/api/giu-ghe/${encodeURIComponent(phien.maPhienGiu)}`),
            goiApi('/api/don-dat-ve/danh-muc')
        ]);
        if (!ghe.soGiayConLai || !ghe.dsGhe.length) {
            throw new Error('Phiên giữ ghế đã hết hạn.');
        }

        const maSuat = ghe.maSuat || phien.maSuat;
        const linkGhe = maSuat ? `chon-ghe.html?maSuat=${encodeURIComponent(maSuat)}` : './';
        quayLai.href = linkGhe;
        buocChonGhe.href = linkGhe;

        let thongTinSuat = phien.tenPhim || `Suất ${maSuat}`;
        if (maSuat) {
            try {
                const sd = await goiApi(`/api/suat-chieu/${encodeURIComponent(maSuat)}/so-do-ghe`, { chuyenKhiChuaDangNhap: false });
                if (sd?.suat) {
                    const s = sd.suat;
                    thongTinSuat = `${s.tenPhim} · ${dinhDangGio(s.gioBatDau)} · ${dinhDangNgay(s.ngayChieu)} · ${s.tenPhong}`;
                    if (s.maPhim) {
                        buocChonSuat.href = duongDanChonSuat(s.maPhim, s.ngayChieu);
                    }
                    luuPhienDatVe({ maSuat, maPhim: s.maPhim || phien.maPhim, tenPhim: s.tenPhim });
                }
            } catch {
                // Giữ thông tin cơ bản nếu không tải được chi tiết suất chiếu.
            }
        }
        document.querySelector('#phien-info').textContent = thongTinSuat;

        let hetHan = false;
        const dongHo = taoDongHoDemNguoc(document.querySelector('#han'), () => {
            hetHan = true;
            tiep.disabled = boQua.disabled = true;
            hienThongBao(thongBao, 'Hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.', 'loi');
        });

        const nutLoc = [...document.querySelectorAll('.mc-category button')];
        for (const nut of nutLoc) {
            const loai = nut.dataset.loai;
            const soMon = loai ? mon.filter((m) => m.loai === loai).length : mon.length;
            nut.textContent = `${nut.textContent} (${soMon})`;
        }

        const theMon = (m) => {
            const info = danhMuc[m.loai] || { nhan: m.loai, bieuTuong: '🍿' };
            const img = anhMon(m);
            const khaDung = Math.max(0, Number(m.khaDung) || 0);
            const daChon = Math.min(phien.dichVu?.find((d) => d.ma === m.ma)?.soLuong || 0, khaDung);
            const hetHang = khaDung <= 0;
            return `<article class="snack-card${daChon > 0 ? ' is-selected' : ''}${hetHang ? ' is-soldout' : ''}" data-card="${thoat(m.ma)}">
                <div class="snack-photo">
                    <span class="snack-emoji" aria-hidden="true">${info.bieuTuong}</span>
                    ${img ? `<img src="${thoat(img)}" alt="${thoat(m.ten)}" loading="lazy" onerror="this.remove()">` : ''}
                    <span class="snack-badge-qty" ${daChon > 0 ? '' : 'hidden'}>Đã chọn ×${daChon}</span>
                </div>
                <div class="snack-body">
                    <div class="snack-meta">
                        <span class="snack-tag">${thoat(info.nhan)}</span>
                        ${hetHang ? '<span class="snack-stock out">Hết hàng</span>' : ''}
                    </div>
                    <h3>${thoat(m.ten)}</h3>
                    <p class="snack-desc">${thoat(m.moTa)}</p>
                    <div class="snack-footer">
                        <span class="snack-price">${dinhDangTien(m.gia)}</span>
                        <div class="qty-stepper" aria-label="Chọn số lượng ${thoat(m.ten)}">
                            <button type="button" data-step="-1" data-for="${thoat(m.ma)}" aria-label="Giảm ${thoat(m.ten)}" ${hetHang || daChon <= 0 ? 'disabled' : ''}>−</button>
                            <input data-ma="${thoat(m.ma)}" type="number" min="0" max="${khaDung}" step="1"
                                value="${daChon}" aria-label="Số lượng ${thoat(m.ten)}" ${hetHang ? 'disabled' : ''}>
                            <button type="button" data-step="1" data-for="${thoat(m.ma)}" aria-label="Tăng ${thoat(m.ten)}" ${hetHang || daChon >= khaDung ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                </div>
            </article>`;
        };

        danhSach.innerHTML = Object.entries(danhMuc).map(([loai, info]) => {
            const nhom = mon.filter((m) => m.loai === loai);
            return nhom.length
                ? `<section data-nhom="${loai}"><h2>${info.ten} <small>${nhom.length} món</small></h2>
                    <div class="snack-grid">${nhom.map(theMon).join('')}</div></section>`
                : '';
        }).join('') || '<p>Hiện chưa có món đang bán.</p>';

        for (const nut of nutLoc) {
            nut.addEventListener('click', () => {
                nutLoc.forEach((n) => n.setAttribute('aria-pressed', String(n === nut)));
                danhSach.querySelectorAll('[data-nhom]').forEach((nhom) => {
                    nhom.hidden = Boolean(nut.dataset.loai && nut.dataset.loai !== nhom.dataset.nhom);
                });
            });
        }

        const giaTheoMa = new Map(mon.map((m) => [m.ma, m]));

        function docDichVu() {
            return [...danhSach.querySelectorAll('input[data-ma]:not(:disabled)')]
                .map((input) => ({ ma: input.dataset.ma, soLuong: Math.max(0, Math.floor(Number(input.value) || 0)) }))
                .filter((d) => d.soLuong > 0);
        }

        function dongBoThe(input) {
            const max = Number(input.max) || 0;
            let val = Math.floor(Number(input.value) || 0);
            if (val < 0) val = 0;
            if (val > max) val = max;
            input.value = String(val);

            const card = input.closest('.snack-card');
            if (!card) return;
            card.classList.toggle('is-selected', val > 0);
            const badge = card.querySelector('.snack-badge-qty');
            if (badge) {
                badge.hidden = val <= 0;
                badge.textContent = `Đã chọn ×${val}`;
            }
            const dec = card.querySelector('button[data-step="-1"]');
            const inc = card.querySelector('button[data-step="1"]');
            if (dec) dec.disabled = input.disabled || val <= 0;
            if (inc) inc.disabled = input.disabled || val >= max;
        }

        function hienTong(luu = false) {
            const dichVu = docDichVu();
            if (luu) luuPhienDatVe({ dichVu });
            const tienMon = dichVu.reduce((sum, d) => sum + d.soLuong * Number(giaTheoMa.get(d.ma)?.gia || 0), 0);
            const gheChips = ghe.dsGhe.map((g) => `<span class="ghe-chip">${thoat(g.tenGhe)}</span>`).join('');
            const monHtml = dichVu.length
                ? `<ul class="summary-snacks">${dichVu.map((d) => {
                    const item = giaTheoMa.get(d.ma);
                    const thanhTien = d.soLuong * Number(item.gia);
                    return `<li><span>${thoat(item.ten)} <strong>× ${d.soLuong}</strong></span><span>${dinhDangTien(thanhTien)}</span></li>`;
                }).join('')}</ul>`
                : '<p class="muted" style="margin:10px 0">Chưa chọn bắp nước (có thể bỏ qua).</p>';

            document.querySelector('#tom-tat').innerHTML = `
                <div class="ghe-chon" aria-label="Ghế đã chọn">${gheChips}</div>
                ${monHtml}
                <dl class="mc-money">
                    <div><dt>Tiền vé</dt><dd>${dinhDangTien(ghe.tamTinh)}</dd></div>
                    <div><dt>Bắp nước &amp; combo</dt><dd>${dinhDangTien(tienMon)}</dd></div>
                    <div><dt>Tổng tạm tính</dt><dd>${dinhDangTien(Number(ghe.tamTinh) + tienMon)}</dd></div>
                </dl>`;
        }

        danhSach.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-step]');
            if (!btn) return;
            const input = danhSach.querySelector(`input[data-ma="${CSS.escape(btn.dataset.for)}"]`);
            if (!input || input.disabled) return;
            input.value = String((Number(input.value) || 0) + Number(btn.dataset.step));
            dongBoThe(input);
            hienTong(true);
        });

        danhSach.addEventListener('input', (e) => {
            const input = e.target.closest('input[data-ma]');
            if (!input) return;
            dongBoThe(input);
            hienTong(true);
        });

        const conChon = docDichVu();
        const daDieuChinh = (phien.dichVu || []).some(muc =>
            !conChon.some(mon => mon.ma === muc.ma && mon.soLuong === muc.soLuong));
        if (daDieuChinh) {
            hienThongBao(thongBao, 'Thực đơn hoặc tồn kho đã thay đổi. Vui lòng kiểm tra lại số lượng món.', 'thong-tin');
        }
        hienTong(true);
        tiep.disabled = boQua.disabled = false;
        dongHo.bat(ghe.soGiayConLai);

        function luuVaTiep(dichVu) {
            luuPhienDatVe({ dichVu });
            location.href = 'xac-nhan-don.html';
        }

        boQua.addEventListener('click', () => kiemTraVaTiep([]));
        tiep.addEventListener('click', () => {
            const inputs = [...danhSach.querySelectorAll('input[data-ma]:not(:disabled)')];
            if (!inputs.every((input) => input.reportValidity())) return;
            kiemTraVaTiep(docDichVu());
        });

        async function kiemTraVaTiep(dichVu) {
            tiep.disabled = boQua.disabled = true;
            hienThongBao(thongBao, '');
            try {
                await goiApi('/api/don-dat-ve/tam-tinh', {
                    method: 'POST',
                    body: { maPhienGiu: phien.maPhienGiu, dichVu }
                });
                if (!hetHan) luuVaTiep(dichVu);
            } catch (loi) {
                hienThongBao(thongBao, loi.thongBao || loi.message, 'loi');
                tiep.disabled = boQua.disabled = hetHan;
            }
        }
    } catch (loi) {
        danhSach.textContent = '';
        hienThongBao(thongBao, loi.thongBao || loi.message, 'loi');
    }
}
