document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENT
    ====================================================== */

    const navItems =
        document.querySelectorAll(
            "#sidebarNav .nav-item"
        );

    const accountButton =
        document.getElementById("accountButton");

    const accountMenu =
        document.getElementById("accountMenu");

    const reportSearch =
        document.getElementById("reportSearch");

    const periodFilter =
        document.getElementById("periodFilter");

    const areaFilter =
        document.getElementById("areaFilter");

    const reportRows =
        document.querySelectorAll(
            "#reportBody tr"
        );

    const scheduleSwitch =
        document.getElementById("scheduleSwitch");

    const scheduleFields =
        document.getElementById("scheduleFields");

    const createReport =
        document.getElementById("createReport");

    const cancelReport =
        document.getElementById("cancelReport");

    const bottomCreateButton =
        document.getElementById(
            "bottomCreateButton"
        );

    const toast =
        document.getElementById("toast");


    /* =====================================================
       TOAST
    ====================================================== */

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(
            window.toastTimer
        );

        window.toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 2500);
    }

        const sensorBody = document.getElementById("sensorBody");
        const sensorEditDialog = document.getElementById("sensorEditDialog");
        const sensorEditForm = document.getElementById("sensorEditForm");
        let sensorRowBeingEdited = null;

        if (sensorBody && sensorEditDialog && sensorEditForm) {
            const sensorEditId = document.getElementById("sensorEditId");
            const locationInput = document.getElementById("editSensorLocation");
            const riverInput = document.getElementById("editSensorRiver");
            const waterInput = document.getElementById("editSensorWater");
            const statusInput = document.getElementById("editSensorStatus");

            function closeSensorEditor() {
                sensorEditDialog.close();
                sensorRowBeingEdited = null;
            }

            sensorBody.addEventListener("click", (event) => {
                const editButton = event.target.closest(".edit-btn");
                if (editButton) {
                    sensorRowBeingEdited = editButton.closest("tr");
                    if (!sensorRowBeingEdited) return;

                    const cells = sensorRowBeingEdited.cells;
                    const sensorId = cells[1].textContent.trim().replace(/^#/, "");
                    const locationCell = cells[2];
                    const waterCell = cells[3];
                    const statusCell = cells[4].querySelector(".status");
                    const status = sensorRowBeingEdited.dataset.status || "Normal";

                    sensorEditId.textContent = sensorId;
                    locationInput.value = locationCell.querySelector("strong")?.textContent.trim() || "";
                    riverInput.value = locationCell.querySelector("small")?.textContent.trim().replace(/^Sungai\s+/i, "") || "";
                    waterInput.value = waterCell.textContent.trim();
                    statusInput.value = statusInput.querySelector(`option[value="${status}"]`)
                        ? status
                        : "Normal";

                    sensorEditDialog.showModal();
                    return;
                }

                const viewButton = event.target.closest(".view-btn");
                if (viewButton) {
                    const row = viewButton.closest("tr");
                    const sensorId = row?.cells[1].textContent.trim().replace(/^#/, "");
                    showToast(`Detail sensor ${sensorId || ""}`);
                }
            });

            sensorEditForm.addEventListener("submit", (event) => {
                event.preventDefault();
                if (!sensorRowBeingEdited) return;

                const cells = sensorRowBeingEdited.cells;
                const locationCell = cells[2];
                const waterCell = cells[3];
                const statusCell = cells[4].querySelector(".status");
                const status = statusInput.value;
                const statusClass = {
                    Normal: "normal",
                    Waspada: "warning",
                    Siaga: "siaga",
                    Bahaya: "danger",
                    Offline: "offline"
                }[status];

                locationCell.querySelector("strong").textContent = locationInput.value.trim();
                locationCell.querySelector("small").textContent = `Sungai ${riverInput.value.trim()}`;
                waterCell.textContent = waterInput.value.trim();
                statusCell.className = `status ${statusClass}`;
                statusCell.textContent = `● ${status}`;
                sensorRowBeingEdited.dataset.status = status;
                sensorRowBeingEdited.dataset.river = riverInput.value.trim();

                closeSensorEditor();
                showToast(`Data sensor ${sensorEditId.textContent} diperbarui.`);
            });

            document.getElementById("closeSensorEdit")?.addEventListener("click", closeSensorEditor);
            document.getElementById("cancelSensorEdit")?.addEventListener("click", closeSensorEditor);
            sensorEditDialog.addEventListener("click", (event) => {
                if (event.target === sensorEditDialog) closeSensorEditor();
            });
        }


    /* =====================================================
       SIDEBAR
    ====================================================== */

    navItems.forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                const page =
                    item.dataset.page;

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );


                if (page === "Laporan") {

                    showToast(
                        "Halaman Laporan sedang dibuka."
                    );

                    return;
                }


                showToast(
                    `${page} dipilih.`
                );

            }
        );

    });


    /* =====================================================
       ACCOUNT
    ====================================================== */

    if (
        accountButton &&
        accountMenu
    ) {

        accountButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                accountMenu.classList.toggle(
                    "show"
                );

            }
        );


        document.addEventListener(
            "click",
            (event) => {

                if (
                    !accountMenu.contains(
                        event.target
                    ) &&
                    !accountButton.contains(
                        event.target
                    )
                ) {

                    accountMenu.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       REPORT FILTER
    ====================================================== */

    function filterReports() {

        const keyword =
            reportSearch
                ? reportSearch.value
                    .toLowerCase()
                    .trim()
                : "";

        const period =
            periodFilter
                ? periodFilter.value
                : "all";

        const area =
            areaFilter
                ? areaFilter.value
                : "all";


        reportRows.forEach((row) => {

            const name =
                (
                    row.dataset.name || ""
                ).toLowerCase();

            const rowArea =
                row.dataset.area || "";

            const text =
                row.textContent.toLowerCase();


            const keywordMatch =
                keyword === "" ||
                name.includes(keyword) ||
                text.includes(keyword);


            let periodMatch = true;


            if (period === "juni") {

                periodMatch =
                    text.includes("Jun");

            }


            if (period === "mei") {

                periodMatch =
                    text.includes("Mei");

            }


            const areaMatch =
                area === "all" ||
                rowArea === area;


            const visible =
                keywordMatch &&
                periodMatch &&
                areaMatch;


            row.style.display =
                visible ? "" : "none";

        });

    }


    if (reportSearch) {

        reportSearch.addEventListener(
            "input",
            filterReports
        );

    }


    if (periodFilter) {

        periodFilter.addEventListener(
            "change",
            filterReports
        );

    }


    if (areaFilter) {

        areaFilter.addEventListener(
            "change",
            filterReports
        );

    }


    /* =====================================================
       GLOBAL SEARCH
    ====================================================== */

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    if (globalSearch) {

        globalSearch.addEventListener(
            "input",
            () => {

                if (reportSearch) {

                    reportSearch.value =
                        globalSearch.value;

                    filterReports();

                }

            }
        );

    }


    /* =====================================================
       REPORT TYPE
    ====================================================== */

    const reportTypes =
        document.querySelectorAll(
            ".report-type"
        );


    reportTypes.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                reportTypes.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                button.classList.add(
                    "active"
                );


                const type =
                    button.dataset.type;

                showToast(
                    `Jenis laporan: ${type}`
                );

            }
        );

    });


    /* =====================================================
       SCHEDULE
    ====================================================== */

    function updateSchedule() {

        if (!scheduleFields) return;

        if (
            scheduleSwitch &&
            scheduleSwitch.checked
        ) {

            scheduleFields.style.display =
                "grid";

        } else {

            scheduleFields.style.display =
                "none";

        }

    }


    if (scheduleSwitch) {

        scheduleSwitch.addEventListener(
            "change",
            updateSchedule
        );

    }

    updateSchedule();


    /* =====================================================
       CREATE REPORT
    ====================================================== */

    if (createReport) {

        createReport.addEventListener(
            "click",
            () => {

                const activeType =
                    document.querySelector(
                        ".report-type.active"
                    );


                const type =
                    activeType
                        ? activeType
                            .querySelector("span")
                            ?.textContent
                        : "Harian";


                showToast(
                    `Laporan ${type} sedang dibuat...`
                );


                setTimeout(() => {

                    showToast(
                        "Laporan berhasil dibuat."
                    );

                }, 1200);

            }
        );

    }


    /* =====================================================
       CANCEL
    ====================================================== */

    if (cancelReport) {

        cancelReport.addEventListener(
            "click",
            () => {

                showToast(
                    "Pembuatan laporan dibatalkan."
                );

            }
        );

    }


    if (bottomCreateButton) {

        bottomCreateButton.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                showToast(
                    "Silakan isi form Buat Laporan."
                );

            }
        );

    }


    /* =====================================================
       PDF
    ====================================================== */

    document
        .querySelectorAll(".pdf-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const report =
                        button.dataset.report ||
                        button
                            .closest("tr")
                            ?.dataset.name ||
                        "Laporan";

                    showToast(
                        `Menyiapkan PDF: ${report}`
                    );

                }
            );

        });


    /* =====================================================
       EXCEL
    ====================================================== */

    document
        .querySelectorAll(".excel-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const report =
                        button.dataset.report ||
                        button
                            .closest("tr")
                            ?.dataset.name ||
                        "Laporan";

                    downloadExcel(
                        report
                    );

                }
            );

        });


    function downloadExcel(reportName) {

        const csv =
            [
                [
                    "Nama Laporan",
                    "Jenis",
                    "Periode",
                    "Wilayah"
                ],

                [
                    reportName,
                    "Laporan",
                    "26 Jun 2026",
                    "Semarang"
                ]

            ]
                .map(row =>
                    row
                        .map(value =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                ["\ufeff" + csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `${reportName}.csv`;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(url);


        showToast(
            "File Excel berhasil dibuat."
        );

    }


    /* =====================================================
       MORE BUTTON
    ====================================================== */

    document
        .querySelectorAll(".more-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    showToast(
                        "Menu laporan dibuka."
                    );

                }
            );

        });


    /* =====================================================
       RETRY
    ====================================================== */

    const retryButton =
        document.querySelector(
            ".retry-button"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Laporan sedang dicoba kembali."
                );

            }
        );

    }


    /* =====================================================
       PAGINATION
    ====================================================== */

    const paginationButtons =
        document.querySelectorAll(
            ".pagination button"
        );


    paginationButtons.forEach(
        (button) => {

            if (
                button.id ===
                    "previousPage" ||
                button.id ===
                    "nextPage"
            ) {
                return;
            }


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".pagination button"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    showToast(
                        `Halaman ${button.textContent}`
                    );

                }
            );

        }
    );


    /* =====================================================
       PREVIEW
    ====================================================== */

    document
        .querySelector(
            ".preview-actions button"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Preview laporan dibuka."
                );

            }
        );


    document
        .querySelector(
            ".pdf-preview"
        )
        ?.addEventListener(
            "click",
            () => {

                showToast(
                    "Menyiapkan PDF..."
                );

            }
        );


    document
        .querySelector(
            ".excel-preview"
        )
        ?.addEventListener(
            "click",
            () => {

                downloadExcel(
                    "Laporan Harian"
                );

            }
        );


    /* =====================================================
       MAPS
    ====================================================== */

    const mapElement =
        document.getElementById("map");

    if (mapElement && typeof L !== "undefined") {

        const semarangCenter = [-6.9932, 110.4203];
        const isMonitoringMap = Boolean(
            document.querySelector(".map-area")
        );

        const map = L.map(mapElement, {
            zoomControl: true,
            scrollWheelZoom: true
        }).setView(semarangCenter, 12);

        const streetLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        );

        const satelliteLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                attribution: "Tiles &copy; Esri",
                maxZoom: 19
            }
        );

        streetLayer.addTo(map);

        const sensorLocations = [
            { id: "BNA-003", location: "Kali Banjir Kanal Barat", status: "Bahaya", level: "248 cm", updated: "11:12", coords: [-6.9836, 110.4173] },
            { id: "GRC-007", location: "Kali Garang", status: "Siaga", level: "165 cm", updated: "10:48", coords: [-6.9708, 110.4432] },
            { id: "BRG-012", location: "Brongkalan", status: "Waspada", level: "89 cm", updated: "09:32", coords: [-6.9875, 110.4011] },
            { id: "SWO-001", location: "Sungai Muktiharjo", status: "Normal", level: "78 cm", updated: "08:17", coords: [-7.0170, 110.4125] },
            { id: "TM-021", location: "Kali Tinja", status: "Normal", level: "34 cm", updated: "07:56", coords: [-6.9956, 110.4589] },
            { id: "SMG-015", location: "Kali Bringin", status: "Offline", level: "--", updated: "06:05", coords: [-7.0042, 110.3849] }
        ];

        const statusColors = {
            Bahaya: "#df2626",
            Siaga: "#f1781d",
            Waspada: "#d5a900",
            Normal: "#16a957",
            Offline: "#6c737b"
        };

        const markers = L.layerGroup().addTo(map);
        const markerById = new Map();
        const statusButtons = document.querySelectorAll(".status-filter[data-status]");
        const sensorList = document.getElementById("sensorList");
        const sensorCount = document.getElementById("sensorCount");
        const sensorSearch = document.getElementById("sensorSearch");
        const riverFilter = document.getElementById("riverFilter");
        const selectedSensor = document.getElementById("selectedSensor");
        let activeStatus = "all";

        function updateSelectedSensor(sensor) {
            if (!selectedSensor) return;

            if (!sensor) {
                selectedSensor.innerHTML = "<p>Tidak ada sensor yang cocok dengan filter.</p>";
                return;
            }

            const color = statusColors[sensor.status];
            selectedSensor.innerHTML = `
                <div class="selected-title">
                    ${sensor.id}
                    <span class="status-badge" style="background:${color}1A;color:${color};">${sensor.status}</span>
                </div>
                <b>${sensor.location}</b>
                <div class="sensor-metric">
                    <span>⌂ Tinggi muka air</span>
                    <strong>${sensor.level}</strong>
                </div>
                <div class="sensor-metric">
                    <span>◷ Update terakhir</span>
                    <strong>${sensor.updated}</strong>
                </div>
            `;
        }

        function renderSensors() {
            const query = sensorSearch ? sensorSearch.value.trim().toLowerCase() : "";
            const river = riverFilter ? riverFilter.value : "all";
            const filteredSensors = sensorLocations.filter((sensor) => {
                const matchesStatus = activeStatus === "all" || sensor.status === activeStatus;
                const matchesQuery = !query ||
                    `${sensor.id} ${sensor.location} ${sensor.status}`.toLowerCase().includes(query);
                const matchesRiver = river === "all" || sensor.location === river;
                const visibleOnPage = isMonitoringMap || sensor.status !== "Offline";

                return matchesStatus && matchesQuery && matchesRiver && visibleOnPage;
            });

            markers.clearLayers();
            markerById.clear();

            filteredSensors.forEach((sensor) => {
                const marker = L.circleMarker(sensor.coords, {
                    radius: 8,
                    color: "#ffffff",
                    weight: 2,
                    fillColor: statusColors[sensor.status],
                    fillOpacity: 0.9
                })
                    .bindPopup(
                        `<strong>${sensor.id}</strong><br>${sensor.location}<br>Status: ${sensor.status}`
                    )
                    .addTo(markers);

                marker.on("click", () => updateSelectedSensor(sensor));
                markerById.set(sensor.id, marker);
            });

            updateSelectedSensor(filteredSensors[0]);

            if (sensorCount) {
                sensorCount.textContent = `${filteredSensors.length} sensor`;
            }

            if (sensorList) {
                sensorList.innerHTML = filteredSensors.length
                    ? filteredSensors.map((sensor) => `
                        <button class="sensor-item" type="button" data-sensor-id="${sensor.id}">
                            <strong>${sensor.id}</strong>
                            <span class="sensor-status ${sensor.status}">${sensor.status}</span>
                            <p>${sensor.location}</p>
                        </button>
                    `).join("")
                    : '<div class="sensor-item"><p>Tidak ada sensor yang cocok.</p></div>';

                sensorList.querySelectorAll("[data-sensor-id]").forEach((item) => {
                    item.addEventListener("click", () => {
                        const sensor = sensorLocations.find((entry) => entry.id === item.dataset.sensorId);
                        const marker = markerById.get(item.dataset.sensorId);
                        if (!sensor || !marker) return;

                        updateSelectedSensor(sensor);
                        map.setView(sensor.coords, 15);
                        marker.openPopup();
                    });
                });
            }

            statusButtons.forEach((button) => {
                const status = button.dataset.status;
                const count = status === "all"
                    ? sensorLocations.length
                    : sensorLocations.filter((sensor) => sensor.status === status).length;
                const countElement = button.querySelector("b");

                button.classList.toggle("active", status === activeStatus);
                if (countElement) countElement.textContent = count;
            });
        }

        statusButtons.forEach((button) => {
            button.addEventListener("click", () => {
                activeStatus = button.dataset.status || "all";
                renderSensors();
            });
        });

        sensorSearch?.addEventListener("input", renderSensors);
        riverFilter?.addEventListener("change", renderSensors);
        renderSensors();

        const mapButtons = document.querySelectorAll(".map-button[data-map]");
        mapButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const layerName = button.dataset.map;

                if (layerName !== "street" && layerName !== "satellite") {
                    showToast("Layer ini belum tersedia.");
                    return;
                }

                if (layerName === "satellite") {
                    map.removeLayer(streetLayer);
                    satelliteLayer.addTo(map);
                } else {
                    map.removeLayer(satelliteLayer);
                    streetLayer.addTo(map);
                }

                mapButtons.forEach((item) => {
                    item.classList.toggle("active", item === button);
                });
            });
        });

        const fullscreenButtons = [
            document.getElementById("mapFocusButton"),
            document.getElementById("mapFullscreen"),
            document.getElementById("toolFullscreen")
        ].filter(Boolean);

        function invalidateMapSize() {
            window.requestAnimationFrame(() => map.invalidateSize());
        }

        fullscreenButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const mapCard = button.closest(".map-card") ||
                    document.querySelector(".map-area .map-card");

                if (!mapCard) return;

                const isFullscreen = mapCard.classList.toggle("map-fullscreen");
                mapCard.classList.toggle("fullscreen", isFullscreen);
                invalidateMapSize();
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;

            const fullscreenCard = document.querySelector(
                ".map-card.map-fullscreen, .map-card.fullscreen"
            );

            if (fullscreenCard) {
                fullscreenCard.classList.remove("map-fullscreen", "fullscreen");
                invalidateMapSize();
            }
        });

        if ("ResizeObserver" in window) {
            const mapObserver = new ResizeObserver(invalidateMapSize);
            mapObserver.observe(mapElement);
        } else {
            window.addEventListener("resize", invalidateMapSize);
        }

        const resetMapButton = document.getElementById("resetMap");
        if (resetMapButton) {
            resetMapButton.addEventListener("click", () => {
                map.setView(semarangCenter, 12);
                markers.eachLayer((marker) => marker.closePopup());
            });
        }

        const locationButton = document.getElementById("locationButton");
        const locationText = document.getElementById("locationText");
        if (locationButton) {
            locationButton.addEventListener("click", () => {
                if (!navigator.geolocation) {
                    showToast("Browser tidak mendukung lokasi perangkat.");
                    return;
                }

                navigator.geolocation.getCurrentPosition(
                    ({ coords }) => {
                        const position = [coords.latitude, coords.longitude];
                        map.setView(position, 15);
                        L.circleMarker(position, {
                            radius: 7,
                            color: "#ffffff",
                            weight: 2,
                            fillColor: "#2771df",
                            fillOpacity: 1
                        })
                            .bindPopup("Lokasi Anda")
                            .addTo(map)
                            .openPopup();

                        if (locationText) locationText.textContent = "Lokasi ditemukan";
                    },
                    () => showToast("Lokasi tidak tersedia atau izin ditolak."),
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            });
        }
    }

});

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       TOAST
    ====================================================== */

    const toast = document.getElementById("toast");
    const historyPage = Boolean(
        document.getElementById("historyTable")
    );

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(window.toastTimer);

        window.toastTimer = setTimeout(() => {

            toast.classList.remove("show");

        }, 2200);
    }


    /* =====================================================
       ACCOUNT MENU
    ====================================================== */

    const accountButton =
        document.getElementById("accountButton");

    const accountMenu =
        document.getElementById("accountMenu");


    if (accountButton && accountMenu) {

        accountButton.addEventListener("click", (event) => {

            event.stopPropagation();

            accountMenu.classList.toggle("show");

        });


        document.addEventListener("click", (event) => {

            if (
                !accountMenu.contains(event.target) &&
                !accountButton.contains(event.target)
            ) {

                accountMenu.classList.remove("show");

            }

        });

    }


    /* =====================================================
       NAVIGATION
       
       PENTING:
       Jangan preventDefault.
       href menentukan halaman sebenarnya.
    ====================================================== */

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            navItems.forEach((nav) => {

                nav.classList.remove("active");

            });

            item.classList.add("active");

        });

    });

    const settingsButtons = document.querySelectorAll(".settings-main");
    settingsButtons.forEach((button) => {
        const section = button.closest(".settings-section");
        const submenu = section?.querySelector(".submenu");
        const arrow = button.querySelector(".arrow");
        if (!submenu) return;

        button.setAttribute("aria-expanded", String(submenu.classList.contains("open")));
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = submenu.classList.toggle("open");
            button.setAttribute("aria-expanded", String(isOpen));
            if (arrow) arrow.textContent = isOpen ? "⌄" : "›";
        });
    });

    document.addEventListener("click", (event) => {
        document.querySelectorAll(".settings-section").forEach((section) => {
            if (section.contains(event.target)) return;
            const button = section.querySelector(".settings-main");
            const submenu = section.querySelector(".submenu");
            if (!button || !submenu) return;

            submenu.classList.remove("open");
            button.setAttribute("aria-expanded", "false");
            const arrow = button.querySelector(".arrow");
            if (arrow) arrow.textContent = "›";
        });
    });


    if (!historyPage) return;


    /* =====================================================
       DATE RANGE
    ====================================================== */

    const dateButtons =
        document.querySelectorAll(".date-button");


    dateButtons.forEach((button) => {

        button.addEventListener("click", () => {

            dateButtons.forEach((btn) => {

                btn.classList.remove("active");

            });

            button.classList.add("active");


            const range =
                button.dataset.range;


            if (range === "today") {

                showToast(
                    "Menampilkan data hari ini."
                );

            }

            else if (range === "7") {

                showToast(
                    "Rentang data 7 hari."
                );

            }

            else if (range === "30") {

                showToast(
                    "Rentang data 30 hari."
                );

            }

            else if (range === "custom") {

                showToast(
                    "Mode rentang tanggal kustom dipilih."
                );

            }

        });

    });


    /* =====================================================
       SENSOR FILTER
    ====================================================== */

    const sensorFilter =
        document.getElementById("sensorFilter");


    if (sensorFilter) {

        sensorFilter.addEventListener(
            "change",
            () => {

                const value =
                    sensorFilter.value;

                showToast(
                    value === "all"
                        ? "Semua sensor dipilih."
                        : `Sensor ${value} dipilih.`
                );

            }
        );

    }


    /* =====================================================
       DATA CHECKBOX
    ====================================================== */

    document
        .querySelectorAll(
            ".checkbox-grid input"
        )
        .forEach((checkbox) => {

            checkbox.addEventListener(
                "change",
                () => {

                    const total =
                        document.querySelectorAll(
                            ".checkbox-grid input:checked"
                        ).length;

                    showToast(
                        `${total} jenis data dipilih.`
                    );

                }
            );

        });


    /* =====================================================
       INTERVAL
    ====================================================== */

    document
        .querySelectorAll(
            'input[name="interval"]'
        )
        .forEach((radio) => {

            radio.addEventListener(
                "change",
                () => {

                    showToast(
                        `Interval ${radio.parentElement.textContent.trim()} dipilih.`
                    );

                }
            );

        });


    /* =====================================================
       EXPORT DATA
    ====================================================== */

    const exportData =
        document.getElementById("exportData");


    if (exportData) {

        exportData.addEventListener(
            "click",
            () => {

                exportHistoryCSV();

            }
        );

    }


    /* =====================================================
       EXPORT CSV TABLE
    ====================================================== */

    const exportCsv =
        document.getElementById("exportCsv");


    if (exportCsv) {

        exportCsv.addEventListener(
            "click",
            () => {

                exportHistoryCSV();

            }
        );

    }


    function exportHistoryCSV() {

        const table =
            document.getElementById(
                "historyTable"
            );

        if (!table) return;


        const rows =
            table.querySelectorAll("tr");

        const csv = [];


        rows.forEach((row) => {

            const cells =
                row.querySelectorAll(
                    "th, td"
                );

            const rowData = [];


            cells.forEach((cell) => {

                const checkbox =
                    cell.querySelector(
                        "input"
                    );

                if (checkbox) {

                    rowData.push("");

                    return;
                }


                const text =
                    cell.innerText
                        .replace(/\n/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();


                rowData.push(
                    `"${text.replace(
                        /"/g,
                        '""'
                    )}"`
                );

            });


            csv.push(
                rowData.join(",")
            );

        });


        const blob =
            new Blob(
                [
                    "\ufeff" +
                    csv.join("\n")
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "riwayat-data.csv";


        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);


        showToast(
            "Data berhasil diekspor ke CSV."
        );

    }


    /* =====================================================
       SELECT ALL
    ====================================================== */

    const selectAll =
        document.getElementById(
            "selectAll"
        );


    const rowCheckboxes =
        document.querySelectorAll(
            "#historyTable tbody input[type='checkbox']"
        );


    if (selectAll) {

        selectAll.addEventListener(
            "change",
            () => {

                rowCheckboxes.forEach(
                    checkbox => {

                        checkbox.checked =
                            selectAll.checked;

                    }
                );


                updateSelectedCount();

            }
        );

    }


    rowCheckboxes.forEach((checkbox) => {

        checkbox.addEventListener(
            "change",
            updateSelectedCount
        );

    });


    function updateSelectedCount() {

        const selected =
            document.querySelectorAll(
                "#historyTable tbody input[type='checkbox']:checked"
            ).length;


        const label =
            selectAll
                ?.closest("label");


        if (label) {

            label.lastChild.textContent =
                ` Pilih Semua (${selected})`;

        }

    }


    /* =====================================================
       PAGINATION
    ====================================================== */

    const paginationButtons =
        document.querySelectorAll(
            ".pagination button"
        );


    paginationButtons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.textContent === "‹" ||
                    button.textContent === "›" ||
                    button.textContent === "..."
                ) {

                    showToast(
                        "Navigasi halaman."
                    );

                    return;

                }


                paginationButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                showToast(
                    `Halaman ${button.textContent}`
                );

            }
        );

    });


    /* =====================================================
       MAP
    ====================================================== */

    let historyMap = null;


    if (
        typeof L !== "undefined" &&
        document.getElementById("historyMap")
    ) {

        historyMap =
            L.map(
                "historyMap",
                {
                    zoomControl: true
                }
            ).setView(
                [-6.966667, 110.416664],
                12
            );


        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(historyMap);


        const sensors = [

            {
                id: "BNA-003",
                name: "Kali Banjir Kanal Barat",
                lat: -6.9734,
                lng: 110.3952,
                value: "248 cm",
                status: "Bahaya"
            },

            {
                id: "GRG-007",
                name: "Kali Garang",
                lat: -7.0025,
                lng: 110.3985,
                value: "165 cm",
                status: "Siaga"
            },

            {
                id: "BRG-012",
                name: "Kali Bringin",
                lat: -6.9701,
                lng: 110.4258,
                value: "89 cm",
                status: "Waspada"
            },

            {
                id: "W-02",
                name: "Sungai Muktiharjo",
                lat: -6.9728,
                lng: 110.4545,
                value: "62 cm",
                status: "Normal"
            },

            {
                id: "W-03",
                name: "Kali Tinja",
                lat: -6.9502,
                lng: 110.4355,
                value: "42 cm",
                status: "Normal"
            }

        ];


        sensors.forEach((sensor) => {

            const marker =
                L.marker([
                    sensor.lat,
                    sensor.lng
                ]).addTo(historyMap);


            marker.bindPopup(`
                <strong>${sensor.id}</strong>
                <br>
                ${sensor.name}
                <br>
                Tinggi Air: ${sensor.value}
                <br>
                Status: ${sensor.status}
            `);

        });


        setTimeout(() => {

            historyMap.invalidateSize();

        }, 300);


        window.addEventListener(
            "resize",
            () => {

                historyMap.invalidateSize();

            }
        );

    }


    /* =====================================================
       VIEW MAP
    ====================================================== */

    const viewMap =
        document.getElementById(
            "viewMap"
        );


    if (viewMap) {

        viewMap.addEventListener(
            "click",
            () => {

                window.location.href =
                    "peta-monitoring.html";

            }
        );

    }


    /* =====================================================
       OPEN FILE
    ====================================================== */

    const openFile =
        document.getElementById(
            "openFile"
        );


    if (openFile) {

        openFile.addEventListener(
            "click",
            () => {

                showToast(
                    "File ekspor dibuka."
                );

            }
        );

    }


    /* =====================================================
       GLOBAL SEARCH
    ====================================================== */

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    if (globalSearch) {

        globalSearch.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    const keyword =
                        globalSearch.value.trim();


                    if (keyword !== "") {

                        showToast(
                            `Mencari "${keyword}"`
                        );

                    }

                }

            }
        );

    }

});


