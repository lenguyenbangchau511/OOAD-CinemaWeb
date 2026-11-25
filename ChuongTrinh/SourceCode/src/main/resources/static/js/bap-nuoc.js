import { anhMon, dinhDangTien, goiApi } from './datve-common.js';

const loaiMon = {
    DO_AN: { ten: 'Đồ ăn', bieuTuong: '🍿' },
    THUC_UONG: { ten: 'Thức uống', bieuTuong: '🥤' },
    COMBO: { ten: 'Combo', bieuTuong: '🍿🥤' }
};

const thucDon = document.querySelector('#thuc-don');
const trangThai = document.querySelector('#trang-thai');
const thuLai = document.querySelector('#thu-lai');
const mauThe = document.querySelector('#the-mon');
const nutLoc = [...document.querySelectorAll('.menu-filters button')];
let danhMuc = null;
let loaiDangXem = '';

function taoTheMon(mon) {
    const the = mauThe.content.cloneNode(true);
    const loai = loaiMon[mon.loai];
    the.querySelector('.menu-category').textContent = loai.ten;
    the.querySelector('.menu-icon').textContent = loai.bieuTuong;
    the.querySelector('h2').textContent = mon.ten;
    the.querySelector('.menu-description').textContent = mon.moTa || '';
    the.querySelector('strong').textContent = dinhDangTien(mon.gia);
    the.querySelector('.menu-price-row span').hidden = mon.khaDung > 0;
    const duongDanAnh = anhMon(mon);
    if (duongDanAnh) {
        const anh = the.querySelector('img');
        anh.addEventListener('error', () => { anh.hidden = true; }, { once: true });
        anh.src = duongDanAnh;
        anh.hidden = false;
    }
    return the;
}

function hienThucDon() {
    const monHienThi = danhMuc.filter(mon => !loaiDangXem || mon.loai === loaiDangXem);
    thucDon.replaceChildren(...monHienThi.map(taoTheMon));
    trangThai.textContent = monHienThi.length ? `${monHienThi.length} món` : 'Hiện chưa có món trong danh mục này.';
}

async function taiThucDon() {
    thuLai.hidden = true;
    trangThai.textContent = 'Đang tải thực đơn…';
    try {
        const duLieu = await goiApi('/api/don-dat-ve/danh-muc', { chuyenKhiChuaDangNhap: false });
        if (!Array.isArray(duLieu)) throw new Error('Danh mục không hợp lệ.');
        danhMuc = duLieu.filter(mon => Object.hasOwn(loaiMon, mon.loai));
        hienThucDon();
    } catch {
        trangThai.textContent = 'Chưa tải được thực đơn. Vui lòng thử lại.';
        thuLai.hidden = false;
    }
}

for (const nut of nutLoc) {
    nut.addEventListener('click', () => {
        loaiDangXem = nut.dataset.loai;
        for (const muc of nutLoc) muc.setAttribute('aria-pressed', String(muc === nut));
        if (danhMuc) hienThucDon();
    });
}
thuLai.addEventListener('click', taiThucDon);
taiThucDon();
