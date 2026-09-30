/* Perilaku sidebar, menu akun, dan Edit Profil untuk semua halaman. */
document.addEventListener("DOMContentLoaded", function () {
    var session = window.Auth && Auth.getSession();

    document.querySelectorAll(".side-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var open = btn.closest(".side-group").classList.toggle("open");
            btn.setAttribute("aria-expanded", String(open));
        });
    });

    if (!session) return;
    if (session.role !== "Administrator") document.querySelectorAll(".side-group").forEach(function (g) { g.remove(); });

    var account = document.querySelector(".fm-account");
    if (!account) return;
    var toastEl;
    function toast(msg) {
        if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "fm-toast"; document.body.appendChild(toastEl); }
        toastEl.textContent = msg; toastEl.classList.add("show");
        clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
    }
    function paintAvatar(el, s) {
        el.textContent = s.photo ? "" : (s.name || "?").trim().charAt(0).toUpperCase();
        el.style.backgroundImage = s.photo ? "url(" + s.photo + ")" : "";
        el.classList.toggle("has-photo", !!s.photo);
    }
    function refreshAccount() {
        var s = Auth.getSession();
        paintAvatar(account.querySelector(".fm-avatar"), s);
        account.querySelector(".fm-account-text b").textContent = s.name;
        account.querySelector(".fm-account-text small").textContent = s.role;
        menu.querySelector(".account-menu-user b").textContent = s.name;
        menu.querySelector(".account-menu-user small").textContent = s.email;
    }

    account.setAttribute("tabindex", "0"); account.setAttribute("role", "button");
    var menu = document.createElement("div");
    menu.className = "account-menu";
    menu.innerHTML = '<div class="account-menu-user"><b></b><small></small></div>' +
        '<button type="button" class="account-menu-item" data-act="profile">Edit Profil</button>' +
        '<button type="button" class="account-menu-item danger" data-act="logout">Keluar</button>';
    account.appendChild(menu);
    refreshAccount();

    account.addEventListener("click", function (e) {
        var act = e.target.closest("[data-act]");
        if (act) {
            account.classList.remove("menu-open");
            if (act.dataset.act === "logout" && window.confirm("Keluar dari akun ini?")) Auth.logout();
            if (act.dataset.act === "profile") openProfile();
            return;
        }
        if (!e.target.closest(".account-menu")) account.classList.toggle("menu-open");
    });
    document.addEventListener("click", function (e) { if (!account.contains(e.target)) account.classList.remove("menu-open"); });

    /* ---------- Edit Profil ---------- */
    var dlg;
    function build() {
        dlg = document.createElement("dialog");
        dlg.className = "profile-dialog";
        dlg.innerHTML =
        '<form method="dialog" id="pfForm" novalidate>' +
        '<header><h2>Edit Profil</h2><button type="button" class="pf-x" data-close aria-label="Tutup">×</button></header>' +
        '<div class="pf-photo"><span class="fm-avatar pf-avatar"></span><div>' +
            '<label class="pf-btn">Ganti foto<input type="file" id="pfFile" accept="image/*" hidden></label>' +
            '<button type="button" class="pf-btn ghost" id="pfRemove">Hapus foto</button>' +
            '<small>JPG/PNG, otomatis diperkecil.</small></div></div>' +
        '<label>Nama lengkap<input id="pfName" autocomplete="name"></label>' +
        '<label>Email<input id="pfEmail" type="email" autocomplete="email"></label>' +
        '<label>No. Telepon<input id="pfPhone" type="tel" autocomplete="tel"></label>' +
        '<label>Role<input id="pfRole" disabled></label>' +
        '<fieldset><legend>Ganti password <small>(kosongkan jika tidak diganti)</small></legend>' +
        '<label>Password saat ini<input id="pfOld" type="password" autocomplete="current-password"></label>' +
        '<label>Password baru<input id="pfNew" type="password" autocomplete="new-password"></label>' +
        '<label>Ulangi password baru<input id="pfNew2" type="password" autocomplete="new-password"></label></fieldset>' +
        '<p class="pf-error" id="pfError" role="alert"></p>' +
        '<footer><button type="button" class="pf-btn ghost" data-close>Batal</button><button type="submit" class="pf-btn primary">Simpan</button></footer>' +
        '</form>';
        document.body.appendChild(dlg);
        var $ = function (id) { return dlg.querySelector("#" + id); };
        var photo = null;

        dlg.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
        dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

        $("pfFile").addEventListener("change", function () {
            var f = this.files[0]; if (!f) return;
            var img = new Image(), url = URL.createObjectURL(f);
            img.onload = function () {
                var c = document.createElement("canvas"), n = 160, side = Math.min(img.width, img.height);
                c.width = c.height = n;
                c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, n, n);
                photo = c.toDataURL("image/jpeg", .85); URL.revokeObjectURL(url);
                paintAvatar(dlg.querySelector(".pf-avatar"), { name: $("pfName").value, photo: photo });
            };
            img.src = url;
        });
        $("pfRemove").addEventListener("click", function () {
            photo = "";
            paintAvatar(dlg.querySelector(".pf-avatar"), { name: $("pfName").value, photo: "" });
        });

        dlg.reset = function () {
            var s = Auth.getSession(); photo = null;
            $("pfName").value = s.name; $("pfEmail").value = s.email || ""; $("pfPhone").value = s.phone || ""; $("pfRole").value = s.role;
            $("pfOld").value = $("pfNew").value = $("pfNew2").value = ""; $("pfError").textContent = "";
            paintAvatar(dlg.querySelector(".pf-avatar"), s);
        };

        dlg.querySelector("form").addEventListener("submit", function (e) {
            e.preventDefault();
            var err = $("pfError"), name = $("pfName").value.trim(), email = $("pfEmail").value.trim(),
                phone = $("pfPhone").value.trim(), oldPw = $("pfOld").value, pw = $("pfNew").value, pw2 = $("pfNew2").value;
            var fail = function (m) { err.textContent = m; };
            if (!name) return fail("Nama tidak boleh kosong.");
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Format email tidak valid.");
            if (!/^\+?[\d\s-]{8,16}$/.test(phone)) return fail("No. telepon harus 8-15 digit.");
            var patch = { name: name, email: email, phone: phone };
            if (photo !== null) patch.photo = photo;

            var finish = function () {
                Auth.updateProfile(patch); refreshAccount(); dlg.close(); toast("Profil berhasil diperbarui.");
            };
            if (!oldPw && !pw && !pw2) return finish();
            if (pw.length < 6) return fail("Password baru minimal 6 karakter.");
            if (pw !== pw2) return fail("Konfirmasi password tidak sama.");
            Auth.checkPassword(oldPw).then(function (ok) {
                if (!ok) return fail("Password saat ini salah.");
                patch.password = pw; finish();
            });
        });
    }
    function openProfile() { if (!dlg) build(); dlg.reset(); dlg.showModal(); }
});