document.addEventListener("DOMContentLoaded", () => {

    const alerts = [

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "BNA-003",
            location: "Kali Banjir Kanal Barat",
            title: "Tinggi air mencapai 248 cm",
            value: "248 cm / 200 cm",
            time: "10:48",
            ago: "(36 menit lalu)",
            status: "Belum ditangani",
            person: "-",
            action: "Tandai Diproses"
        },

        {
            level: "Sedang",
            type: "Tinggi Air",
            sensor: "SMG-015",
            location: "Sungai Muktiharjo",
            title: "Curah hujan intensitas tinggi",
            value: "78 mm / 50 mm",
            time: "09:32",
            ago: "(1 jam lalu)",
            status: "Diproses",
            person: "Andi Pratama",
            action: "Tandai Diproses"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "GRG-007",
            location: "Kali Garang",
            title: "Tinggi air mencapai 165 cm",
            value: "165 cm / 120 cm",
            time: "08:17",
            ago: "(2 jam lalu)",
            status: "Belum ditangani",
            person: "-",
            action: "Tandai Diproses"
        },

        {
            level: "Sedang",
            type: "Curah Hujan",
            sensor: "TMR-021",
            location: "Kali Timo",
            title: "Curah hujan meningkat",
            value: "45 mm / 30 mm",
            time: "07:56",
            ago: "(3 jam lalu)",
            status: "Diproses",
            person: "Siti Rahayu",
            action: "Tandai Diproses"
        },

        {
            level: "Offline",
            type: "Offline",
            sensor: "KDL-008",
            location: "Kali Kembangarum",
            title: "Sensor offline",
            value: "- / -",
            time: "07:42",
            ago: "(3 jam lalu)",
            status: "Belum ditangani",
            person: "-",
            action: "Tugaskan"
        },

        {
            level: "Baterai",
            type: "Baterai",
            sensor: "BRG-012",
            location: "Kali Bringin",
            title: "Baterai lemah (12%)",
            value: "12% / 20%",
            time: "06:18",
            ago: "(5 jam lalu)",
            status: "Diproses",
            person: "Budi Santoso",
            action: "Tandai Diproses"
        },

        {
            level: "Sedang",
            type: "Tinggi Air",
            sensor: "BNA-003",
            location: "Kali Banjir Kanal Barat",
            title: "Tinggi air mencapai 132 cm",
            value: "132 cm / 120 cm",
            time: "04:50",
            ago: "(7 jam lalu)",
            status: "Selesai",
            person: "Rizky Maulana",
            action: "Lihat Detail"
        },

        {
            level: "Offline",
            type: "Offline",
            sensor: "GRG-007",
            location: "Kali Garang",
            title: "Sensor offline",
            value: "- / -",
            time: "02:36",
            ago: "(9 jam lalu)",
            status: "Selesai",
            person: "-",
            action: "Lihat Detail"
        },

        {
            level: "Baterai",
            type: "Baterai",
            sensor: "SMG-015",
            location: "Sungai Muktiharjo",
            title: "Baterai lemah (15%)",
            value: "15% / 20%",
            time: "00:12",
            ago: "(11 jam lalu)",
            status: "Diproses",
            person: "Dewi Lestari",
            action: "Tandai Diproses"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "TMR-021",
            location: "Kali Timo",
            title: "Tinggi air mencapai 210 cm",
            value: "210 cm / 150 cm",
            time: "Kemarin 21:37",
            ago: "(14 jam lalu)",
            status: "Selesai",
            person: "Ahmad Fauzi",
            action: "Lihat Detail"
        },

        {
            level: "Sedang",
            type: "Tinggi Air",
            sensor: "W-02",
            location: "Sungai Muktiharjo",
            title: "Tinggi air meningkat",
            value: "82 cm / 70 cm",
            time: "Kemarin 20:15",
            ago: "(15 jam lalu)",
            status: "Diproses",
            person: "-",
            action: "Tandai Diproses"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "BNA-003",
            location: "Kali Banjir Kanal Barat",
            title: "Tinggi air mencapai 220 cm",
            value: "220 cm / 200 cm",
            time: "Kemarin 19:02",
            ago: "(16 jam lalu)",
            status: "Selesai",
            person: "Rizky Maulana",
            action: "Lihat Detail"
        },

        {
            level: "Sedang",
            type: "Curah Hujan",
            sensor: "GRG-007",
            location: "Kali Garang",
            title: "Curah hujan meningkat",
            value: "38 mm / 30 mm",
            time: "Kemarin 18:20",
            ago: "(17 jam lalu)",
            status: "Diproses",
            person: "-",
            action: "Tandai Diproses"
        },

        {
            level: "Baterai",
            type: "Baterai",
            sensor: "KDL-008",
            location: "Kali Kembangarum",
            title: "Baterai lemah (18%)",
            value: "18% / 20%",
            time: "Kemarin 17:10",
            ago: "(18 jam lalu)",
            status: "Selesai",
            person: "Budi Santoso",
            action: "Lihat Detail"
        },

        {
            level: "Offline",
            type: "Offline",
            sensor: "BRG-012",
            location: "Kali Bringin",
            title: "Sensor offline",
            value: "- / -",
            time: "Kemarin 16:40",
            ago: "(19 jam lalu)",
            status: "Selesai",
            person: "-",
            action: "Lihat Detail"
        },

        {
            level: "Sedang",
            type: "Tinggi Air",
            sensor: "SMG-015",
            location: "Sungai Muktiharjo",
            title: "Tinggi air meningkat",
            value: "75 cm / 70 cm",
            time: "Kemarin 15:35",
            ago: "(20 jam lalu)",
            status: "Diproses",
            person: "Andi Pratama",
            action: "Tandai Diproses"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "GRG-007",
            location: "Kali Garang",
            title: "Tinggi air mencapai 155 cm",
            value: "155 cm / 120 cm",
            time: "Kemarin 14:20",
            ago: "(21 jam lalu)",
            status: "Belum ditangani",
            person: "-",
            action: "Tandai Diproses"
        },

        {
            level: "Baterai",
            type: "Baterai",
            sensor: "TMR-021",
            location: "Kali Timo",
            title: "Baterai lemah (14%)",
            value: "14% / 20%",
            time: "Kemarin 13:15",
            ago: "(22 jam lalu)",
            status: "Diproses",
            person: "Dewi Lestari",
            action: "Tandai Diproses"
        },

        {
            level: "Sedang",
            type: "Curah Hujan",
            sensor: "BRG-012",
            location: "Kali Bringin",
            title: "Curah hujan meningkat",
            value: "42 mm / 30 mm",
            time: "Kemarin 12:10",
            ago: "(23 jam lalu)",
            status: "Selesai",
            person: "-",
            action: "Lihat Detail"
        },

        {
            level: "Offline",
            type: "Offline",
            sensor: "KDL-008",
            location: "Kali Kembangarum",
            title: "Sensor offline",
            value: "- / -",
            time: "Kemarin 11:30",
            ago: "(1 hari lalu)",
            status: "Selesai",
            person: "-",
            action: "Lihat Detail"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "BNA-003",
            location: "Kali Banjir Kanal Barat",
            title: "Tinggi air mencapai 238 cm",
            value: "238 cm / 200 cm",
            time: "Kemarin 10:20",
            ago: "(1 hari lalu)",
            status: "Diproses",
            person: "Rizky Maulana",
            action: "Tandai Diproses"
        },

        {
            level: "Sedang",
            type: "Tinggi Air",
            sensor: "W-02",
            location: "Sungai Muktiharjo",
            title: "Tinggi air meningkat",
            value: "80 cm / 70 cm",
            time: "Kemarin 09:12",
            ago: "(1 hari lalu)",
            status: "Selesai",
            person: "-",
            action: "Lihat Detail"
        },

        {
            level: "Baterai",
            type: "Baterai",
            sensor: "SMG-015",
            location: "Sungai Muktiharjo",
            title: "Baterai lemah (16%)",
            value: "16% / 20%",
            time: "Kemarin 08:05",
            ago: "(1 hari lalu)",
            status: "Selesai",
            person: "Dewi Lestari",
            action: "Lihat Detail"
        },

        {
            level: "Tinggi",
            type: "Tinggi Air",
            sensor: "TMR-021",
            location: "Kali Timo",
            title: "Tinggi air mencapai 180 cm",
            value: "180 cm / 150 cm",
            time: "Kemarin 07:00",
            ago: "(1 hari lalu)",
            status: "Belum ditangani",
            person: "-",
            action: "Tandai Diproses"
        }

    ];


    const body =
        document.getElementById("alertBody");

    const count =
        document.getElementById("resultCount");

    const pageInfo =
        document.getElementById("pageInfo");

    const pagination =
        document.getElementById("pagination");

    const levelFilter =
        document.getElementById("levelFilter");

    const sensorFilter =
        document.getElementById("sensorFilter");

    const typeFilter =
        document.getElementById("typeFilter");

    const search =
        document.getElementById("globalSearch");

    const rowsSelect =
        document.getElementById("rowsPerPage");

    const toast =
        document.getElementById("toast");

    const requiredAlertElements = [
        body,
        count,
        pageInfo,
        pagination,
        levelFilter,
        sensorFilter,
        typeFilter,
        search,
        rowsSelect,
        toast,
        document.getElementById("applyFilter"),
        document.getElementById("resetFilter"),
        document.getElementById("checkAll"),
        document.getElementById("dateFilter"),
        document.getElementById("backDashboard")
    ];

    if (requiredAlertElements.some((element) => !element)) return;


    let activeStatus = "all";

    let currentPage = 1;

    let filtered = [...alerts];


    /* =========================
       TOAST
    ========================= */

    function showToast(message) {

        toast.textContent = message;

        toast.classList.add("show");

        clearTimeout(window.toastTimer);

        window.toastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2200);
    }


    /* =========================
       LEVEL
    ========================= */

    function levelClass(level) {

        return level.toLowerCase();

    }


    function levelSymbol(level) {

        if (level === "Tinggi") {
            return "△";
        }

        if (level === "Baterai") {
            return "⌁";
        }

        if (level === "Offline") {
            return "i";
        }

        return "×";

    }


    /* =========================
       STATUS
    ========================= */

    function statusClass(status) {

        if (status === "Selesai") {
            return "done";
        }

        if (status === "Diproses") {
            return "processing";
        }

        return "pending";

    }


    /* =========================
       RENDER
    ========================= */

    function render() {

        const perPage =
            Number(rowsSelect.value);

        const total =
            filtered.length;

        const pages =
            Math.max(
                1,
                Math.ceil(total / perPage)
            );


        if (currentPage > pages) {
            currentPage = pages;
        }


        const start =
            (currentPage - 1) * perPage;

        const rows =
            filtered.slice(
                start,
                start + perPage
            );


        body.innerHTML =
            rows.map(alert => `

                <tr>

                    <td class="check-col">
                        <input
                            type="checkbox"
                            class="row-check"
                        >
                    </td>

                    <td>

                        <div class="level ${levelClass(alert.level)}">

                            <span class="level-icon">
                                ${levelSymbol(alert.level)}
                            </span>

                            <span>
                                ${alert.level}
                            </span>

                        </div>

                    </td>

                    <td>
                        ${alert.title}
                    </td>

                    <td>
                        <b>${alert.sensor}</b><br>
                        ${alert.location}
                    </td>

                    <td>
                        ${alert.value}
                    </td>

                    <td>
                        ${alert.time}<br>
                        ${alert.ago}
                    </td>

                    <td>

                        <span
                            class="status-text ${statusClass(alert.status)}"
                        >
                            ${alert.status}
                        </span>

                    </td>

                    <td>
                        ${alert.person}
                    </td>

                    <td>

                        <button
                            class="action-btn ${
                                alert.action === "Lihat Detail"
                                ? "detail"
                                : ""
                            }"
                            data-action="${alert.action}"
                        >
                            ${alert.action}
                        </button>

                    </td>

                    <td>

                        <button
                            class="more-btn"
                            data-more="${alert.sensor}"
                        >
                            ⋮
                        </button>

                    </td>

                </tr>

            `).join("");


        count.textContent = total;


        if (total) {

            pageInfo.textContent =
                `Menampilkan ${start + 1} - ${
                    Math.min(
                        start + perPage,
                        total
                    )
                } dari ${total} Alert`;

        } else {

            pageInfo.textContent =
                "Tidak ada alert";

            body.innerHTML = `
                <tr>
                    <td
                        colspan="10"
                        style="
                            text-align:center;
                            padding:30px
                        "
                    >
                        Tidak ada alert
                        yang sesuai dengan filter.
                    </td>
                </tr>
            `;

        }


        pagination.innerHTML = "";


        for (
            let page = 1;
            page <= pages;
            page++
        ) {

            if (page > 6) {
                break;
            }


            const button =
                document.createElement("button");

            button.textContent = page;


            if (page === currentPage) {
                button.className = "current";
            }


            button.onclick = () => {

                currentPage = page;

                render();

            };


            pagination.appendChild(button);

        }


        if (pages > 6) {

            const dots =
                document.createElement("span");

            dots.textContent = "…";

            pagination.appendChild(dots);


            const last =
                document.createElement("button");

            last.textContent = pages;

            last.onclick = () => {

                currentPage = pages;

                render();

            };


            pagination.appendChild(last);

        }

    }


    /* =========================
       FILTER
    ========================= */

    function applyFilters() {

        const level =
            levelFilter.value;

        const sensor =
            sensorFilter.value;

        const type =
            typeFilter.value;

        const query =
            search.value
                .trim()
                .toLowerCase();


        filtered =
            alerts.filter(alert => {

                const statusOk =
                    activeStatus === "all" ||

                    (
                        activeStatus === "pending" &&
                        alert.status === "Belum ditangani"
                    ) ||

                    (
                        activeStatus === "processing" &&
                        alert.status === "Diproses"
                    ) ||

                    (
                        activeStatus === "done" &&
                        alert.status === "Selesai"
                    );


                const levelOk =
                    level === "all" ||
                    alert.level === level;


                const sensorOk =
                    sensor === "all" ||
                    alert.sensor === sensor;


                const typeOk =
                    type === "all" ||
                    alert.type === type;


                const searchOk =
                    !query ||

                    `${alert.sensor}
                    ${alert.location}
                    ${alert.title}`
                        .toLowerCase()
                        .includes(query);


                return (
                    statusOk &&
                    levelOk &&
                    sensorOk &&
                    typeOk &&
                    searchOk
                );

            });


        currentPage = 1;

        render();

    }


    /* =========================
       TABS
    ========================= */

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".tab")
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    tab.classList.add("active");


                    activeStatus =
                        tab.dataset.status;


                    applyFilters();

                }
            );

        });


    /* =========================
       FILTER BUTTON
    ========================= */

    document
        .getElementById("applyFilter")
        .addEventListener(
            "click",
            () => {

                applyFilters();

                showToast(
                    "Filter berhasil diterapkan"
                );

            }
        );


    document
        .getElementById("resetFilter")
        .addEventListener(
            "click",
            () => {

                levelFilter.value = "all";

                sensorFilter.value = "all";

                typeFilter.value = "all";

                search.value = "";

                activeStatus = "all";


                document
                    .querySelectorAll(".tab")
                    .forEach(tab => {

                        tab.classList.toggle(
                            "active",
                            tab.dataset.status === "all"
                        );

                    });


                applyFilters();

                showToast(
                    "Filter berhasil direset"
                );

            }
        );


    /* =========================
       SELECT FILTER
    ========================= */

    [
        levelFilter,
        sensorFilter,
        typeFilter
    ].forEach(element => {

        element.addEventListener(
            "change",
            applyFilters
        );

    });


    rowsSelect.addEventListener(
        "change",
        () => {

            currentPage = 1;

            render();

        }
    );


    /* =========================
       SEARCH
    ========================= */

    search.addEventListener(
        "input",
        applyFilters
    );


    /* =========================
       CHECK ALL
    ========================= */

    document
        .getElementById("checkAll")
        .addEventListener(
            "change",
            event => {

                document
                    .querySelectorAll(".row-check")
                    .forEach(
                        checkbox =>
                            checkbox.checked =
                                event.target.checked
                    );

            }
        );


    /* =========================
       TABLE ACTION
    ========================= */

    body.addEventListener(
        "click",
        event => {

            const action =
                event.target.closest(
                    "[data-action]"
                );

            const more =
                event.target.closest(
                    "[data-more]"
                );


            if (action) {

                showToast(
                    `${action.dataset.action}
                    berhasil dipilih`
                );

            }


            if (more) {

                showToast(
                    `Menu ${more.dataset.more}
                    dibuka`
                );

            }

        }
    );


    /* =========================
       OTHER BUTTONS
    ========================= */

    document
        .getElementById("dateFilter")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "Pemilih tanggal dibuka"
                );

            }
        );


    document
        .getElementById("backDashboard")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "index.html";

            }
        );


    /* =========================
       NAVIGATION
    ========================= */

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".nav-item")
                        .forEach(nav =>
                            nav.classList.remove(
                                "active"
                            )
                        );

                    item.classList.add("active");

                }
            );

        });


    /* =========================
       INITIAL RENDER
    ========================= */

    render();

});

