/* Auth demo: akun dari data/users.json (fallback bawaan bila dibuka lewat file://).
   Perubahan profil disimpan di localStorage sebagai "override" di atas data JSON. */
(function () {
    var KEY = "floodmonitor.session", PKEY = "floodmonitor.profiles";
    var FALLBACK = [
        { username: "admin", email: "admin@floodmonitor.id", phone: "081234567890", password: "admin123", name: "Admin", role: "Administrator" },
        { username: "operator", email: "operator@floodmonitor.id", phone: "081234567891", password: "operator123", name: "Operator Banjir", role: "Operator" },
        { username: "petugas", email: "petugas@floodmonitor.id", phone: "081234567892", password: "petugas123", name: "Petugas Lapangan", role: "Petugas" }
    ];

    function read(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
    function phoneKey(v) { var d = String(v || "").replace(/\D/g, ""); return d.indexOf("62") === 0 ? "0" + d.slice(2) : d; }
    function overrides() { return read(PKEY) || {}; }
    function merge(u) { return Object.assign({}, u, overrides()[u.username] || {}); }
    function publicUser(u) { var c = Object.assign({}, u); delete c.password; return c; }

    function getSession() { try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; } }

    function loadUsers() {
        return fetch("data/users.json", { cache: "no-store" })
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (d) { return d.users; })
            .catch(function () { return FALLBACK; })
            .then(function (list) { return list.map(merge); });
    }

    function login(id, password) {
        var q = String(id).trim().toLowerCase(), qp = phoneKey(id);
        return loadUsers().then(function (users) {
            var u = users.find(function (x) {
                var hit = x.username.toLowerCase() === q || String(x.email).toLowerCase() === q ||
                          (qp.length >= 8 && phoneKey(x.phone) === qp);
                return hit && x.password === password;
            });
            if (!u) return null;
            var s = publicUser(u);
            sessionStorage.setItem(KEY, JSON.stringify(s));
            return s;
        });
    }

    /* Simpan perubahan profil (name, email, phone, password, photo). */
    function updateProfile(patch) {
        var s = getSession(); if (!s) return null;
        var all = overrides();
        all[s.username] = Object.assign({}, all[s.username], patch);
        localStorage.setItem(PKEY, JSON.stringify(all));
        var next = Object.assign({}, s, patch); delete next.password;
        sessionStorage.setItem(KEY, JSON.stringify(next));
        return next;
    }

    function checkPassword(pw) {
        var s = getSession(); if (!s) return Promise.resolve(false);
        return loadUsers().then(function (users) {
            var u = users.find(function (x) { return x.username === s.username; });
            return !!u && u.password === pw;
        });
    }

    function logout() { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); location.replace("login.html"); }

    window.Auth = { getSession: getSession, login: login, logout: logout, loadUsers: loadUsers,
                    updateProfile: updateProfile, checkPassword: checkPassword };

    localStorage.removeItem(KEY); // hapus sesi lama versi sebelumnya
    var onLogin = /login\.html$/.test(location.pathname);
    if (!getSession() && !onLogin) location.replace("login.html");
    window.addEventListener("pageshow", function () { if (!getSession() && !onLogin) location.replace("login.html"); });
    if (getSession() && onLogin) location.replace("dashboard.html");
})();
