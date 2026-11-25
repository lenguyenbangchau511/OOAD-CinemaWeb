import {
    anhMon, chipTrangThai, dinhDangGio, dinhDangNgay, dinhDangTien, goiApi, hienThongBao,
    homNay, layNguoiDungDatVe, NHAN, thamSo, thoat
} from './datve-common.js';

const $ = id => document.getElementById(id);
const mode = document.body.dataset.nghiepVu;
const form = $('form');
const showError = message => hienThongBao($('thong-bao'), message, 'loi');
const showResult = html => {
    $('ket-qua').innerHTML = html;
    $('ket-qua').hidden = false;
};
const labelSuat = s => `${s.tenPhim} · ${dinhDangGio(s.gioBatDau)} · ${s.tenPhong}`;
const option = (value, label) => `<option value="${thoat(value)}">${thoat(label)}</option>`;

function bindPreview(render) {
    form.addEventListener('submit', event => {
        event.preventDefault();
        hienThongBao($('thong-bao'), '');
        $('ket-qua').hidden = true;
        try {
            render();
        } catch (error) {
            showError(error.message);
        }
    });
    form.addEventListener('input', () => { $('ket-qua').hidden = true; });
}

function veSoDoQuay(seats, data) {
    const theoHang = new Map();
    for (const ghe of data.ghe) {
        if (!theoHang.has(ghe.hang)) theoHang.set(ghe.hang, []);
        theoHang.get(ghe.hang).push(ghe);
    }
    const kyHieu = { DANG_GIU: '…', DA_DAT: '✕', BAO_TRI: '–' };
    const tenTrangThai = { TRONG: 'Trống', DANG_GIU: 'Đang được giữ', DA_DAT: 'Đã bán', BAO_TRI: 'Bảo trì' };
    seats.innerHTML = [...theoHang].map(([hang, ghe]) => `
        <div class="hang-ghe" role="group" aria-label="Hàng ${thoat(hang)}">
            <span class="hang-nhan" aria-hidden="true">${thoat(hang)}</span>
            ${ghe.map(g => {
                const loai = g.loaiGhe === 'VIP' ? 'vip' : g.loaiGhe === 'SWEETBOX' ? 'sweetbox' : '';
                const nhan = `Ghế ${g.tenGhe}, ${NHAN.loaiGhe[g.loaiGhe] || g.loaiGhe}, ${dinhDangTien(g.giaVe)}, ${tenTrangThai[g.trangThai]}`;
                const chonDuoc = data.suat.conBanVe && !data.thongBao && g.trangThai === 'TRONG';
                return `<button type="button" class="seat ${loai} ${thoat(g.trangThai)}" data-ghe="${thoat(g.maGheSuat)}"
                    aria-label="${thoat(nhan)}" aria-pressed="false" ${chonDuoc ? '' : 'disabled'}>${kyHieu[g.trangThai] || thoat(g.tenGhe)}</button>`;
            }).join('')}
        </div>`).join('') || '<p>Suất chiếu chưa có sơ đồ ghế.</p>';
}

