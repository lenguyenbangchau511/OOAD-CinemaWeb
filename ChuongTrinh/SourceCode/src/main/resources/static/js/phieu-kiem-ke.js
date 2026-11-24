import {docKho,ghiKho,tien,anToan,taoMa,ngayGio,thongBao} from './kho-common.js';
const $=id=>document.getElementById(id),state=docKho(),list=$('ds-dong'),form=$('form-kiem-ke');
$('ma-phieu').value=taoMa('PK',state.phieuKiem,'maPhieuKiemKe');$('thoi-diem').value=ngayGio();
const products=state.sanPham;
function themDong(ma=''){
 const row=document.createElement('div');row.className='line-item';
 row.innerHTML=`<div class="field"><label>Sản phẩm</label><select class="sp"><option value="">Chọn sản phẩm</option>${products.map(p=>`<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)}</option>`).join('')}</select></div><div class="field"><label>Tồn hệ thống</label><input class="ht" readonly></div><div class="field"><label>Số lượng thực tế</label><input class="tt" type="number" min="0" step="1" value="0"></div><div class="field"><label>Chênh lệch</label><input class="cl" readonly value="0"></div><button class="icon-btn" type="button" title="Xóa dòng">×</button><div class="field" style="grid-column:1/-2"><label>Lý do chênh lệch</label><input class="lydo" maxlength="500" placeholder="Nhập lý do khi có chênh lệch"></div>`;
 row.querySelector('.sp').value=ma;
 const selected=products.find(p=>p.maSanPham===ma);
 row.querySelector('.tt').value=selected ? selected.soLuongTon : 0;
 row.querySelector('.sp').addEventListener('change',()=>{const p=products.find(x=>x.maSanPham===row.querySelector('.sp').value);row.querySelector('.tt').value=p?p.soLuongTon:0;tinhDong(row);});
 row.querySelector('.tt').addEventListener('input',()=>tinhDong(row));row.querySelector('button').addEventListener('click',()=>{row.remove();tinhTong();});list.append(row);tinhDong(row);
}
function tinhDong(r){const p=products.find(x=>x.maSanPham===r.querySelector('.sp').value);r.querySelector('.ht').value=p?p.soLuongTon:'';const n=Number(r.querySelector('.tt').value);const d=p&&Number.isInteger(n)?n-p.soLuongTon:0;r.querySelector('.cl').value=p?d:'';r.querySelector('.cl').classList.toggle('low-stock',d<0);tinhTong();}
function tinhTong(){const rows=[...list.children];$('tong-dong').textContent=rows.length;$('so-chenh-lech').textContent=rows.filter(r=>r.querySelector('.sp').value&&Number(r.querySelector('.cl').value)!==0).length;}
$('them-dong').addEventListener('click',()=>themDong());products.slice(0,5).forEach(p=>themDong(p.maSanPham));
form.addEventListener('submit',e=>{
 e.preventDefault();const rows=[...list.children].map(r=>{const p=products.find(x=>x.maSanPham===r.querySelector('.sp').value);return p?{maSanPham:p.maSanPham,soLuongHeThong:p.soLuongTon,soLuongThucTe:Number(r.querySelector('.tt').value),chenhLech:Number(r.querySelector('.cl').value),lyDoChenhLech:r.querySelector('.lydo').value.trim()}:null;}).filter(Boolean);
 if(!rows.length||rows.length!==list.children.length||new Set(rows.map(x=>x.maSanPham)).size!==rows.length||rows.some(x=>!Number.isInteger(x.soLuongThucTe)||x.soLuongThucTe<0||(x.chenhLech!==0&&!x.lyDoChenhLech))){thongBao($('thong-bao'),'Kiểm tra sản phẩm, số lượng nguyên không âm, không trùng và nhập lý do cho dòng chênh lệch.','loi');return;}
 const ma=$('ma-phieu').value;rows.forEach(x=>{const p=state.sanPham.find(p=>p.maSanPham===x.maSanPham);if(p.soLuongTon!==x.soLuongHeThong){thongBao($('thong-bao'),`Tồn kho ${p.maSanPham} đã thay đổi trong lúc kiểm kê. Vui lòng tải lại và đối chiếu.`,'loi');return;}});
 if(rows.some(x=>state.sanPham.find(p=>p.maSanPham===x.maSanPham).soLuongTon!==x.soLuongHeThong))return;
 rows.forEach(x=>{const p=state.sanPham.find(p=>p.maSanPham===x.maSanPham),truoc=p.soLuongTon;p.soLuongTon=x.soLuongThucTe;if(x.chenhLech!==0)state.bienDong.push({ma:taoMa('BD',state.bienDong,'ma'),maSanPham:p.maSanPham,thoiDiem:ngayGio(),loai:'KIEM_KE',soLuongThayDoi:x.chenhLech,tonTruoc:truoc,tonSau:p.soLuongTon,maThamChieu:ma,ghiChu:x.lyDoChenhLech});});
 state.phieuKiem.push({maPhieuKiemKe:ma,thoiDiemLap:$('thoi-diem').value,thoiDiemXacNhan:ngayGio(),ghiChu:$('ghi-chu').value,chiTiet:rows,ketQua:rows.some(x=>x.chenhLech!==0)?'CO_CHENH_LECH':'KHOP'});
 ghiKho(state);thongBao($('thong-bao'),`Đã xác nhận phiếu ${ma} trong dữ liệu demo. Tồn kho được cập nhật theo số thực tế.`,'thanh-cong');form.querySelector('button[type=submit]').disabled=true;
});
