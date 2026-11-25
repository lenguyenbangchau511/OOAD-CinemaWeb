import { dinhDangTien, goiApi } from './datve-common.js';

const loaiMon = {
    DO_AN: { ten: 'Đồ ăn', bieuTuong: '🍿' },
    THUC_UONG: { ten: 'Thức uống', bieuTuong: '🥤' },
    COMBO: { ten: 'Combo', bieuTuong: '🍿🥤' }
};

// Ảnh có sẵn cho các món mẫu khi danh mục trong cơ sở dữ liệu chưa có hinhAnh.
const anhMacDinh = {
    SP01: 'images/butter-popcorn.png',
    SP02: 'images/caramel-popcorn.png',
    SP03: 'images/cheese-popcorn.png',
    SP04: 'images/snack-khoai-tay.jpg',
    SP05: 'images/snack-rong-bien.jpg',
    SP06: 'images/nachos-sot-pho-mai.jpg',
    SP07: 'images/xuc-xich-nuong.jpg',
    SP08: 'images/khoai-tay-chien.jpg',
    SP09: 'images/coca-cola.webp',
    SP10: 'images/soda-chanh.jpg',
    SP11: 'images/nuoc-suoi.webp',
    SP12: 'images/tra-dao.jpg',
    SP13: 'images/tra-xanh.jpg',
    CB01: 'images/combo-ca-nhan.png',
    CB02: 'images/combo-cap-doi-caramel.png',
    CB03: 'images/combo-cap-doi-pho-mai.png',
    CB04: 'images/combo-nhom.png'
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
    const duongDanAnh = mon.hinhAnh?.trim() || anhMacDinh[mon.ma];
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
