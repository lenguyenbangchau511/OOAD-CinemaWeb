import { goiApi, hienThongBao, thamSo } from './datve-common.js';

const form = document.querySelector('#form');
const thongBao = document.querySelector('#thong-bao');
const ma = thamSo('maPhim');
const chiXem = thamSo('xem') === '1';
const apiPhim = '/api/quan-ly/phim' + (ma ? '/' + encodeURIComponent(ma) : '');
const truong = [
    ['maPhim', 'Mã phim', 'text', 'required maxlength="10"'],
    ['tenPhim', 'Tên phim', 'text', 'required maxlength="100"'],
    ['theLoai', 'Thể loại', 'text', 'required maxlength="50"'],
    ['thoiLuong', 'Thời lượng (phút)', 'number', 'required min="1" step="1"'],
    ['daoDien', 'Đạo diễn', 'text', 'maxlength="50"'],
    ['dienVien', 'Diễn viên', 'text', 'maxlength="200"'],
    ['ngayKhoiChieu', 'Ngày khởi chiếu', 'date', 'required'],
    ['quocGia', 'Quốc gia', 'text', 'maxlength="50"'],
    ['poster', 'Tên file poster', 'text', 'maxlength="255"']
];
document.querySelector('h1').textContent = chiXem ? 'Chi tiết phim' : ma ? 'Cập nhật phim' : 'Thêm phim';
form.innerHTML = truong.map(([ten, nhan, type, thuocTinh]) =>
    `<label>${nhan}<input name="${ten}" type="${type}" ${thuocTinh}></label>`).join('') +
    `<label>Nội dung<textarea name="noiDung"></textarea></label>
    <label>Giới hạn độ tuổi<select name="gioiHanDoTuoi">${['P','K','T13','T16','T18','C']
        .map(t => `<option>${t}</option>`).join('')}</select></label>
    <label>Trạng thái<select name="trangThai"><option value="SAP_CHIEU">Sắp chiếu</option>
    <option value="DANG_CHIEU">Đang chiếu</option><option value="NGUNG_CHIEU">Ngừng chiếu</option></select></label>
    ${chiXem ? '' : '<button class="button primary" type="submit">Lưu phim</button>'}<a href="quan-ly-phim.html">Hủy</a>`;
const posterPreview = document.querySelector('#poster-preview');
const posterEmpty = document.querySelector('#poster-empty');
function xemPoster(url) {
    posterPreview.hidden = !url;
    posterEmpty.hidden = Boolean(url);
    if (url) posterPreview.src = url;
}
posterPreview.addEventListener('error', () => xemPoster(''));
if (ma) {
    [...form.elements].forEach(e => { e.disabled = true; });
    try {
        const p = await goiApi(apiPhim);
        for (const [ten, giaTri] of Object.entries(p)) {
            const el = form.elements.namedItem(ten);
            if (el) el.value = giaTri ?? '';
        }
        [...form.elements].forEach(e => { e.disabled = chiXem; });
        form.elements.maPhim.readOnly = true;
        xemPoster(p.poster ? "images/" + encodeURIComponent(p.poster) : "");
    } catch (loi) {
        hienThongBao(thongBao, loi.message, 'loi');
    }
}
form.elements.poster.addEventListener('input', () => {
    const ten = form.elements.poster.value.trim();
    xemPoster(ten ? 'images/' + encodeURIComponent(ten) : '');
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    const nutLuu = form.querySelector('button[type="submit"]');
    if (chiXem || !nutLuu || nutLuu.disabled) return;
    const phim = Object.fromEntries(new FormData(form));
    phim.thoiLuong = Number(phim.thoiLuong);
    nutLuu.disabled = true;
    hienThongBao(thongBao, '');
    try {
        await goiApi(apiPhim, { method: ma ? 'PUT' : 'POST', body: phim });
        location.replace('quan-ly-phim.html?daLuu=1');
    } catch (loi) {
        hienThongBao(thongBao, loi.message, 'loi');
        nutLuu.disabled = false;
    }
});
