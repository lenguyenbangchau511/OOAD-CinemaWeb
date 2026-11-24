import {docKho, tien, anToan, trangThaiTon} from './kho-common.js';
const $ = id => document.getElementById(id);
let state = docKho();
const tenLoai = {DO_AN:'Đồ ăn',THUC_UONG:'Thức uống'};
const tenBienDong = {NHAP_KHO:'Nhập kho',BAN_HANG:'Bán hàng',KIEM_KE:'Kiểm kê',DIEU_CHINH:'Điều chỉnh'};
function capNhat() {
  state = docKho();
  $('tong-mat-hang').textContent = state.sanPham.length;
  $('dang-ban').textContent = state.sanPham.filter(p=>p.trangThai==='DANG_BAN').length;
  $('sap-het').textContent = state.sanPham.filter(p=>p.soLuongTon>0 && p.soLuongTon<=p.mucTonToiThieu).length;
  $('het-hang').textContent = state.sanPham.filter(p=>p.soLuongTon===0).length;
  const q=$('tu-khoa').value.trim().toLocaleLowerCase('vi');
  const loai=$('loai').value, tinh=$('tinh-trang').value;
  const ds=state.sanPham.filter(p=>{
    const tt=p.soLuongTon===0?'het-hang':p.soLuongTon<=p.mucTonToiThieu?'sap-het':'binh-thuong';
    return (!q || (p.maSanPham+' '+p.tenSanPham).toLocaleLowerCase('vi').includes(q)) && (!loai||p.loaiSanPham===loai) && (!tinh||tt===tinh);
  });
  $('ds-ton').innerHTML=ds.length?ds.map(p=>{
    const [label,cls]=trangThaiTon(p);
    return `<tr><td><strong>${anToan(p.maSanPham)}</strong></td><td><div class="name-cell"><span class="kho-thumb">${p.hinhAnh?`<img src="${anToan(p.hinhAnh)}" alt="">`:p.icon||'🍿'}</span><span>${anToan(p.tenSanPham)}<small>${p.trangThai==='DANG_BAN'?'Đang bán':'Ngừng bán'}</small></span></div></td><td>${tenLoai[p.loaiSanPham]}</td><td>${anToan(p.donViTinh)}</td><td class="so"><strong>${p.soLuongTon}</strong></td><td class="so">${p.mucTonToiThieu}</td><td><span class="chip ${cls}">${label}</span></td><td class="row-actions"><a class="button secondary nho" href="san-pham-chi-tiet.html?ma=${encodeURIComponent(p.maSanPham)}">Chi tiết</a><a class="button secondary nho" href="san-pham-form.html?ma=${encodeURIComponent(p.maSanPham)}">Sửa</a></td></tr>`;
  }).join(''):`<tr><td colspan="8" style="text-align:center;padding:26px">Không tìm thấy sản phẩm phù hợp.</td></tr>`;
  $('loc-san-pham').innerHTML='<option value="">Tất cả sản phẩm</option>'+state.sanPham.map(p=>`<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)}</option>`).join('');
  locLichSu();
}
function locLichSu(){
  const ma=$('loc-san-pham').value, loai=$('loc-bien-dong').value;
  const ds=state.bienDong.filter(x=>(!ma||x.maSanPham===ma)&&(!loai||x.loai===loai)).sort((a,b)=>b.thoiDiem.localeCompare(a.thoiDiem));
  $('ds-lichsu').innerHTML=ds.length?ds.map(x=>`<tr><td>${anToan(x.thoiDiem)}</td><td>${anToan(x.maSanPham)} · ${anToan(state.sanPham.find(p=>p.maSanPham===x.maSanPham)?.tenSanPham||'')}</td><td>${tenBienDong[x.loai]||x.loai}</td><td class="so ${x.soLuongThayDoi<0?'low-stock':'good-stock'}">${x.soLuongThayDoi>0?'+':''}${x.soLuongThayDoi}</td><td class="so">${x.tonTruoc}</td><td class="so">${x.tonSau}</td><td>${anToan(x.maThamChieu||'—')}</td><td>${anToan(x.ghiChu||'—')}</td></tr>`).join(''):`<tr><td colspan="8" style="text-align:center;padding:26px">Chưa có dữ liệu biến động phù hợp.</td></tr>`;
}
['tu-khoa','loai','tinh-trang'].forEach(id=>$(id).addEventListener('input',capNhat));
$('xoa-loc').addEventListener('click',()=>{$('tu-khoa').value='';$('loai').value='';$('tinh-trang').value='';capNhat();});
$('loc-san-pham').addEventListener('change',locLichSu); $('loc-bien-dong').addEventListener('change',locLichSu);
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));
 $('bang-ton').hidden=b.dataset.tab!=='ton'; $('bang-lichsu').hidden=b.dataset.tab!=='lichsu';
}));
capNhat();
