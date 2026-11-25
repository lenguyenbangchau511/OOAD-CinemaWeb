import { congNgay, dinhDangGio, dinhDangNgay, goiApi, hienThongBao, homNay, thamSo, thoat } from './datve-common.js';

const maPhim = thamSo('maPhim');
const ngay = document.querySelector('#ngay');
const suat = document.querySelector('#suat');
const thongBao = document.querySelector('#thong-bao');
ngay.min = ngay.value = homNay();
let lanTai = 0;

function hienNgay() {
    const moc = homNay();
    const thanh = document.querySelector('#chon-ngay');
    const cacNgay = Array.from({ length: 7 }, (_, i) => congNgay(moc, i));
    thanh.replaceChildren(...cacNgay.map((iso, i) => {
        const nut = document.createElement('button');
        nut.type = 'button';
        nut.textContent = i === 0 ? `Hôm nay · ${dinhDangNgay(iso).slice(0, 5)}` : dinhDangNgay(iso).slice(0, 5);
        nut.setAttribute('aria-pressed', String(ngay.value === iso));
        nut.addEventListener('click', () => {
            ngay.value = iso;
            ngay.dispatchEvent(new Event('change'));
        });
        return nut;
    }));
}

async function taiSuat() {
    const lan = ++lanTai;
    suat.textContent = 'Đang tải lịch chiếu…';
    try {
        const query = new URLSearchParams({ maPhim, ngay: ngay.value });
        const ds = await goiApi('/api/suat-chieu/dang-ban?' + query);
        if (lan !== lanTai) return;
        suat.innerHTML = ds.filter(s => s.conBanVe).map(s =>
            `<a class="button secondary suat-link" href="chon-ghe.html?maSuat=${encodeURIComponent(s.maSuat)}">
                <strong>${dinhDangGio(s.gioBatDau)}</strong>
                <span>${thoat(s.loaiPhong === 'STANDARD' ? 'Tiêu chuẩn' : s.loaiPhong)}</span>
            </a>`).join('')
            || '<p>Không có suất chiếu cho ngày đã chọn.</p>';
    } catch (loi) {
        if (lan === lanTai) suat.textContent = loi.message;
    }
}

try {
    if (!maPhim) throw new Error('Vui lòng chọn phim từ trang chủ.');
    const p = await goiApi('/api/phim/' + encodeURIComponent(maPhim));
    const dangChieu = p.trangThai === 'DANG_CHIEU';
    document.querySelector('#phim').innerHTML = `
        <div class="mc-film-poster">
            ${p.poster ? `<img src="images/${encodeURIComponent(p.poster)}" alt="Poster ${thoat(p.tenPhim)}">` : ''}
            ${dangChieu ? '<a class="button primary" href="#lich-chieu">Đặt vé ngay</a>' : ''}
        </div>
        <div class="mc-film-info">
            <p class="mc-muted"><a href="./">Trang chủ</a> / Phim / ${thoat(p.tenPhim)}</p>
            <div class="mc-tags"><span class="mc-pill">${dangChieu ? 'Đang chiếu' : 'Sắp chiếu'}</span>
                <span class="mc-pill">${thoat(p.gioiHanDoTuoi)}</span></div>
            <h2>${thoat(p.tenPhim)}</h2>
            <dl>${[
                ['Thể loại', p.theLoai], ['Thời lượng', p.thoiLuong + ' phút'],
                ['Ngày khởi chiếu', dinhDangNgay(p.ngayKhoiChieu)], ['Đạo diễn', p.daoDien],
                ['Quốc gia', p.quocGia], ['Mã phim', p.maPhim], ['Diễn viên', p.dienVien]
            ].map(([nhan, gt]) => `<div><dt>${nhan}</dt><dd>${thoat(gt)}</dd></div>`).join('')}</dl>
            <h3>Nội dung phim</h3><p>${thoat(p.noiDung)}</p>
        </div>`;
    if (p.poster) {
        document.querySelector('.mc-backdrop').style.backgroundImage =
            `linear-gradient(0deg, #fbf8f5, transparent 80%), url("images/${encodeURIComponent(p.poster)}")`;
    }
    ngay.addEventListener('change', () => { hienNgay(); taiSuat(); });
    hienNgay();
    await taiSuat();
} catch (loi) {
    hienThongBao(thongBao, loi.message, 'loi');
    ngay.disabled = true;
}
