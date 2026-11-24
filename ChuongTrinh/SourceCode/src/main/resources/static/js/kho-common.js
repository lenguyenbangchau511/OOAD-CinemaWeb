/* Dữ liệu minh họa cục bộ cho các giao diện 30-35.
   Khi có API Spring Boot, thay các hàm đọc/ghi localStorage bằng fetch(). */
const KEY = 'cinema.danh.kho.demo.v1';

const SAN_PHAM_MAU = [
  {maSanPham:'SP01',tenSanPham:'Bắp rang bơ',loaiSanPham:'DO_AN',donViTinh:'Hộp',giaBan:45000,moTa:'Bắp rang bơ phục vụ tại quầy.',hinhAnh:'https://images.pexels.com/photos/7234396/pexels-photo-7234396.jpeg',trangThai:'DANG_BAN',soLuongTon:39,mucTonToiThieu:5,icon:'🍿'},
  {maSanPham:'SP02',tenSanPham:'Bắp rang caramel',loaiSanPham:'DO_AN',donViTinh:'Hộp',giaBan:49000,moTa:'Bắp rang caramel.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🍿'},
  {maSanPham:'SP03',tenSanPham:'Bắp rang phô mai',loaiSanPham:'DO_AN',donViTinh:'Hộp',giaBan:49000,moTa:'Bắp rang phô mai.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🍿'},
  {maSanPham:'SP04',tenSanPham:'Snack khoai tây',loaiSanPham:'DO_AN',donViTinh:'Gói',giaBan:25000,moTa:'Snack khoai tây.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:39,mucTonToiThieu:5,icon:'🥔'},
  {maSanPham:'SP06',tenSanPham:'Nachos sốt phô mai',loaiSanPham:'DO_AN',donViTinh:'Khay',giaBan:55000,moTa:'Nachos sốt phô mai.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🧀'},
  {maSanPham:'SP07',tenSanPham:'Xúc xích nướng',loaiSanPham:'DO_AN',donViTinh:'Phần',giaBan:35000,moTa:'Xúc xích nướng.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🌭'},
  {maSanPham:'SP08',tenSanPham:'Khoai tây chiên',loaiSanPham:'DO_AN',donViTinh:'Phần',giaBan:39000,moTa:'Khoai tây chiên.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🍟'},
  {maSanPham:'SP09',tenSanPham:'Cola',loaiSanPham:'THUC_UONG',donViTinh:'Lon',giaBan:30000,moTa:'Cola.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:39,mucTonToiThieu:5,icon:'🥤'},
  {maSanPham:'SP10',tenSanPham:'Soda chanh',loaiSanPham:'THUC_UONG',donViTinh:'Lon',giaBan:30000,moTa:'Soda chanh.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🍋'},
  {maSanPham:'SP11',tenSanPham:'Nước suối',loaiSanPham:'THUC_UONG',donViTinh:'Chai',giaBan:20000,moTa:'Nước suối.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:39,mucTonToiThieu:5,icon:'💧'},
  {maSanPham:'SP12',tenSanPham:'Trà đào',loaiSanPham:'THUC_UONG',donViTinh:'Chai',giaBan:35000,moTa:'Trà đào.',hinhAnh:'',trangThai:'DANG_BAN',soLuongTon:40,mucTonToiThieu:5,icon:'🍑'}
];
const COMBO_MAU = [
  {maCombo:'CB01',tenCombo:'Combo cá nhân',giaCombo:65000,hinhAnh:'https://images.pexels.com/photos/7234254/pexels-photo-7234254.jpeg',moTa:'Gồm 1 × Bắp rang bơ, 1 × Cola.',trangThai:'DANG_BAN',thanhPhan:[{maSanPham:'SP01',soLuong:1},{maSanPham:'SP09',soLuong:1}]},
  {maCombo:'CB02',tenCombo:'Combo cặp đôi caramel',giaCombo:95000,hinhAnh:'',moTa:'Gồm 1 × Bắp rang caramel, 2 × Cola.',trangThai:'DANG_BAN',thanhPhan:[{maSanPham:'SP02',soLuong:1},{maSanPham:'SP09',soLuong:2}]},
  {maCombo:'CB03',tenCombo:'Combo cặp đôi phô mai',giaCombo:99000,hinhAnh:'',moTa:'Gồm 1 × Bắp rang phô mai, 2 × Trà đào.',trangThai:'DANG_BAN',thanhPhan:[{maSanPham:'SP03',soLuong:1},{maSanPham:'SP12',soLuong:2}]},
  {maCombo:'CB04',tenCombo:'Combo nhóm',giaCombo:159000,hinhAnh:'',moTa:'Gồm 2 × Bắp rang bơ, 1 × Nachos, 2 × Soda chanh.',trangThai:'DANG_BAN',thanhPhan:[{maSanPham:'SP01',soLuong:2},{maSanPham:'SP06',soLuong:1},{maSanPham:'SP10',soLuong:2}]}
];

export function docKho() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.sanPham?.length) return saved;
  } catch {}
  const state = {
    sanPham: structuredClone(SAN_PHAM_MAU),
    combo: structuredClone(COMBO_MAU),
    bienDong: [
      {ma:'BD001',maSanPham:'SP01',thoiDiem:'2026-11-24 09:00',loai:'NHAP_KHO',soLuongThayDoi:40,tonTruoc:0,tonSau:40,maThamChieu:'PN01',ghiChu:'Nhập tồn đầu'},
      {ma:'BD002',maSanPham:'SP01',thoiDiem:'2026-11-24 15:00',loai:'BAN_HANG',soLuongThayDoi:-1,tonTruoc:40,tonSau:39,maThamChieu:'DH01',ghiChu:'Bán hàng demo'},
      {ma:'BD003',maSanPham:'SP09',thoiDiem:'2026-11-24 15:00',loai:'BAN_HANG',soLuongThayDoi:-1,tonTruoc:40,tonSau:39,maThamChieu:'DH01',ghiChu:'Bán hàng demo'}
    ],
    phieuNhap: [], phieuKiem: []
  };
  ghiKho(state);
  return state;
}
export function ghiKho(state) { localStorage.setItem(KEY, JSON.stringify(state)); }
export function tien(n) { return new Intl.NumberFormat('vi-VN').format(Number(n)||0)+' ₫'; }
export function so(n) { return new Intl.NumberFormat('vi-VN').format(Number(n)||0); }
export function anToan(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function ngayGio() { return new Date().toLocaleString('sv-SE').slice(0,16).replace('T',' '); }
export function taoMa(prefix, list, prop) {
  let i=1, ma;
  do { ma = prefix + String(i++).padStart(3,'0'); } while (list.some(x => x[prop] === ma));
  return ma;
}
export function trangThaiTon(p) {
  if (p.soLuongTon === 0) return ['Hết hàng','xau'];
  if (p.soLuongTon <= p.mucTonToiThieu) return ['Sắp hết','cho'];
  return ['Bình thường','tot'];
}
export function thongBao(el, msg, type='thong-tin') {
  el.hidden = !msg; el.textContent = msg || ''; el.className = 'alert ' + type;
}
export function tenSanPham(state, ma) { return state.sanPham.find(p=>p.maSanPham===ma)?.tenSanPham || ma; }