async function openPicker({ multiple = false, update = () => {} } = {}) {
    const date = $('ngay');
    const select = $('suat-moi');
    const seats = $('ghe-moi');
    date.value = date.min = homNay();
    let list = [];
    let available = [];
    let request = 0;
    let soGheToiDa = 0;
    const gheDaChon = new Set();
    const selection = () => multiple
        ? available.filter(g => gheDaChon.has(g.maGheSuat))
        : [...seats.querySelectorAll('input:checked')].map(input => available[Number(input.value)]);
    const loadSeats = async () => {
        const id = ++request;
        available = [];
        gheDaChon.clear();
        seats.textContent = select.value ? 'Đang tải sơ đồ ghế…' : 'Chọn suất để xem ghế.';
        update(selection());
        if (!select.value) return;
        try {
            const data = await goiApi('/api/suat-chieu/' + encodeURIComponent(select.value) + '/so-do-ghe');
            if (id !== request) return;
            available = data.suat.conBanVe ? data.ghe.filter(g => g.trangThai === 'TRONG') : [];
            if (multiple) {
                soGheToiDa = data.soGheToiDa ?? available.length;
                veSoDoQuay(seats, data);
                if (data.thongBao) showError(data.thongBao);
                return;
            }
            seats.innerHTML = '<legend>Ghế trống</legend>' +
                (available.length ? `<div class="chau-actions">${available.map((g, index) =>
                    `<label><input type="${multiple ? 'checkbox' : 'radio'}" name="ghe" value="${index}"> ${thoat(g.tenGhe)} · ${dinhDangTien(g.giaVe)}</label>`).join('')}</div>`
                    : '<p>Suất chiếu không còn ghế trống.</p>');
        } catch (error) {
            if (id === request) {
                seats.textContent = 'Chưa tải được sơ đồ ghế.';
                showError(error.message);
            }
        }
    };
    const loadShows = async () => {
        const id = ++request;
        list = [];
        available = [];
        select.innerHTML = '<option value="">Đang tải suất…</option>';
        gheDaChon.clear();
        seats.innerHTML = multiple ? '<p>Chọn suất để xem ghế.</p>'
            : '<legend>Ghế trống</legend><p>Chọn suất để xem ghế.</p>';
        update(selection());
        if (!date.value) return;
        try {
            const q = new URLSearchParams({ ngay: date.value });
            const shows = await goiApi('/api/suat-chieu/dang-ban?' + q);
            if (id !== request) return;
            list = shows;
            select.innerHTML = option('', list.length ? 'Chọn suất' : 'Không có suất đang bán') +
                list.map(s => option(s.maSuat, labelSuat(s))).join('');
        } catch (error) {
            if (id === request) {
                select.innerHTML = option('', 'Chưa tải được suất');
                showError(error.message);
            }
        }
    };
    date.addEventListener('change', loadShows);
    select.addEventListener('change', loadSeats);
    if (multiple) {
        seats.addEventListener('click', event => {
            const nut = event.target.closest('button[data-ghe]');
            if (!nut || nut.disabled) return;
            const ma = nut.dataset.ghe;
            const daChon = gheDaChon.has(ma);
            if (!daChon && gheDaChon.size >= soGheToiDa) {
                showError(`Chỉ được chọn tối đa ${soGheToiDa} ghế.`);
                return;
            }
            hienThongBao($('thong-bao'), '');
            if (daChon) gheDaChon.delete(ma); else gheDaChon.add(ma);
            nut.classList.toggle('CUA_TOI', !daChon);
            nut.setAttribute('aria-pressed', String(!daChon));
            nut.textContent = daChon ? available.find(g => g.maGheSuat === ma).tenGhe : '✓';
            update(selection());
        });
    } else {
        seats.addEventListener('change', () => update(selection()));
    }
    await loadShows();
    return () => ({ suat: list.find(s => s.maSuat === select.value), ghe: selection() });
}

