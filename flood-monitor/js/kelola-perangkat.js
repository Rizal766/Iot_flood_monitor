document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("deviceTable");
    const searchInput = document.getElementById("deviceSearch");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");
    const locationFilter = document.getElementById("locationFilter");
    const tableInfo = document.getElementById("tableInfo");
    const selectAll = document.getElementById("selectAllDevices");
    const selectedCountLabel = document.getElementById("selectedCount");
    const deleteSelectedButton = document.getElementById("deleteSelected");
    const toast = document.getElementById("toast");
    const editDialog = document.getElementById("deviceEditDialog");
    const editForm = document.getElementById("deviceEditForm");
    const editIdLabel = document.getElementById("deviceEditId");
    const editLocationInput = document.getElementById("deviceEditLocation");

    if (!tableBody) return;

    const devices = [
        { id: "DEV-001", location: "Kali Banjir Kanal Barat", type: "Water Level", guid: "GK-001-7789", firmware: "v1.2.3", status: "Online", lastSeen: "26 Jun 2026 10:42" },
        { id: "DEV-002", location: "Sungai Muktiharjo", type: "Rain Gauge", guid: "GK-002-4412", firmware: "v1.1.8", status: "Online", lastSeen: "26 Jun 2026 09:17" },
        { id: "DEV-003", location: "Kali Garang", type: "Water Level", guid: "GK-003-9921", firmware: "v1.2.3", status: "Offline", lastSeen: "25 Jun 2026 21:03" },
        { id: "DEV-004", location: "Kali Timo", type: "Rain Gauge", guid: "GK-004-6655", firmware: "v1.1.5", status: "Online", lastSeen: "26 Jun 2026 08:56" },
        { id: "DEV-005", location: "Kali Kembangarum", type: "Water Level", guid: "GK-005-8832", firmware: "v1.2.0", status: "Online", lastSeen: "26 Jun 2026 10:11" },
        { id: "DEV-006", location: "Sungai Bringin", type: "Water Level", guid: "GK-006-7780", firmware: "v1.2.1", status: "Offline", lastSeen: "24 Jun 2026 16:20" },
        { id: "DEV-007", location: "Semarang Timur", type: "Rain Gauge", guid: "GK-007-5523", firmware: "v1.1.8", status: "Online", lastSeen: "26 Jun 2026 09:34" },
        { id: "DEV-008", location: "Kali Simongan", type: "Water Level", guid: "GK-008-7741", firmware: "v1.2.3", status: "Online", lastSeen: "26 Jun 2026 10:26" },
        { id: "DEV-009", location: "Kali Bringin", type: "Water Level", guid: "GK-009-2254", firmware: "v1.2.2", status: "Maintenance", lastSeen: "23 Jun 2026 13:10" },
        { id: "DEV-010", location: "Kali Tuntang", type: "Rain Gauge", guid: "GK-010-8921", firmware: "v1.1.7", status: "Online", lastSeen: "26 Jun 2026 07:52" }
    ];

    const remainingStatuses = [
        ...Array(11).fill("Online"),
        ...Array(2).fill("Offline"),
        "Maintenance"
    ];
    const remainingLocations = [
        "Kali Banjir Kanal Barat",
        "Sungai Muktiharjo",
        "Kali Garang",
        "Kali Timo"
    ];
    remainingStatuses.forEach((status, index) => {
        const number = index + 11;
        devices.push({
            id: `DEV-${String(number).padStart(3, "0")}`,
            location: remainingLocations[index % remainingLocations.length],
            type: index % 4 === 0 ? "Rain Gauge" : "Water Level",
            guid: `GK-${String(number).padStart(3, "0")}-${7700 + number}`,
            firmware: `v1.${index % 3 + 1}.${index % 5}`,
            status,
            lastSeen: status === "Offline" ? "25 Jun 2026 21:03" : `26 Jun 2026 ${String(7 + index % 12).padStart(2, "0")}:15`
        });
    });

    const locationFilterValues = Array.from(new Set(devices.map((device) => device.location)));
    locationFilterValues.forEach((location) => {
        if (locationFilter && !Array.from(locationFilter.options).some((option) => option.value === location)) {
            locationFilter.add(new Option(location, location));
        }
    });

    let currentPage = 1;
    const pageSize = 10;
    let filteredDevices = [...devices];
    let deviceBeingEdited = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("show");
        window.clearTimeout(window.deviceToastTimer);
        window.deviceToastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
    }

    function renderPagination(totalPages) {
        const pagination = document.querySelector(".device-card .pagination");
        if (!pagination) return;

        pagination.innerHTML = "";
        const addButton = (label, page, disabled = false) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;
            button.classList.toggle("active", page === currentPage);
            button.addEventListener("click", () => {
                currentPage = page;
                render();
            });
            pagination.appendChild(button);
        };

        addButton("‹", Math.max(1, currentPage - 1), currentPage === 1);
        for (let page = 1; page <= totalPages; page += 1) {
            addButton(String(page), page);
        }
        addButton("›", Math.min(totalPages, currentPage + 1), currentPage === totalPages);
    }

    function render() {
        const totalPages = Math.max(1, Math.ceil(filteredDevices.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * pageSize;
        const visibleDevices = filteredDevices.slice(start, start + pageSize);

        tableBody.innerHTML = visibleDevices.map((device) => `
            <tr data-device-id="${device.id}">
                <td><input class="check" type="checkbox" aria-label="Pilih ${device.id}"></td>
                <td class="device-id">${device.id}</td>
                <td class="device-location"><strong>${device.location}</strong></td>
                <td>${device.type}</td>
                <td>${device.guid}</td>
                <td>${device.firmware}</td>
                <td><span class="connection"><i class="connection-dot ${device.status.toLowerCase()}"></i><span class="connection-text ${device.status.toLowerCase()}-text">${device.status}</span></span></td>
                <td>${device.lastSeen}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn" type="button" data-action="edit" aria-label="Edit ${device.id}">Edit</button>
                        <button class="action-btn" type="button" data-action="delete" aria-label="Hapus ${device.id}">Hapus</button>
                    </div>
                </td>
            </tr>
        `).join("");

        if (tableInfo) {
            const end = Math.min(start + pageSize, filteredDevices.length);
            tableInfo.textContent = filteredDevices.length
                ? `Menampilkan ${start + 1} - ${end} dari ${filteredDevices.length} Perangkat`
                : "Tidak ada perangkat yang cocok";
        }
        updateSelectionState();
        const stats = document.querySelectorAll(".stats-grid .stat-card strong");
        const totals = devices.reduce((counts, device) => {
            counts[device.status] = (counts[device.status] || 0) + 1;
            return counts;
        }, {});
        if (stats.length >= 4) {
            stats[0].textContent = devices.length;
            stats[1].textContent = totals.Online || 0;
            stats[2].textContent = totals.Offline || 0;
            stats[3].textContent = totals.Maintenance || 0;
        }
        renderPagination(totalPages);
    }

    function applyFilters() {
        const query = searchInput?.value.trim().toLowerCase() || "";
        const status = statusFilter?.value || "all";
        const type = typeFilter?.value || "all";
        const location = locationFilter?.value || "all";

        filteredDevices = devices.filter((device) => {
            const matchesQuery = !query ||
                `${device.id} ${device.location} ${device.type} ${device.guid} ${device.firmware} ${device.status}`
                    .toLowerCase().includes(query);
            return matchesQuery &&
                (status === "all" || device.status === status) &&
                (type === "all" || device.type === type) &&
                (location === "all" || device.location === location);
        });
        currentPage = 1;
        render();
    }

    [searchInput, statusFilter, typeFilter, locationFilter].forEach((control) => {
        control?.addEventListener(control === searchInput ? "input" : "change", applyFilters);
    });

    function updateSelectionState() {
        const rowCheckboxes = Array.from(tableBody.querySelectorAll("input[type='checkbox']"));
        const selectedCount = rowCheckboxes.filter((checkbox) => checkbox.checked).length;

        if (selectAll) {
            selectAll.checked = rowCheckboxes.length > 0 && selectedCount === rowCheckboxes.length;
            selectAll.indeterminate = selectedCount > 0 && selectedCount < rowCheckboxes.length;
        }
        if (selectedCountLabel) selectedCountLabel.textContent = `${selectedCount} dipilih`;
        if (deleteSelectedButton) deleteSelectedButton.disabled = selectedCount === 0;
    }

    selectAll?.addEventListener("change", () => {
        tableBody.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            checkbox.checked = selectAll.checked;
        });
        updateSelectionState();
    });

    tableBody.addEventListener("change", (event) => {
        if (!event.target.matches("input[type='checkbox']")) return;
        updateSelectionState();
    });

    tableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const row = button.closest("tr");
        const device = devices.find((item) => item.id === row?.dataset.deviceId);
        if (!device) return;

        if (button.dataset.action === "edit") {
            if (!editDialog || !editForm || !editLocationInput) return;
            deviceBeingEdited = device;
            editIdLabel.textContent = device.id;
            editLocationInput.value = device.location;
            editDialog.showModal();
            return;
        }

        if (button.dataset.action === "delete" && window.confirm(`Hapus perangkat ${device.id}?`)) {
            devices.splice(devices.indexOf(device), 1);
            applyFilters();
            showToast(`Perangkat ${device.id} dihapus dari daftar.`);
        }
    });

    editForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!deviceBeingEdited) return;

        const location = editLocationInput.value.trim();
        if (!location) {
            editLocationInput.reportValidity();
            return;
        }

        const deviceId = deviceBeingEdited.id;
        deviceBeingEdited.location = location;
        editDialog.close();
        deviceBeingEdited = null;
        applyFilters();
        showToast(`Perangkat ${deviceId} diperbarui.`);
    });

    const closeEditDialog = () => {
        editDialog?.close();
        deviceBeingEdited = null;
    };
    document.getElementById("closeDeviceEdit")?.addEventListener("click", closeEditDialog);
    document.getElementById("cancelDeviceEdit")?.addEventListener("click", closeEditDialog);
    editDialog?.addEventListener("click", (event) => {
        if (event.target === editDialog) closeEditDialog();
    });

    deleteSelectedButton?.addEventListener("click", () => {
        const selectedIds = Array.from(tableBody.querySelectorAll("input[type='checkbox']:checked"))
            .map((checkbox) => checkbox.closest("tr")?.dataset.deviceId)
            .filter(Boolean);
        if (!selectedIds.length || !window.confirm(`Hapus ${selectedIds.length} perangkat terpilih?`)) return;

        for (let index = devices.length - 1; index >= 0; index -= 1) {
            if (selectedIds.includes(devices[index].id)) devices.splice(index, 1);
        }
        applyFilters();
        showToast(`${selectedIds.length} perangkat dihapus.`);
    });

    const settingsButton = document.getElementById("settingsButton");
    const settingsSubmenu = settingsButton?.closest(".settings-section")?.querySelector(".submenu");
    settingsButton?.addEventListener("click", () => {
        if (!settingsSubmenu) return;
        const isOpen = settingsSubmenu.classList.toggle("open");
        settingsButton.setAttribute("aria-expanded", String(isOpen));
        const arrow = settingsButton.querySelector(".arrow");
        if (arrow) arrow.textContent = isOpen ? "⌄" : "›";
    });

    render();
});