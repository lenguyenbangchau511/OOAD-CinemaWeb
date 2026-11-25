import { dinhDangNgay, goiApi } from './datve-common.js';

let films = null;
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector("#films");
const grid = document.querySelector(".film-grid");
const empty = document.querySelector("#films .empty:not(#load-error)");
const loadError = document.querySelector("#load-error");
const count = document.querySelector("#count");
const search = document.querySelector(".search");
const input = document.querySelector("#query");
const genre = document.querySelector("#genre");
const rating = document.querySelector("#rating");
const template = document.querySelector("#film-card");
let currentTab = "now";
let query = "";

function normalize(value) {
    return value.toLocaleLowerCase("vi").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").trim();
}

function movieMeta(film) {
    const details = [film.genre, film.minutes ? `${film.minutes} phút` : ""];
    if (film.tab === "soon" && film.release) details.push(`Khởi chiếu ${dinhDangNgay(film.release)}`);
    return details.filter(Boolean).join("\n");
}

function createCard(film) {
    const card = template.content.cloneNode(true);
    const poster = card.querySelector(".poster");
    poster.style.setProperty("--poster-light", film.tones[0]);
    poster.style.setProperty("--poster-dark", film.tones[1]);
    poster.querySelector(".poster-fallback").textContent = film.name;
    if (film.poster) {
        const image = new Image();
        image.alt = `Poster phim ${film.name}`;
        image.hidden = true;
        image.addEventListener("load", () => { image.hidden = false; }, { once: true });
        image.addEventListener("error", () => image.remove(), { once: true });
        poster.insertBefore(image, poster.querySelector(".age"));
        image.src = film.poster;
    }
    card.querySelector(".age").textContent = film.rating;
    card.querySelector(".meta").textContent = movieMeta(film);
    card.querySelector(".age").dataset.rating = film.rating || "";
    card.querySelector(".age").hidden = !film.rating;
    const title = document.createElement("a");
    title.className = "film-title";
    const booking = card.querySelector(".booking-link");
    const filmUrl = `chi-tiet-phim.html?maPhim=${encodeURIComponent(film.id)}`;
    title.textContent = film.name;
    title.href = filmUrl;
    card.querySelector("h2").replaceChildren(title);
    card.querySelector(".detail-link")?.remove();
    booking.hidden = film.tab !== "now";
    booking.href = filmUrl + "#lich-chieu";
    booking.setAttribute("aria-label", `Đặt vé – ${film.name}`);
    return card;
}

function render() {
    if (films === null) return;
    const filtered = Boolean(query || genre.value || rating.value);
    const visible = films.filter(film => film.tab === currentTab
        && (!query || film.searchText.includes(query))
        && (!genre.value || film.genres.includes(genre.value))
        && (!rating.value || film.rating === rating.value));
    for (const tab of tabs) {
        const label = tab.id === "now" ? "Đang chiếu" : "Sắp chiếu";
        tab.textContent = `${label} (${films.filter(film => film.tab === tab.id).length})`;
    }
    grid.replaceChildren(...visible.map(createCard));
    empty.hidden = visible.length > 0;
    count.textContent = `${visible.length} phim`;
    document.querySelector("#empty-title").textContent = filtered
        ? "Không có phim phù hợp"
        : currentTab === "now" ? "Hiện chưa có phim đang chiếu" : "Hiện chưa có phim sắp chiếu";
    document.querySelector("#empty-message").textContent = filtered
        ? "Thử thay đổi từ khóa hoặc bộ lọc." : "";
    document.querySelector("#clear").hidden = !filtered;
}

function selectTab(tab) {
    currentTab = tab.id;
    for (const item of tabs) {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", currentTab);
    render();
}

for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", event => {
        const destination = {
            ArrowRight: (index + 1) % tabs.length,
            ArrowLeft: (index + tabs.length - 1) % tabs.length,
            Home: 0,
            End: tabs.length - 1
        }[event.key];
        if (typeof destination !== "number") return;
        event.preventDefault();
        selectTab(tabs[destination]);
        tabs[destination].focus();
    });
}

search.addEventListener("submit", event => event.preventDefault());
input.addEventListener("input", () => {
    query = normalize(input.value);
    render();
});
genre.addEventListener("change", render);
rating.addEventListener("change", render);
search.addEventListener("reset", () => {
    query = "";
    queueMicrotask(render);
});
document.querySelector("#clear").addEventListener("click", () => {
    search.reset();
    input.focus();
});

function addOptions(select, values) {
    for (const value of [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"))) {
        select.append(new Option(value, value));
    }
}

async function loadFilms() {
    loadError.hidden = true;
    count.textContent = "Đang tải danh sách phim…";
    try {
        const phim = await goiApi("/api/phim", { chuyenKhiChuaDangNhap: false });
        if (!Array.isArray(phim)) throw new Error("Phản hồi danh sách phim không hợp lệ");
        films = phim.filter(p => ["DANG_CHIEU", "SAP_CHIEU"].includes(p.trangThai)).map(p => ({
            id: p.maPhim, name: p.tenPhim, rating: p.gioiHanDoTuoi, genre: p.theLoai, minutes: p.thoiLuong,
            genres: (p.theLoai || "").split(",").map(value => value.trim()).filter(Boolean),
            searchText: normalize([p.tenPhim, p.daoDien, p.dienVien].filter(Boolean).join(" ")),
            release: p.ngayKhoiChieu, tab: p.trangThai === "DANG_CHIEU" ? "now" : "soon",
            tones: ["#fff0e5", "#efc7b9"], poster: p.poster ? "images/" + encodeURIComponent(p.poster) : null
        }));
        document.querySelector(".home-hero").hidden = !films.some(film => film.id === "P02" && film.name === "Godzilla Trừ Không");
        addOptions(genre, films.flatMap(film => film.genres));
        addOptions(rating, films.map(film => film.rating));
        render();
    } catch {
        count.textContent = "";
        document.querySelector("#load-error-message").textContent = location.port === "63342"
            ? "Cậu đang mở bản preview của IntelliJ. Hãy chạy Spring Boot và mở trang qua cổng của ứng dụng."
            : "Vui lòng kiểm tra kết nối máy chủ rồi thử lại.";
        loadError.hidden = false;
    }
}

document.querySelector("#retry").addEventListener("click", loadFilms);
loadFilms();