async function banVe() {
    let mon = [];
    const tomTatMon = () => [...$('mon').querySelectorAll('input')].map((input, index) => ({
        ...mon[index], soLuong: Number(input.value)
    })).filter(item => item.soLuong > 0);
    const total = ghe => ghe.reduce((sum, g) => sum + Number(g.giaVe), 0) +
        tomTatMon().reduce((sum, item) => sum + item.soLuong * Number(item.gia), 0);
    const picker = await openPicker({ multiple: true, update: ghe => {
        $('tong').textContent = dinhDangTien(total(ghe));
        $('ghe-da-chon').innerHTML = ghe.map(g =>
            `<span class="ghe-chip">${thoat(g.tenGhe)} · ${dinhDangTien(g.giaVe)}</span>`).join('');
        $('ket-qua').hidden = true;
    } });
    bindPreview(() => {
        const { suat, ghe } = picker();
        if (!suat || !ghe.length) throw new Error('Vui lòng chọn suất và ít nhất một ghế.');
        const data = new FormData(form);
        const monDaChon = tomTatMon();
        showResult(`
            <h2 id="quay-preview-title" tabindex="-1">Đơn tại quầy <span class="quay-preview-badge">Xem trước</span></h2>
            <dl class="quay-preview-info">
                <div><dt>Suất chiếu</dt><dd>${thoat(labelSuat(suat))} · ${dinhDangNgay($('ngay').value)}</dd></div>
                <div><dt>Khách hàng</dt><dd>${thoat(data.get('khach').trim() || 'Khách lẻ')}</dd></div>
                <div><dt>Ghế đã chọn</dt><dd class="ghe-chon">${ghe.map(g => `<span class="ghe-chip">${thoat(g.tenGhe)}</span>`).join('')}</dd></div>
                <div><dt>Thanh toán</dt><dd>${thoat(data.get('phuongThuc'))}</dd></div>
            </dl>
            <h3>Bắp nước và combo</h3>
            ${monDaChon.length ? `<ul class="summary-snacks">${monDaChon.map(item =>
                `<li><span>${thoat(item.ten)} × ${item.soLuong}</span><strong>${dinhDangTien(item.soLuong * Number(item.gia))}</strong></li>`
            ).join('')}</ul>` : '<p class="muted">Không có bắp nước hoặc combo.</p>'}
            <div class="quay-summary">
                <div><span>Tổng tiền</span><strong class="quay-preview-total">${dinhDangTien(total(ghe))}</strong></div>
                <button class="button primary" type="button">Xác nhận bán vé</button>
            </div>`);
        $('quay-preview-title').focus();
    });
    try {
        const nhom = { COMBO: ['Combo', '🍿🥤'], DO_AN: ['Đồ ăn', '🍿'], THUC_UONG: ['Thức uống', '🥤'] };
        mon = (await goiApi('/api/don-dat-ve/danh-muc')).filter(item => Object.hasOwn(nhom, item.loai));
        $('mon').innerHTML = mon.length ? `<div class="snack-grid">${mon.map(item => {
            const [tenNhom, icon] = nhom[item.loai];
            const anh = anhMon(item);
            const ton = Math.max(0, Number(item.khaDung) || 0);
            return `<article class="snack-card${ton ? '' : ' is-soldout'}" data-loai="${item.loai}">
                <div class="snack-photo"><span class="snack-emoji" aria-hidden="true">${icon}</span>
                    ${anh ? `<img src="${thoat(anh)}" alt="" loading="lazy">` : ''}</div>
                <div class="snack-body">
                    <div class="snack-meta"><span class="snack-tag">${tenNhom}</span>
                        <span class="snack-stock ${ton ? '' : 'out'}">${ton ? `Còn ${ton}` : 'Hết hàng'}</span></div>
                    <h3>${thoat(item.ten)}</h3>
                    ${item.moTa ? `<p class="snack-desc">${thoat(item.moTa)}</p>` : ''}
                    <div class="snack-footer"><strong class="snack-price">${dinhDangTien(item.gia)}</strong>
                        <div class="qty-stepper">
                            <button type="button" data-step="-1" aria-label="Giảm ${thoat(item.ten)}" disabled>−</button>
                            <input type="number" min="0" max="${ton}" step="1" value="0" aria-label="Số lượng ${thoat(item.ten)}" ${ton ? '' : 'disabled'}>
                            <button type="button" data-step="1" aria-label="Tăng ${thoat(item.ten)}" ${ton ? '' : 'disabled'}>+</button>
                        </div>
                    </div>
                </div>
            </article>`;
        }).join('')}</div>` : '<p>Không có món đang bán.</p>';
        $('mon').querySelectorAll('img').forEach(img => {
            img.addEventListener('error', () => img.remove(), { once: true });
        });
        $('mon').addEventListener('click', event => {
            const nut = event.target.closest('[data-step]');
            if (!nut || nut.disabled) return;
            const input = nut.closest('.qty-stepper').querySelector('input');
            input.value = Number(input.value) + Number(nut.dataset.step);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        $('mon').addEventListener('input', event => {
            const input = event.target.closest('.qty-stepper input');
            if (!input) return;
            const max = Number(input.max);
            const soLuong = Math.min(max, Math.max(0, Math.floor(Number(input.value) || 0)));
            if (input.value !== '') input.value = soLuong;
            const card = input.closest('.snack-card');
            card.classList.toggle('is-selected', soLuong > 0);
            card.querySelector('[data-step="-1"]').disabled = soLuong <= 0;
            card.querySelector('[data-step="1"]').disabled = soLuong >= max;
            $('tong').textContent = dinhDangTien(total(picker().ghe));
        });
        const nutLoc = $('loc-mon').querySelectorAll('button');
        nutLoc.forEach(nut => nut.addEventListener('click', () => {
            nutLoc.forEach(n => n.setAttribute('aria-pressed', String(n === nut)));
            $('mon').querySelectorAll('.snack-card').forEach(card => {
                card.hidden = Boolean(nut.dataset.loai && nut.dataset.loai !== card.dataset.loai);
            });
        }));
    } catch {
        $('mon').textContent = 'Chưa tải được danh mục bắp nước.';
    }
}

async function getSuat() {
    const ma = thamSo('maSuat');
    if (!ma) throw new Error('Hãy chọn suất chiếu từ danh sách.');
    const qs = new URLSearchParams();
    if (thamSo('ngay')) qs.set('ngay', thamSo('ngay'));
    const ds = await goiApi('/api/suat-chieu?' + qs);
    const suat = ds.find(s => s.maSuat === ma);
    if (!suat) throw new Error('Không tìm thấy suất chiếu.');
    return suat;
}

async function suatForm() {
    const data = await goiApi('/api/suat-chieu/bo-loc');
    form.elements.maPhim.innerHTML = option('', 'Chọn phim') + data.phim.map(p => option(p.maPhim, p.tenPhim)).join('');
    form.elements.maPhong.innerHTML = option('', 'Chọn phòng') + data.phong.map(p => option(p.maPhong, p.tenPhong)).join('');
    form.elements.ngayChieu.value = homNay();
    if (thamSo('maSuat')) {
        const suat = await getSuat();
        for (const name of ['maPhim', 'maPhong', 'ngayChieu', 'gioBatDau', 'gioKetThuc']) {
            form.elements[name].value = name.startsWith('gio') ? suat[name].slice(0, 5) : suat[name];
        }
        document.querySelector('h1').textContent = 'Sửa suất chiếu ' + suat.maSuat;
    }
    bindPreview(() => {
        const data = Object.fromEntries(new FormData(form));
        if (data.gioKetThuc <= data.gioBatDau) throw new Error('Giờ kết thúc phải sau giờ bắt đầu.');
        const phim = form.elements.maPhim.selectedOptions[0].textContent;
        const phong = form.elements.maPhong.selectedOptions[0].textContent;
        showResult(`<h2>Suất chiếu · xem trước</h2><p>${thoat(phim)} · ${thoat(phong)}</p>
            <p>${thoat(dinhDangNgay(data.ngayChieu))} · ${thoat(data.gioBatDau)} – ${thoat(data.gioKetThuc)}</p>`);
    });
}

async function suatChiTiet() {
    const s = await getSuat();
    const query = new URLSearchParams({ maSuat: s.maSuat, ngay: s.ngayChieu });
    const coTheYeuCauHuy = ['SAP_CHIEU', 'DANG_CHIEU'].includes(s.trangThai);
    $('chi-tiet').innerHTML = `<h2>${thoat(s.tenPhim)} · ${thoat(s.maSuat)}</h2>
        <p>${thoat(s.tenPhong)} · ${dinhDangNgay(s.ngayChieu)} · ${dinhDangGio(s.gioBatDau)} – ${dinhDangGio(s.gioKetThuc)}</p>
        <p>${chipTrangThai(s.trangThai, NHAN.trangThaiSuat)}</p>
        <p>${s.soGheDaBan} ghế đã bán · ${s.soGheDangGiu} đang giữ · ${s.soGheTrong} trống</p>
        ${coTheYeuCauHuy ? `<a class="button secondary" href="suat-chieu-form.html?${query}">Sửa suất chiếu</a>` : ''}`;
    form.hidden = !coTheYeuCauHuy;
    bindPreview(() => {
        showResult(s.soGheDaBan > 0
            ? `<h2>Còn vé cần xử lý</h2><p>Suất có ${s.soGheDaBan} ghế đã bán. Cần xử lý các vé liên quan trước khi hủy.</p>`
            : `<h2>Xem trước yêu cầu hủy</h2><p>Lý do: ${thoat(form.elements.lyDo.value.trim())}</p><p>Suất chiếu chưa bị hủy.</p>`);
    });
}

async function xuLyVe() {
    const maDon = thamSo('maDonHang');
    if (!maDon) throw new Error('Chọn một đơn đã thanh toán từ trang Tra cứu vé.');
    const don = await goiApi('/api/dat-ve/ket-qua/' + encodeURIComponent(maDon));
    const ve = don.trangThaiDon === 'DA_THANH_TOAN'
        ? don.dsVe.filter(v => v.trangThai === 'CHUA_SU_DUNG') : [];
    if (!ve.length) throw new Error('Đơn không có vé ở trạng thái chưa sử dụng.');
    $('chi-tiet').innerHTML = `<h2>Đơn ${thoat(don.maDonHang)}</h2>
        <p>${thoat(don.tenPhim)} · ${dinhDangNgay(don.ngayChieu)} · ${dinhDangGio(don.gioBatDau)}</p>`;
    $('ve').innerHTML = option('', 'Chọn vé') +
        ve.map(v => option(v.maVe, `${v.maVe} · Ghế ${v.tenGhe} · ${dinhDangTien(v.donGia)}`)).join('');
    const picker = mode === 'doi' ? await openPicker() : null;
    form.hidden = false;
    bindPreview(() => {
        const chon = ve.find(v => v.maVe === $('ve').value);
        if (!chon) throw new Error('Vui lòng chọn vé.');
        if (mode === 'doi') {
            const { suat, ghe } = picker();
            if (!suat || !ghe.length) throw new Error('Vui lòng chọn suất và ghế mới.');
            const chenhLech = Number(ghe[0].giaVe) - Number(chon.donGia);
            showResult(`<h2>Xem trước đổi vé</h2><p>Vé ${thoat(chon.maVe)} → ${thoat(labelSuat(suat))} · Ghế ${thoat(ghe[0].tenGhe)}</p>
                <p>Chênh lệch giá vé: <strong>${dinhDangTien(chenhLech)}</strong></p>`);
        } else {
            const lyDo = form.elements.lyDo.value.trim();
            if (!lyDo) throw new Error('Vui lòng nhập lý do hủy.');
            showResult(`<h2>Xem trước yêu cầu hoàn tiền</h2><p>Vé ${thoat(chon.maVe)} · Ghế ${thoat(chon.tenGhe)}</p>
                <p>Lý do: ${thoat(lyDo)}</p><p>Giá gốc của vé: <strong>${dinhDangTien(chon.donGia)}</strong></p>
                <p>Số tiền hoàn cần được xác định theo chính sách của rạp.</p>`);
        }
    });
}

async function phimNoiBo() {
    const phim = await goiApi('/api/quan-ly/phim');
    $('phim').innerHTML = option('', 'Chọn phim') + phim.map(p => option(p.maPhim, p.tenPhim)).join('');
    let request = 0;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const id = ++request;
        $('ket-qua').hidden = true;
        hienThongBao($('thong-bao'), '');
        try {
            const p = await goiApi('/api/quan-ly/phim/' + encodeURIComponent($('phim').value));
            if (id !== request) return;
            const tinhTrang = { DANG_CHIEU: 'Đang chiếu', SAP_CHIEU: 'Sắp chiếu', NGUNG_CHIEU: 'Ngừng chiếu' };
            showResult(`<h2>${thoat(p.tenPhim)}</h2>
                ${p.poster ? `<img alt="Poster ${thoat(p.tenPhim)}" src="images/${encodeURIComponent(p.poster)}">` : ''}
                <p>${thoat(p.maPhim)} · ${thoat(tinhTrang[p.trangThai])} · ${thoat(p.gioiHanDoTuoi)}</p>
                <p>${thoat(p.theLoai)} · ${thoat(p.thoiLuong)} phút · Khởi chiếu ${dinhDangNgay(p.ngayKhoiChieu)}</p>
                <p>Đạo diễn: ${thoat(p.daoDien)} · Diễn viên: ${thoat(p.dienVien)}</p>
                <p>${thoat(p.noiDung)}</p>`);
        } catch (error) {
            if (id === request) showError(error.message);
        }
    });
}

try {
    const role = (await layNguoiDungDatVe())?.vaiTro;
    const allowed = ['huy', 'phim'].includes(mode) ? ['NHAN_VIEN', 'QUAN_LY']
        : ['ban', 'doi'].includes(mode) ? ['NHAN_VIEN'] : ['QUAN_LY'];
    if (!allowed.includes(role)) {
        form.hidden = true;
        if ($('chi-tiet')) $('chi-tiet').hidden = true;
        throw new Error('Vui lòng đăng nhập bằng tài khoản có quyền sử dụng màn này.');
    }
    await ({ ban: banVe, 'suat-form': suatForm, 'suat-chi-tiet': suatChiTiet, doi: xuLyVe, huy: xuLyVe, phim: phimNoiBo })[mode]();
} catch (error) {
    form.hidden = true;
    if ($('chi-tiet')?.textContent === 'Đang tải suất chiếu…') $('chi-tiet').hidden = true;
    showError(error.message);
}