const alerts = [
    {
        level: "Tinggi",
        type: "Tinggi Air",
        sensor: "BNA-003",
        location: "Kali Banjir Kanal Barat",
        title: "Tinggi air mencapai 248 cm",
        value: "248 cm / 200 cm",
        time: "10:48",
        ago: "(36 menit lalu)",
        status: "Belum ditangani",
        person: "-",
        action: "Tandai Diproses"
    },

    {
        level: "Sedang",
        type: "Curah Hujan",
        sensor: "SMG-015",
        location: "Sungai Muktiharjo",
        title: "Curah hujan intensitas tinggi",
        value: "78 mm / 50 mm",
        time: "09:32",
        ago: "(1 jam lalu)",
        status: "Diproses",
        person: "Andi Pratama",
        action: "Tandai Diproses"
    },

    {
        level: "Tinggi",
        type: "Tinggi Air",
        sensor: "GRG-007",
        location: "Kali Garang",
        title: "Tinggi air mencapai 165 cm",
        value: "165 cm / 120 cm",
        time: "08:17",
        ago: "(2 jam lalu)",
        status: "Belum ditangani",
        person: "-",
        action: "Tandai Diproses"
    },

    {
        level: "Sedang",
        type: "Curah Hujan",
        sensor: "TMR-021",
        location: "Kali Timo",
        title: "Curah hujan meningkat",
        value: "45 mm / 30 mm",
        time: "07:56",
        ago: "(3 jam lalu)",
        status: "Diproses",
        person: "Siti Rahayu",
        action: "Tandai Diproses"
    },

    {
        level: "Offline",
        type: "Offline",
        sensor: "KDL-008",
        location: "Kali Kembangarum",
        title: "Sensor offline",
        value: "- / -",
        time: "07:42",
        ago: "(3 jam lalu)",
        status: "Belum ditangani",
        person: "-",
        action: "Tugaskan"
    },

    {
        level: "Baterai",
        type: "Baterai",
        sensor: "BRG-012",
        location: "Kali Bringin",
        title: "Baterai lemah (12%)",
        value: "12% / 20%",
        time: "06:18",
        ago: "(5 jam lalu)",
        status: "Diproses",
        person: "Budi Santoso",
        action: "Tandai Diproses"
    },

    {
        level: "Sedang",
        type: "Tinggi Air",
        sensor: "BNA-003",
        location: "Kali Banjir Kanal Barat",
        title: "Tinggi air mencapai 132 cm",
        value: "132 cm / 120 cm",
        time: "04:50",
        ago: "(7 jam lalu)",
        status: "Selesai",
        person: "Rizky Maulana",
        action: "Lihat Detail"
    },

    {
        level: "Offline",
        type: "Offline",
        sensor: "GRG-007",
        location: "Kali Garang",
        title: "Sensor offline",
        value: "- / -",
        time: "02:36",
        ago: "(9 jam lalu)",
        status: "Selesai",
        person: "-",
        action: "Lihat Detail"
    },

    {
        level: "Baterai",
        type: "Baterai",
        sensor: "SMG-015",
        location: "Sungai Muktiharjo",
        title: "Baterai lemah (15%)",
        value: "15% / 20%",
        time: "00:12",
        ago: "(11 jam lalu)",
        status: "Diproses",
        person: "Dewi Lestari",
        action: "Tandai Diproses"
    },

    {
        level: "Tinggi",
        type: "Tinggi Air",
        sensor: "TMR-021",
        location: "Kali Timo",
        title: "Tinggi air mencapai 210 cm",
        value: "210 cm / 150 cm",
        time: "Kemarin 21:37",
        ago: "(14 jam lalu)",
        status: "Selesai",
        person: "Ahmad Fauzi",
        action: "Lihat Detail"
    }
];

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       DATA PERANGKAT
    ========================================= */

    const devices = [
        {
            id: "DEV-001",
            location: "Kali Banjir Kanal Barat",
            type: "Water Level",
            guid: "GK-001-7789",
            firmware: "v1.2.3",
            status: "Online",
            last: "26 Jun 2026 10:42"
        },
        {
            id: "DEV-002",
            location: "Sungai Muktiharjo",
            type: "Rain Gauge",
            guid: "GK-002-4412",
            firmware: "v1.1.8",
            status: "Online",
            last: "26 Jun 2026 09:17"
        },
        {
            id: "DEV-003",
            location: "Kali Garang",
            type: "Water Level",
            guid: "GK-003-9921",
            firmware: "v1.2.3",
            status: "Offline",
            last: "25 Jun 2026 21:03"
        },
        {
            id: "DEV-004",
            location: "Kali Timo",
            type: "Rain Gauge",
            guid: "GK-004-6655",
            firmware: "v1.1.5",
            status: "Online",
            last: "26 Jun 2026 08:56"
        },
        {
            id: "DEV-005",
            location: "Kali Kembangarum",
            type: "Water Level",
            guid: "GK-005-6655",
            firmware: "v1.2.0",
            status: "Online",
            last: "26 Jun 2026 10:11"
        },
        {
            id: "DEV-006",
            location: "Sungai Bringin",
            type: "Water Level",
            guid: "GK-006-7780",
            firmware: "v1.2.1",
            status: "Offline",
            last: "24 Jun 2026 16:20"
        },
        {
            id: "DEV-007",
            location: "Semarang Timur",
            type: "Rain Gauge",
            guid: "GK-007-6523",
            firmware: "v1.1.9",
            status: "Online",
            last: "26 Jun 2026 09:34"
        },
        {
            id: "DEV-008",
            location: "Kali Simongan",
            type: "Water Level",
            guid: "GK-008-7741",
            firmware: "v1.2.3",
            status: "Online",
            last: "26 Jun 2026 10:26"
        },
        {
            id: "DEV-009",
            location: "Kali Bringin",
            type: "Water Level",
            guid: "GK-009-2254",
            firmware: "v1.2.2",
            status: "Maintenance",
            last: "23 Jun 2026 13:10"
        },
        {
            id: "DEV-010",
            location: "Kali Tuntang",
            type: "Rain Gauge",
            guid: "GK-010-8921",
            firmware: "v1.1.7",
            status: "Online",
            last: "26 Jun 2026 07:52"
        }
    ];


    /* =========================================
       ELEMENT
    ========================================= */

    const table = document.getElementById("deviceTable");
    const deviceSearch = document.getElementById("deviceSearch");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");
    const locationFilter = document.getElementById("locationFilter");

    const toast = document.getElementById("toast");

    if (!table || !deviceSearch || !statusFilter || !typeFilter || !locationFilter) return;


    /* =========================================
       TOAST
    ========================================= */

    function showToast(message) {

        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }


    /* =========================================
       STATUS CLASS
    ========================================= */

    function getStatusClass(status) {

        if (status === "Online") return "online";
        if (status === "Offline") return "offline";

        return "maintenance";
    }


    /* =========================================
       RENDER TABLE
    ========================================= */

    function renderTable() {

        const search =
            deviceSearch.value.toLowerCase().trim();

        const status =
            statusFilter.value;

        const type =
            typeFilter.value;

        const location =
            locationFilter.value;


        const filtered = devices.filter(device => {

            const searchMatch =
                device.id.toLowerCase().includes(search) ||
                device.location.toLowerCase().includes(search) ||
                device.guid.toLowerCase().includes(search) ||
                device.type.toLowerCase().includes(search);

            const statusMatch =
                status === "all" ||
                device.status === status;

            const typeMatch =
                type === "all" ||
                device.type === type;

            const locationMatch =
                location === "all" ||
                device.location === location;

            return (
                searchMatch &&
                statusMatch &&
                typeMatch &&
                locationMatch
            );
        });


        table.innerHTML = "";


        filtered.forEach(device => {

            const tr = document.createElement("tr");

            const statusClass =
                getStatusClass(device.status);

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="check">
                </td>

                <td>
                    <span class="device-id">
                        ${device.id}
                    </span>
                </td>

                <td>
                    <div class="device-location">
                        ${device.location}
                    </div>
                </td>

                <td>
                    ${device.type}
                </td>

                <td>
                    ${device.guid}
                </td>

                <td>
                    ${device.firmware}
                </td>

                <td>
                    <div class="connection">
                        <span class="connection-dot ${statusClass}">
                        </span>

                        <span class="connection-text ${statusClass}-text">
                            ${device.status}
                        </span>
                    </div>
                </td>

                <td>
                    ${device.last}
                </td>

                <td>
                    <div class="action-buttons">

                        <button
                            class="action-btn edit-btn"
                            data-id="${device.id}"
                            title="Edit"
                        >
                            ✎
                        </button>

                        <button
                            class="action-btn more-btn"
                            data-id="${device.id}"
                            title="Menu"
                        >
                            ⋮
                        </button>

                    </div>
                </td>
            `;

            table.appendChild(tr);
        });


        document.getElementById("tableInfo").textContent =
            `Menampilkan 1 - ${filtered.length} dari 24 Perangkat`;


        bindTableButtons();
    }


    /* =========================================
       TABLE BUTTONS
    ========================================= */

    function bindTableButtons() {

        document.querySelectorAll(".edit-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const id =
                        button.dataset.id;

                    showToast(
                        `Membuka perangkat ${id}`
                    );
                });
            });


        document.querySelectorAll(".more-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const id =
                        button.dataset.id;

                    showToast(
                        `Menu perangkat ${id}`
                    );
                });
            });
    }


    /* =========================================
       FILTER
    ========================================= */

    deviceSearch.addEventListener(
        "input",
        renderTable
    );

    statusFilter.addEventListener(
        "change",
        renderTable
    );

    typeFilter.addEventListener(
        "change",
        renderTable
    );

    locationFilter.addEventListener(
        "change",
        renderTable
    );


    /* =========================================
       NAVIGATION
    ========================================= */

    document.querySelectorAll(
        ".nav-item[href], .submenu-item"
    ).forEach(item => {

        item.addEventListener("click", event => {

            const href =
                item.getAttribute("href");

            if (!href || href === "#") {
                return;
            }

            // biarkan browser pindah halaman
        });
    });


    /* =========================================
       GLOBAL SEARCH
    ========================================= */

    const globalSearch =
        document.getElementById("globalSearch");

    globalSearch.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") {
                return;
            }

            const value =
                globalSearch.value.trim();

            if (!value) {
                return;
            }

            deviceSearch.value = value;

            renderTable();

            document
                .querySelector(".device-card")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            showToast(
                `Mencari: ${value}`
            );
        }
    );


    /* =========================================
       PAGINATION
    ========================================= */

    document.querySelectorAll(
        ".pagination button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.textContent === "‹" ||
                    button.textContent === "›"
                ) {
                    showToast(
                        "Halaman berikutnya"
                    );

                    return;
                }

                document.querySelectorAll(
                    ".pagination button"
                ).forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");

                showToast(
                    `Membuka halaman ${button.textContent}`
                );
            }
        );
    });


    /* =========================================
       FORM TAMBAH PERANGKAT
    ========================================= */

    const formButtons =
        document.querySelectorAll(".form-actions button");

    formButtons[0].addEventListener(
        "click",
        () => {

            showToast(
                "Form dibatalkan"
            );
        }
    );


    formButtons[1].addEventListener(
        "click",
        () => {

            showToast(
                "Melanjutkan ke konfigurasi perangkat..."
            );
        }
    );


    /* =========================================
       LOCATION MAP
    ========================================= */

    const locationMapButton =
        document.querySelector(".location-map button");

    locationMapButton.addEventListener(
        "click",
        () => {

            showToast(
                "Mode pilih lokasi diaktifkan"
            );
        }
    );


    /* =========================================
       PHOTO UPLOAD
    ========================================= */

    const photoUpload =
        document.querySelector(".photo-upload");

    photoUpload.addEventListener(
        "click",
        () => {

            const input =
                document.createElement("input");

            input.type = "file";
            input.accept = "image/png,image/jpeg";

            input.addEventListener(
                "change",
                () => {

                    if (input.files.length) {

                        showToast(
                            `Foto ${input.files[0].name} dipilih`
                        );
                    }
                }
            );

            input.click();
        }
    );


    /* =========================================
       CLOCK
    ========================================= */

    function updateClock() {

        const now = new Date();

        const hours =
            String(now.getHours()).padStart(2, "0");

        const minutes =
            String(now.getMinutes()).padStart(2, "0");

        document.getElementById("clock")
            .textContent =
            `${hours}:${minutes}`;
    }

    updateClock();

    setInterval(
        updateClock,
        30000
    );


    /* =========================================
       INITIAL RENDER
    ========================================= */

    renderTable();

});

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENT
    ===================================================== */

    const tabs =
        document.querySelectorAll(".tab");

    const sensorSelect =
        document.getElementById("sensorSelect");

    const templateSelect =
        document.getElementById("templateSelect");

    const waspadaInput =
        document.getElementById("waspadaInput");

    const siagaInput =
        document.getElementById("siagaInput");

    const bahayaInput =
        document.getElementById("bahayaInput");

    const rainInput =
        document.getElementById("rainInput");

    const offlineInput =
        document.getElementById("offlineInput");

    const batteryInput =
        document.getElementById("batteryInput");

    const saveButton =
        document.getElementById("saveButton");

    const resetButton =
        document.getElementById("resetButton");

    const bulkButton =
        document.getElementById("bulkButton");

    const successMessage =
        document.getElementById("successMessage");

    const closeSuccess =
        document.getElementById("closeSuccess");

    if (!document.getElementById("clock") || !sensorSelect || !templateSelect || !saveButton) return;


    /* =====================================================
       CLOCK
    ===================================================== */

    function updateClock() {

        const now = new Date();

        const hour =
            String(now.getHours()).padStart(2, "0");

        const minute =
            String(now.getMinutes()).padStart(2, "0");

        document.getElementById("clock")
            .textContent =
            `${hour}:${minute}`;
    }

    updateClock();

    setInterval(
        updateClock,
        30000
    );


    /* =====================================================
       TABS
    ===================================================== */

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(item => {
                    item.classList.remove("active");
                });

                tab.classList.add("active");

            }
        );

    });


    /* =====================================================
       TOGGLE
    ===================================================== */

    document
        .querySelectorAll(".toggle")
        .forEach(toggle => {

            toggle.addEventListener(
                "click",
                () => {

                    toggle.classList.toggle("on");

                }
            );

        });


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary() {

        document.getElementById(
            "summarySensor"
        ).textContent =
            sensorSelect.options[
                sensorSelect.selectedIndex
            ].text;


        document.getElementById(
            "summaryTemplate"
        ).textContent =
            templateSelect.options[
                templateSelect.selectedIndex
            ].text;


        document.getElementById(
            "summaryWaspada"
        ).textContent =
            waspadaInput.value;


        document.getElementById(
            "summarySiaga"
        ).textContent =
            siagaInput.value;


        document.getElementById(
            "summaryBahaya"
        ).textContent =
            bahayaInput.value;


        document.getElementById(
            "summaryRain"
        ).textContent =
            rainInput.value;


        document.getElementById(
            "summaryOffline"
        ).textContent =
            offlineInput.value;


        document.getElementById(
            "summaryBattery"
        ).textContent =
            batteryInput.value;

    }


    [
        sensorSelect,
        templateSelect,
        waspadaInput,
        siagaInput,
        bahayaInput,
        rainInput,
        offlineInput,
        batteryInput
    ].forEach(element => {

        element.addEventListener(
            "input",
            updateSummary
        );

        element.addEventListener(
            "change",
            updateSummary
        );

    });


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateThreshold() {

        const waspada =
            Number(waspadaInput.value);

        const siaga =
            Number(siagaInput.value);

        const bahaya =
            Number(bahayaInput.value);


        if (siaga <= waspada) {

            showValidation(
                "Nilai Siaga harus lebih besar dari Waspada."
            );

            return false;
        }


        if (bahaya <= siaga) {

            showValidation(
                "Nilai Bahaya harus lebih besar dari Siaga."
            );

            return false;
        }


        clearValidation();

        return true;
    }


    function showValidation(message) {

        const validation =
            document.querySelector(
                ".validation-card"
            );

        validation.classList.add(
            "validation-error"
        );

        const paragraphs =
            validation.querySelectorAll("p");

        paragraphs[0].textContent =
            message;

    }


    function clearValidation() {

        const validation =
            document.querySelector(
                ".validation-card"
            );

        validation.classList.remove(
            "validation-error"
        );

    }


    [
        waspadaInput,
        siagaInput,
        bahayaInput
    ].forEach(input => {

        input.addEventListener(
            "input",
            validateThreshold
        );

    });


    /* =====================================================
       SAVE
    ===================================================== */

    saveButton.addEventListener(
        "click",
        () => {

            if (!validateThreshold()) {
                return;
            }

            updateSummary();

            successMessage.style.display =
                "flex";

            showToast(
                "Pengaturan berhasil disimpan"
            );

        }
    );


    /* =====================================================
       APPLY TEMPLATE
    ===================================================== */

    resetButton.addEventListener(
        "click",
        () => {

            waspadaInput.value = 100;
            siagaInput.value = 150;
            bahayaInput.value = 200;

            rainInput.value = 50;
            offlineInput.value = 30;
            batteryInput.value = 20;

            updateSummary();

            showToast(
                "Template berhasil diterapkan"
            );

        }
    );


    /* =====================================================
       BULK TEMPLATE
    ===================================================== */

    bulkButton.addEventListener(
        "click",
        () => {

            showToast(
                "Mode penerapan template ke banyak sensor dibuka"
            );

        }
    );


    document
        .getElementById("applyTemplate")
        .addEventListener(
            "click",
            () => {

                waspadaInput.value = 100;
                siagaInput.value = 150;
                bahayaInput.value = 200;

                updateSummary();

                showToast(
                    "Template ambang diterapkan"
                );

            }
        );


    /* =====================================================
       CLOSE SUCCESS
    ===================================================== */

    closeSuccess.addEventListener(
        "click",
        () => {

            successMessage.style.display =
                "none";

        }
    );


    /* =====================================================
       GLOBAL SEARCH
    ===================================================== */

    document
        .getElementById("globalSearch")
        .addEventListener(
            "keydown",
            event => {

                if (event.key !== "Enter") {
                    return;
                }

                const value =
                    event.target.value.trim();

                if (!value) {
                    return;
                }

                showToast(
                    `Mencari: ${value}`
                );

            }
        );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.getElementById("toast");

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id = "toast";

            document.body.appendChild(toast);

            Object.assign(
                toast.style,
                {
                    position: "fixed",
                    right: "20px",
                    bottom: "20px",
                    background: "#17243a",
                    color: "#fff",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    fontSize: "11px",
                    zIndex: "9999",
                    transition: ".25s",
                    opacity: "0",
                    transform: "translateY(20px)"
                }
            );
        }


        toast.textContent = message;

        toast.style.opacity = "1";
        toast.style.transform =
            "translateY(0)";


        clearTimeout(
            toast.timeout
        );


        toast.timeout =
            setTimeout(
                () => {

                    toast.style.opacity =
                        "0";

                    toast.style.transform =
                        "translateY(20px)";

                },
                2200
            );

    }


    /* =====================================================
       INITIAL
    ===================================================== */

    updateSummary();

});

document.addEventListener("DOMContentLoaded", () => {

    if (!document.body.matches('[data-page="pengguna-role"]')) return;

    /* =========================================
       ACTIVE NAVIGATION
       ========================================= */

    const currentPage = document.body.dataset.page;

    const navItems = document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page]"
    );

    navItems.forEach(item => {

        const page = item.dataset.page;

        if (page === currentPage) {
            item.classList.add("active");

            const settings = document.querySelector(".settings-main");

            if (item.classList.contains("submenu-item")) {
                settings?.classList.add("active");
            }
        }

        item.addEventListener("click", () => {

            navItems.forEach(nav => {
                nav.classList.remove("active");
            });

            item.classList.add("active");

            if (item.classList.contains("submenu-item")) {
                document
                    .querySelector(".settings-main")
                    ?.classList.add("active");
            }
        });
    });


    /* =========================================
       SETTINGS SUBMENU
       ========================================= */

    const settingsButton =
        document.getElementById("settingsButton");

    const submenu =
        document.querySelector(".submenu");

    const settingsArrow =
        document.querySelector(".settings-arrow");

    let settingsOpen = true;

    settingsButton?.addEventListener("click", () => {

        settingsOpen = !settingsOpen;

        submenu.style.display =
            settingsOpen ? "block" : "none";

        if (settingsArrow) {
            settingsArrow.style.transform =
                settingsOpen ? "rotate(0deg)" : "rotate(-90deg)";
        }
    });


    /* =========================================
       SEARCH USER
       ========================================= */

    const userSearch =
        document.getElementById("userSearch");

    const roleFilter =
        document.getElementById("roleFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const tableRows =
        document.querySelectorAll("#userTable tbody tr");


    function filterUsers() {

        const keyword =
            userSearch.value.toLowerCase().trim();

        const role =
            roleFilter.value;

        const status =
            statusFilter.value;

        tableRows.forEach(row => {

            const text =
                row.innerText.toLowerCase();

            const rowRole =
                row.dataset.role;

            const rowStatus =
                row.dataset.status;

            const matchKeyword =
                !keyword || text.includes(keyword);

            const matchRole =
                role === "all" || rowRole === role;

            const matchStatus =
                status === "all" || rowStatus === status;

            row.style.display =
                matchKeyword &&
                matchRole &&
                matchStatus
                    ? ""
                    : "none";
        });
    }


    userSearch?.addEventListener(
        "input",
        filterUsers
    );

    roleFilter?.addEventListener(
        "change",
        filterUsers
    );

    statusFilter?.addEventListener(
        "change",
        filterUsers
    );


    /* =========================================
       RESET FILTER
       ========================================= */

    document
        .getElementById("resetFilter")
        ?.addEventListener("click", () => {

            userSearch.value = "";
            roleFilter.value = "all";
            statusFilter.value = "all";

            filterUsers();

            showToast("Filter berhasil direset");
        });


    /* =========================================
       GLOBAL SEARCH
       ========================================= */

    const globalSearch =
        document.getElementById("globalSearch");

    globalSearch?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                const value =
                    globalSearch.value.trim();

                if (!value) return;

                showToast(
                    `Mencari: ${value}`
                );
            }
        }
    );


    /* =========================================
       ADD USER
       ========================================= */

    const sendInvite =
        document.getElementById("sendInvite");

    const newName =
        document.getElementById("newName");

    const newContact =
        document.getElementById("newContact");

    const newRole =
        document.getElementById("newRole");

    const newArea =
        document.getElementById("newArea");

    const sendInvitation =
        document.getElementById("sendInvitation");


    sendInvite?.addEventListener("click", () => {

        const name =
            newName.value.trim();

        const contact =
            newContact.value.trim();

        const role =
            newRole.value;

        const area =
            newArea.value;

        if (!name || !contact) {
            showToast(
                "Nama dan Email / No. HP wajib diisi"
            );
            return;
        }

        if (role === "Pilih role") {
            showToast("Silakan pilih role");
            return;
        }

        if (area === "Pilih wilayah") {
            showToast("Silakan pilih wilayah tugas");
            return;
        }

        if (sendInvitation.checked) {
            showToast(
                `Undangan untuk ${contact} berhasil dikirim`
            );
        } else {
            showToast(
                `${name} berhasil ditambahkan`
            );
        }

        newName.value = "";
        newContact.value = "";
        newRole.value = "Pilih role";
        newArea.value = "Pilih wilayah";
        sendInvitation.checked = false;
    });


    /* =========================================
       CANCEL FORM
       ========================================= */

    document
        .getElementById("cancelUser")
        ?.addEventListener("click", () => {

            newName.value = "";
            newContact.value = "";
            newRole.value = "Pilih role";
            newArea.value = "Pilih wilayah";
            sendInvitation.checked = false;

            showToast("Form dikosongkan");
        });


    /* =========================================
       EDIT USER
       ========================================= */

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const row =
                    button.closest("tr");

                const name =
                    row.querySelector(
                        ".user-name span"
                    )?.textContent;

                showToast(
                    `Membuka data ${name}`
                );
            });
        });


    /* =========================================
       MORE BUTTON
       ========================================= */

    document
        .querySelectorAll(".more-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const row =
                    button.closest("tr");

                const name =
                    row.querySelector(
                        ".user-name span"
                    )?.textContent;

                showToast(
                    `Menu pengguna ${name}`
                );
            });
        });


    /* =========================================
       TABS
       ========================================= */

    document
        .querySelectorAll(".tab")
        .forEach(tab => {

            tab.addEventListener("click", () => {

                document
                    .querySelectorAll(".tab")
                    .forEach(t =>
                        t.classList.remove("active")
                    );

                tab.classList.add("active");

                showToast(
                    `Membuka ${tab.textContent}`
                );
            });
        });


    /* =========================================
       TOAST
       ========================================= */

    let toastTimer;

    function showToast(message) {

        const toast =
            document.getElementById("toastMessage");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

});