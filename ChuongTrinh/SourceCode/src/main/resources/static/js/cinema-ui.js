// Tiện ích dùng chung, không phụ thuộc thư viện JS ngoài.
const paths = {
    home:'<path d="M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9"/>',
    film:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4"/>',
    user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
    users:'<circle cx="9" cy="7" r="3"/><path d="M2 20v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6m3 4c3 1 3 4 3 6"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7-3"/>',
    logout:'<path d="M10 3H4v18h6m-1-9h13m-5-5 5 5-5 5"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>', reload:'<path d="M20 9a8 8 0 1 0-1 9M20 3v6h-6"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
    pencil:'<path d="m4 15 12-12 5 5L9 20l-6 1zM14 5l5 5"/>', history:'<path d="M3 12a9 9 0 1 1 3 7M3 5v7h7m2-6v6l4 2"/>',
    screen:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4M7 21h10"/>', calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
    tag:'<path d="M3 3h9l9 9-9 9-9-9z"/><circle cx="8" cy="8" r="1"/>', cup:'<path d="M5 7h12l-2 14H7zM3 7h16M11 7V3l4-2"/>',
    box:'<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9"/>', chart:'<path d="M3 3v18h18M7 17v-5m5 5V6m5 11V9"/>',
    ticket:'<path d="M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4zM15 7v2m0 3v2m0 3v1"/>', scan:'<path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M3 12h18"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeoff:'<path d="M3 3l18 18M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>',
    plus:'<path d="M12 4v16M4 12h16"/>', left:'<path d="m15 5-7 7 7 7"/>', right:'<path d="m9 5 7 7-7 7"/>', close:'<path d="m5 5 14 14M19 5 5 19"/>',
    window:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>', gift:'<rect x="3" y="9" width="18" height="5" rx="1"/><path d="M5 14v7h14v-7M12 9v12M12 9c-8 0-8-7-3-6 2 0 3 3 3 6m0 0c8 0 8-7 3-6-2 0-3 3-3 6"/>'
};
export const icon = n => `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">${paths[n]||''}</svg>`;
export const $ = s => document.querySelector(s);
export const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const val = v => esc(v===null||v===undefined||v===''?'-':v);
export const labels = {ADMIN:'Quản trị viên',QUAN_LY:'Quản lý',NHAN_VIEN:'Nhân viên',KHACH_HANG:'Khách hàng',HOAT_DONG:'Hoạt động',KHONG_HOAT_DONG:'Đã khóa'};
export const norm = s => String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').trim();
export const emailOk = s => s.length<=255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const userOk = s => /^[a-zA-Z0-9._]{3,32}$/.test(s);
export const passOk = s => [...s].length>=8 && [...s].length<=128;
export const demoUsers = ['admin','quanly','nhanvien1','nhanvien2','khach1','khach2'];
export const demoEmails = demoUsers.map(u=>u+'@cinema.test');
export function notice(el,message='',type='error') { if(!el)return; el.textContent=message; el.hidden=!message; el.className='notice '+type; }
export async function api(path,body) {
    const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...(body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
    const data=response.status===204?null:await response.json().catch(()=>null);
    if(!response.ok){const err=new Error(data?.thongBao||'Không thể kết nối hệ thống.');err.status=response.status;throw err;}
    return data;
}
export const brand = internal => `<a class="brand" href="${internal?'noi-bo.html':'./'}"><span class="brand-mark" aria-hidden="true">▦</span><span>Mega<em>Cine</em>${internal?'<small>Hệ thống quản lý rạp phim</small>':''}</span></a>`;
export function footer(){ $('#footer').innerHTML='<div class="wrap">© 2026 MegaCine</div>'; }
export function iconBtn(n,label,attrs=''){return `<button type="button" class="btn icon-btn" title="${esc(label)}" aria-label="${esc(label)}" ${attrs}>${icon(n)}</button>`;}
export function safeReturn(){
    const d=new URLSearchParams(location.search).get('quayLai');
    if(!d||!d.startsWith('/')||d.startsWith('//')||d.includes('\\'))return null;
    try{const u=new URL(d,location.origin);return u.origin===location.origin&&['/','/index.html','/tai-khoan-ca-nhan.html','/chi-tiet-phim.html','/chon-ghe.html','/thanh-toan.html','/lich-su-ve.html','/ket-qua-dat-ve.html','/chi-tiet-ve.html','/chon-do-an.html','/xac-nhan-don.html'].includes(u.pathname)?u.pathname+u.search:null;}catch{return null;}
}
export const current = () => api('/api/auth/toi');
export function goLogin(){location.replace('login.html?quayLai='+encodeURIComponent(location.pathname+location.search));}
export async function logout(){await api('/api/auth/dang-xuat',{});Object.keys(sessionStorage).filter(k=>k.startsWith('cinema.profile.')||k.startsWith('cinema.mock.')).forEach(k=>sessionStorage.removeItem(k));['cinema.datVe','cinema.customers.keyword','cinema.customers.page','cinema.auth.reset'].forEach(k=>sessionStorage.removeItem(k));location.replace('login.html');}
export function account(u){return `<div class="account"><span class="avatar">${icon('user')}</span><span class="account-info"><strong><a href="tai-khoan-ca-nhan.html" title="Quản lý tài khoản cá nhân">${esc(u.hoTen||u.tenDangNhap)}</a></strong><small>${esc(labels[u.vaiTro]||u.vaiTro)}</small></span><a class="btn" href="doi-mat-khau.html">${icon('lock')} Đổi mật khẩu</a><button class="btn" id="logout">${icon('logout')} Đăng xuất</button></div>`;}
export function bindLogout(){ $('#logout')?.addEventListener('click',async()=>{try{await logout();}catch(e){notice($('#notice'),e.message);}}); }
export function bindEyes(root=document){root.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const f=document.getElementById(b.dataset.toggle),show=f.type==='password'; f.type=show?'text':'password';b.innerHTML=icon(show?'eyeoff':'eye');b.setAttribute('aria-label',show?'Ẩn mật khẩu':'Hiện mật khẩu');});}
export function field(id,label,type='text',hint='',attrs=''){return `<div class="field"><label for="${id}">${label}${label.endsWith("*")?'':'<span class="required-mark" aria-hidden="true"> *</span>'}</label><input id="${id}" name="${id}" type="${type}" ${attrs} required>${hint?`<small>${hint}</small>`:''}</div>`;}
export function passField(id,label,hint='',autocomplete='new-password'){return `<div class="field"><label for="${id}">${label}<span class="required-mark" aria-hidden="true"> *</span></label><div class="password"><input id="${id}" name="${id}" type="password" autocomplete="${autocomplete}" required><button type="button" class="toggle" aria-label="Hiện mật khẩu" data-toggle="${id}">${icon('eye')}</button></div>${hint?`<small>${hint}</small>`:''}</div>`;}
export const passHint='8–128 ký tự. Nên dùng cụm từ dễ nhớ.';
export const userHint='3–32 ký tự: chữ không dấu, số, dấu . hoặc _';

// Báo lỗi ngay tại trường nhập, đồng thời giữ thông báo chung cho lỗi hệ thống.
export function clearFormErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => {
        el.removeAttribute('aria-invalid');
        if ((el.getAttribute('aria-describedby') || '').startsWith('error-')) el.removeAttribute('aria-describedby');
    });
}
export function formError(form, err, fields = {}) {
    const id = err.field || Object.entries(fields).find(([prefix]) => err.message.startsWith(prefix))?.[1];
    const input = id && form.elements.namedItem(id);
    if (!input) return;
    const msg = document.createElement('small');
    msg.className = 'form-error'; msg.id = 'error-' + id; msg.textContent = err.message;
    (input.closest('.field') || input.closest('.password') || input).after(msg);
    input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', msg.id); input.focus();
}
export function invalidField(id, message) { const e = new Error(message); e.field = id; throw e; }
