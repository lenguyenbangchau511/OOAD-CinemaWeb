import { mountCustomerLayout, renderCustomerAccount } from './customer-layout.js';
import {$,icon,esc,brand,footer,account,bindLogout,notice,current,goLogin,api} from './cinema-ui.js';
footer();
async function init(){
    const me=await current();
    const key='cinema.profile.'+me.maTaiKhoan;
    const editable=Boolean(me.maKhachHang||me.maNhanVien);
    const initial={hoTen:me.hoTen||'',soDienThoai:me.soDienThoai||'',moTa:''};
    // Chỉ giữ mô tả thử trong sessionStorage; họ tên, số điện thoại luôn đọc từ CSDL.
    let saved=initial;
    try { saved={...initial,moTa:JSON.parse(sessionStorage.getItem(key))?.moTa||''}; } catch {}
    const customer=me.vaiTro==='KHACH_HANG';
    if (customer) mountCustomerLayout($('#header').parentElement, $('#footer'), me);
    else $('#header').innerHTML=brand(true)+account(me);
    $('#profile-banner').innerHTML=`<div class="wrap"><div class="profile-identity"><span class="avatar">${icon('user')}</span><div><h1 id="profile-name">${esc(saved.hoTen)}</h1><p id="profile-bio" class="muted"></p></div></div><nav class="profile-tabs" aria-label="Tài khoản cá nhân"><a href="tai-khoan-ca-nhan.html" aria-current="page">Tài khoản</a>${customer?'<a href="lich-su-ve.html">Vé đã mua</a>':''}</nav></div>`;
    $('#profile-banner').hidden=false;
    $('#main').innerHTML=`${customer?`<section class="card membership"><h2>Thông tin thành viên</h2><div class="profile-grid"><div><small>Hạng thành viên</small><h3>—</h3></div><div><small>Điểm tích lũy</small><h3 class="profile-points">${esc(me.diemTichLuy??'—')} điểm</h3></div></div></section>`:''}<section class="card"><h2>Thông tin cá nhân</h2><div id="notice" class="notice" role="status" aria-live="polite" hidden></div><form id="profile-form" novalidate><div class="profile-grid" style="margin-top:24px"><div class="field"><label for="username">Tên tài khoản</label><input id="username" value="${esc(me.tenDangNhap)}" readonly></div><div class="field"><label for="email">Email</label><input id="email" value="${esc(me.email)}" readonly></div><div class="field"><label for="hoTen">Họ và tên *</label><input id="hoTen" name="hoTen" autocomplete="name" required><small id="name-error" class="profile-error" aria-live="polite"></small></div><div class="field"><label for="soDienThoai">Số điện thoại *</label><input id="soDienThoai" name="soDienThoai" type="tel" autocomplete="tel" inputmode="numeric"><small>Nhập 10 chữ số bắt đầu bằng 0.</small><small id="phone-error" class="profile-error" aria-live="polite"></small></div><div class="field profile-wide"><div class="label-row"><label for="moTa">Mô tả cá nhân</label><small id="bio-count">0/101</small></div><textarea id="moTa" name="moTa" rows="2" placeholder="Viết đôi điều về bản thân..."></textarea><small id="bio-error" class="profile-error" aria-live="polite"></small></div></div><p class="muted">${editable?'Họ tên và số điện thoại được lưu vào hệ thống.':'Tài khoản chưa có hồ sơ liên kết; chưa thể sửa họ tên và số điện thoại.'} Mô tả cá nhân chỉ lưu tạm trong phiên trình duyệt, không lưu vào CSDL.</p><div class="profile-actions"><button class="btn" id="cancel-profile" type="button">Hủy thay đổi</button><button class="btn primary" id="save-profile" type="submit">Lưu thay đổi</button></div></form></section>`;
    const read=()=>({hoTen:$('#hoTen').value.trim(),soDienThoai:$('#soDienThoai').value.trim(),moTa:$('#moTa').value.trim()});
    let busy=false;
    function validate(){
        const d=read(), n=Array.from($('#moTa').value).length;
        const nameError = editable && (!d.hoTen || Array.from(d.hoTen).length > 100)
            ? 'Họ và tên bắt buộc và tối đa 100 ký tự.' : '';
        const phoneError = !editable ? '' : !d.soDienThoai
            ? 'Vui lòng nhập số điện thoại.'
            : !/^0[0-9]{9}$/.test(d.soDienThoai)
                ? 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0.' : '';
        const bioError = n > 101 ? 'Mô tả không được vượt quá 101 ký tự.' : '';
        const errors = [nameError, phoneError, bioError];
        ['name-error','phone-error','bio-error'].forEach((id,i)=>$('#'+id).textContent=errors[i]);
        ['hoTen','soDienThoai','moTa'].forEach((id,i)=>$('#'+id).setAttribute('aria-invalid',String(Boolean(errors[i]))));
        $('#bio-count').textContent=n+'/101';
        const changed=Object.keys(d).some(k=>d[k]!==saved[k]);
        $('#save-profile').disabled=busy||!changed||errors.some(Boolean);
        $('#cancel-profile').disabled=busy||!changed;
        return !errors.some(Boolean)&&changed;
    }
    const fill=()=>{for(const k of ['hoTen','soDienThoai','moTa'])$('#'+k).value=saved[k];validate();};
    const banner=()=>{$('#profile-name').textContent=saved.hoTen;$('#profile-bio').textContent=saved.moTa;$('#profile-bio').hidden=!saved.moTa;};
    fill();banner();
    if(!editable){$('#hoTen').readOnly=true;$('#soDienThoai').readOnly=true;}
    $('#profile-form').oninput=()=>{notice($('#notice'));validate();};
    $('#cancel-profile').onclick=()=>{fill();notice($('#notice'));};
    $('#profile-form').onsubmit=async e=>{
        e.preventDefault();if(busy||!validate())return;const d=read();busy=true;validate();
        let duplicatePhone = false;
        for(const k of Object.keys(d))$('#'+k).disabled=true;
        try{
            const changedProfile=editable&&(d.hoTen!==saved.hoTen||d.soDienThoai!==saved.soDienThoai);
            let updated=null;
            if(changedProfile)updated=await api('/api/auth/toi/ho-so',{hoTen:d.hoTen,soDienThoai:d.soDienThoai});
            saved={hoTen:updated?.hoTen??saved.hoTen,soDienThoai:updated?.soDienThoai??saved.soDienThoai,moTa:d.moTa};
            let bioSaved=true;
            try{sessionStorage.setItem(key,JSON.stringify({moTa:saved.moTa}));}catch{bioSaved=false;}
            fill();banner();
            if (updated && customer) renderCustomerAccount($('#cinema-home-account'), updated);
            else if (updated) { $('#header').innerHTML=brand(true)+account(updated);bindLogout(); }
            notice($('#notice'),(changedProfile?'Lưu thông tin cá nhân thành công. ':'')+(bioSaved?'Mô tả cá nhân được lưu tạm trong phiên này.':'Không thể lưu tạm mô tả cá nhân.'),bioSaved?'success':'error');
        } catch (err) {
            if (err.status === 409 && err.message === 'Số điện thoại đã được sử dụng.') {
                duplicatePhone = true;
            } else {
                notice($('#notice'), err.message);
            }
            if (err.status === 401) goLogin();
        } finally {
            busy = false;
            for (const k of Object.keys(d)) $('#' + k).disabled = false;
            validate();
            if (duplicatePhone) {
                $('#phone-error').textContent = 'Số điện thoại đã được sử dụng.';
                $('#soDienThoai').setAttribute('aria-invalid', 'true');
                $('#save-profile').disabled = true;
                $('#soDienThoai').focus();
            }
        }
    };
    $('#main').removeAttribute('aria-busy');bindLogout();
}
init().catch(e=>{if(e.status===401)goLogin();else $('#main').textContent=e.message;});
