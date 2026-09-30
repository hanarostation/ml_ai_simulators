/* =====================================================================
   공통 동작 — 모든 페이지에서 불러옵니다.
   - 밝게/어둡게 전환 버튼 (선택은 브라우저에 저장)
   - 로고 이미지가 없을 때 대체 (logo2 없음 → logo1, 둘 다 없음 → 글자)
   ===================================================================== */
(function () {
  var KEY = "ds-theme";
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { } }
  function effective() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return mq && mq.matches ? "dark" : "light";
  }

  var ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/></svg>';

  function paintButton(btn) {
    var dark = effective() === "dark";
    btn.innerHTML = dark ? ICON_SUN : ICON_MOON;
    var label = dark ? "밝은 화면으로 보기" : "어두운 화면으로 보기";
    btn.setAttribute("aria-label", label);
    btn.title = label;
  }

  function init() {
    var s = stored();
    if (s === "light" || s === "dark") root.setAttribute("data-theme", s);

    var btn = document.querySelector("[data-ds-theme]");
    if (btn) {
      paintButton(btn);
      btn.addEventListener("click", function () {
        var next = effective() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        save(next);
        paintButton(btn);
      });
      if (mq && mq.addEventListener) mq.addEventListener("change", function () { paintButton(btn); });
    }

    /* 로고 파일 찾기: logo1.png / logo2.png 가 안 열리면 흔한 다른 이름도 차례로 시도
       (대문자 확장자, jpg·webp·svg, 윈도우에서 확장자가 숨겨져 생긴 "logo2.png.png" 등) */
    var EXTS = [".png", ".PNG", ".jpg", ".jpeg", ".JPG", ".webp", ".svg", ".png.png", ".png.jpg", ".png.jpeg", ".png.webp"];
    function findLogo(img, cls) {
      if (!img || img._dsTrying) return;
      img._dsTrying = true;
      var brand = img.closest(".ds-brand");
      var src = img.getAttribute("src");
      var dir = src.replace(/[^\/]*$/, "");
      var base = src.slice(dir.length).replace(/\..*$/, "");
      var tries = [];
      EXTS.forEach(function (e) { tries.push(base + e); });
      tries.push(base.charAt(0).toUpperCase() + base.slice(1) + ".png");
      var i = 1; /* 0번(원래 이름)은 이미 실패 */
      img.onload = function () { brand.classList.remove(cls); img.removeAttribute("data-fail"); };
      img.onerror = function () {
        if (i >= tries.length) {
          brand.classList.add(cls);
          if (window.console) console.warn("[로고] " + dir + base + ".png 파일을 찾지 못했습니다. image 폴더의 파일 이름을 확인하세요.");
          return;
        }
        img.src = dir + tries[i++];
      };
      img.onerror();
    }
    [["light", "no-logo-light"], ["dark", "no-logo-dark"]].forEach(function (p) {
      var img = document.querySelector(".ds-brand__logo--" + p[0]);
      if (!img) return;
      if (img.getAttribute("data-fail") || (img.complete && img.naturalWidth === 0)) findLogo(img, p[1]);
      else img.addEventListener("error", function () { findLogo(img, p[1]); });
    });

    var y = document.querySelector("[data-ds-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
