import {docKho,ghiKho,anToan,thongBao} from './kho-common.js';
const $=id=>document.getElementById(id), state=docKho(), maSua=new URLSearchParams(location.search).get('ma');
const box=$('thanh-phan');
function themDong(ma='',sl=1){
 const row=document.createElement('div');row.className='line-item combo-line';
 row.innerHTML=`<div class="field"><label>Sản phẩm thành phần</label><select class="sp"><option value="">Chọn sản phẩm</option>${state.sanPham.filter(p=>p.trangThai==='DANG_BAN').map(p=>`<option value="${anToan(p.maSanPham)}">${anToan(p.maSanPham)} - ${anToan(p.tenSanPham)}</option>`).join('')}</select></div><div class="field"><label>Số lượng</label><input class="sl" type="number" min="1" step="1" value="${sl}"></div><button class="icon-btn" type="button" title="Xóa dòng">×</button>`;
 row.querySelector('.sp').value=ma;row.querySelector('button').addEventListener('click',()=>row.remove());box.append(row);
}
$('them-dong').addEventListener('click',()=>themDong());
if(maSua){
 const c=state.combo.find(x=>x.maCombo===maSua);
 if(c){document.querySelector('h1').textContent='Sửa combo';$('ma').value=c.maCombo;$('ma').readOnly=true;$('ten').value=c.tenCombo;$('gia').value=c.giaCombo;$('anh').value=c.hinhAnh||'';$('mo-ta').value=c.moTa;$('trang-thai').value=c.trangThai;c.thanhPhan.forEach(x=>themDong(x.maSanPham,x.soLuong));}
}
if(!box.children.length)themDong();
$('form-combo').addEventListener('submit',e=>{
 e.preventDefault();
 const ma=$('ma').value.trim().toUpperCase(),ten=$('ten').value.trim(),gia=Number($('gia').value);
 const parts=[...box.querySelectorAll('.line-item')].map(r=>({maSanPham:r.querySelector('.sp').value,soLuong:Number(r.querySelector('.sl').value)}));
 if(!ma||!ten||!$('mo-ta').value.trim()||!Number.isFinite(gia)||gia<0||!parts.length||parts.some(x=>!x.maSanPham||!Number.isInteger(x.soLuong)||x.soLuong<=0)){thongBao($('thong-bao'),'Vui lòng nhập đủ thông tin và ít nhất một thành phần có số lượng nguyên dương.','loi');return;}
 if(new Set(parts.map(x=>x.maSanPham)).size!==parts.length){thongBao($('thong-bao'),'Không chọn trùng một sản phẩm trong nhiều dòng.','loi');return;}
 if(state.combo.some(c=>c.maCombo.toLowerCase()===ma.toLowerCase()&&c.maCombo!==maSua)){thongBao($('thong-bao'),'Mã combo đã tồn tại.','loi');return;}
 const c={maCombo:ma,tenCombo:ten,giaCombo:gia,hinhAnh:$('anh').value.trim(),moTa:$('mo-ta').value.trim(),trangThai:$('trang-thai').value,thanhPhan:parts};
 const i=state.combo.findIndex(x=>x.maCombo===maSua);if(i>=0)state.combo[i]=c;else state.combo.push(c);
 ghiKho(state);thongBao($('thong-bao'),`Đã lưu combo ${ma} trong dữ liệu demo.`,'thanh-cong');
 setTimeout(()=>location.href=`san-pham-chi-tiet.html?ma=${encodeURIComponent(ma)}`,700);
});
