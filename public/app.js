document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT REFERENCES ---
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const pageTitleEl = document.querySelector('.page-title');
    const activeTouristsEl = document.getElementById('activeTourists');
    const totalTouristsEl = document.getElementById('totalTourists');
    const emergencyAlertsEl = document.getElementById('emergencyAlerts');
    const highRiskAreasEl = document.getElementById('highRiskAreas');
    const pages = {
        dashboard: document.getElementById('dashboardHome'),
        analytics: document.getElementById('analyticsPage'),
        emergency: document.getElementById('emergencyPage'),
        geofence: document.getElementById('geofencePage'),
        tourists: document.getElementById('touristsPage'),
        settings: document.getElementById('settingsPage'),
    };
    const activityList = document.getElementById('activityList');
    const emergencyList = document.getElementById('emergencyList');
    const touristsTableBody = document.getElementById('touristsTableBody');
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    
    // Geofence elements
    const geofenceForm = document.getElementById('geofenceForm');
    const geofenceTableBody = document.getElementById('geofenceTableBody');
    const editGeofenceModal = document.getElementById('editGeofenceModal');
    const editGeofenceForm = document.getElementById('editGeofenceForm');
    const closeEditModal = document.getElementById('closeEditModal');


    // --- STATE & CONFIG ---
    const API_URL = 'http://localhost:5000/api';
    let token = null;
    let map;
    let touristMarkers = [];
    let geofenceLayers = [];
    let allGeofences = [];
    let charts = {};

    // --- CORE FUNCTIONS ---
    const handleLogout = () => {
        token = null;
        localStorage.removeItem('adminToken');
        showLogin();
    };

    const fetchWithAuth = (url, options = {}) => {
        const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        return fetch(url, { ...options, headers });
    };

    const showPage = (pageKey) => {
        Object.values(pages).forEach(page => page.classList.add('hidden'));
        if (pages[pageKey]) pages[pageKey].classList.remove('hidden');

        sidebarMenuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageKey);
        });

        const activeMenuItem = document.querySelector(`.menu-item[data-page="${pageKey}"] span`);
        pageTitleEl.textContent = activeMenuItem ? `${activeMenuItem.textContent}` : 'Dashboard';
        
        if(pageKey === 'analytics') initAnalyticsCharts();
        if(pageKey === 'emergency') fetchEmergencyAlerts();
    };

    const initMap = () => {
        if (map) return;
        map = L.map('map').setView([28.6139, 77.2090], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);
    };
    
    const fetchDashboardData = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/dashboard/stats`);
            if (!res.ok) throw new Error('Failed to fetch stats');
            const { data } = await res.json();
            activeTouristsEl.textContent = data.activeTourists;
            totalTouristsEl.textContent = data.totalTourists;
            emergencyAlertsEl.textContent = data.emergencyAlerts;
            highRiskAreasEl.textContent = data.highRiskAreas;
            updateActivityList(data.recentAlerts);
        } catch (error) {
            console.error(error);
            handleLogout();
        }
    };

    const fetchAllDataForDashboard = () => {
        fetchDashboardData();
        fetchTourists();
        fetchGeofences();
    };
    
    const updateActivityList = (alerts) => {
        activityList.innerHTML = '';
        if (!alerts || alerts.length === 0) {
            activityList.innerHTML = '<div>No recent activity.</div>';
            return;
        }
        alerts.forEach(alert => {
            const touristName = alert.touristId ? `${alert.touristId.personalInfo.firstName} ${alert.touristId.personalInfo.lastName}` : 'Unknown';
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `<div class="activity-icon emergency"><i class="fas fa-exclamation-circle"></i></div>
                <div class="activity-content"><p><strong>${alert.type}</strong></p><p>${touristName}</p>
                <span class="activity-time">${new Date(alert.createdAt).toLocaleString()}</span></div>`;
            activityList.appendChild(item);
        });
    };
    
    const fetchEmergencyAlerts = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/dashboard/stats`);
            if (!res.ok) throw new Error('Failed to fetch alerts');
            const { data } = await res.json();
            emergencyList.innerHTML = '';
            if (!data.recentAlerts || data.recentAlerts.length === 0) {
                 emergencyList.innerHTML = '<div>No active emergencies.</div>';
                 return;
            }
            data.recentAlerts.forEach(alert => {
                 const touristName = alert.touristId ? `${alert.touristId.personalInfo.firstName} ${alert.touristId.personalInfo.lastName}` : 'Unknown';
                 const item = document.createElement('div');
                 item.className = `alert-item ${alert.severity ? alert.severity.toLowerCase() : 'medium'}`;
                 item.innerHTML = `
                    <div class="alert-header">
                        <h5>${alert.type} - ${touristName}</h5>
                        <span class="alert-severity ${alert.severity ? alert.severity.toLowerCase() : 'medium'}">${alert.severity || 'Medium'}</span>
                    </div>
                    <p>${alert.description || 'No description provided.'}</p>
                    <small>${new Date(alert.createdAt).toLocaleString()}</small>
                 `;
                 emergencyList.appendChild(item);
            });
        } catch(error) {
            console.error(error);
        }
    };
    
    const initAnalyticsCharts = () => {
        if (charts.emergencyChart) charts.emergencyChart.destroy();
        if (charts.riskChart) charts.riskChart.destroy();

        charts.emergencyChart = new Chart(document.getElementById('emergencyChart'), {
            type: 'line',
            data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Emergency Incidents', data: [12, 19, 3, 5, 2, 3], borderColor: 'rgb(255, 99, 132)' }] }
        });

        charts.riskChart = new Chart(document.getElementById('riskChart'), {
            type: 'doughnut',
            data: { labels: ['Low Risk', 'Medium Risk', 'High Risk'], datasets: [{ label: 'Tourist Risk Distribution', data: [300, 50, 100], backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(255, 99, 132)'] }] }
        });
    };

    const fetchTourists = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/tourists`);
            const { data } = await res.json();
            touristMarkers.forEach(marker => marker.remove());
            touristMarkers = [];
            touristsTableBody.innerHTML = '';
            data.forEach(tourist => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}</td>
                    <td><span class="status-badge ${tourist.status}">${tourist.status}</span></td>
                    <td>${tourist.safetyScore || 'N/A'}</td><td>${new Date(tourist.lastActiveAt).toLocaleString()}</td>
                    <td><span class="risk-badge ${tourist.riskLevel}">${tourist.riskLevel}</span></td>`;
                touristsTableBody.appendChild(row);
                if (tourist.currentLocation?.coordinates) {
                    const { latitude, longitude } = tourist.currentLocation.coordinates;
                    if (latitude && longitude) {
                        const marker = L.marker([latitude, longitude]).addTo(map).bindPopup(`<b>${tourist.personalInfo.firstName}</b><br>Status: ${tourist.status}`);
                        touristMarkers.push(marker);
                    }
                }
            });
        } catch (error) { console.error(error); }
    };
    
    const fetchGeofences = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/geofences`);
            if (!res.ok) throw new Error('Failed to get geofences');
            const { data } = await res.json();
            allGeofences = data;
            renderGeofencesOnMap(data);
            renderGeofencesInTable(data);
        } catch (error) { console.error('Error fetching geofences:', error.message); }
    };

    const renderGeofencesOnMap = (geofences) => {
        geofenceLayers.forEach(layer => layer.remove());
        geofenceLayers = [];
        geofences.forEach(fence => {
            const colorMap = { safe: 'green', caution: 'yellow', danger: 'red' };
            const [longitude, latitude] = fence.location.coordinates;
            const circle = L.circle([latitude, longitude], { radius: fence.radius, color: colorMap[fence.dangerLevel] || 'blue', fillOpacity: 0.2 }).addTo(map).bindPopup(`<b>${fence.name}</b>`);
            geofenceLayers.push(circle);
        });
    };

    const renderGeofencesInTable = (geofences) => {
        geofenceTableBody.innerHTML = '';
        if (geofences.length === 0) {
            geofenceTableBody.innerHTML = `<tr><td colspan="3">No geofence zones created yet.</td></tr>`;
            return;
        }
        geofences.forEach(fence => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${fence.name}</td>
                <td><span class="risk-badge ${fence.dangerLevel}">${fence.dangerLevel}</span></td>
                <td>
                    <button class="btn btn--sm edit-geofence-btn" data-id="${fence._id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn--sm btn--danger delete-geofence-btn" data-id="${fence._id}"><i class="fas fa-trash"></i> Delete</button>
                </td>`;
            geofenceTableBody.appendChild(row);
        });
    };

    const showDashboard = () => {
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        showPage('dashboard');
        initMap();
        fetchAllDataForDashboard();
    };

    const showLogin = () => {
        loginPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (res.ok) {
                const { data } = await res.json();
                token = data.token;
                localStorage.setItem('adminToken', token);
                showDashboard();
            } else { alert('Invalid credentials'); }
        } catch (error) { console.error('Login error:', error); }
    });

    geofenceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const geofenceData = {
            name: document.getElementById('geofenceName').value,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            radius: parseInt(document.getElementById('radius').value, 10),
            dangerLevel: document.getElementById('dangerLevel').value,
        };
        try {
            const res = await fetchWithAuth(`${API_URL}/geofences`, { method: 'POST', body: JSON.stringify(geofenceData) });
            if (res.ok) {
                alert('Geofence zone created successfully!');
                geofenceForm.reset();
                fetchGeofences();
            } else { throw new Error('Failed to create geofence zone.'); }
        } catch (error) { alert(error.message); }
    });

    geofenceTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = target.dataset.id;
        
        if (target.classList.contains('delete-geofence-btn')) {
            if (confirm('Are you sure you want to delete this zone?')) {
                try {
                    const res = await fetchWithAuth(`${API_URL}/geofences/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        alert('Geofence deleted!');
                        fetchGeofences();
                    } else { throw new Error('Failed to delete geofence.'); }
                } catch (error) { alert(error.message); }
            }
        }

        if (target.classList.contains('edit-geofence-btn')) {
            const fence = allGeofences.find(f => f._id === id);
            if (fence) {
                document.getElementById('editGeofenceId').value = fence._id;
                document.getElementById('editGeofenceName').value = fence.name;
                document.getElementById('editLatitude').value = fence.location.coordinates[1];
                document.getElementById('editLongitude').value = fence.location.coordinates[0];
                document.getElementById('editRadius').value = fence.radius;
                document.getElementById('editDangerLevel').value = fence.dangerLevel;
                editGeofenceModal.classList.remove('hidden');
            }
        }
    });

    editGeofenceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editGeofenceId').value;
        const updatedData = {
            name: document.getElementById('editGeofenceName').value,
            latitude: parseFloat(document.getElementById('editLatitude').value),
            longitude: parseFloat(document.getElementById('editLongitude').value),
            radius: parseInt(document.getElementById('editRadius').value, 10),
            dangerLevel: document.getElementById('dangerLevel').value,
        };
        try {
            const res = await fetchWithAuth(`${API_URL}/geofences/${id}`, { method: 'PUT', body: JSON.stringify(updatedData) });
            if (res.ok) {
                alert('Geofence updated!');
                editGeofenceModal.classList.add('hidden');
                fetchGeofences();
            } else { throw new Error('Failed to update geofence.'); }
        } catch (error) { alert(error.message); }
    });
    
    closeEditModal.addEventListener('click', () => {
        editGeofenceModal.classList.add('hidden');
    });

    logoutBtn.addEventListener('click', handleLogout);
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => showPage(item.dataset.page));
    });

    const checkAuthStatus = async () => {
        token = localStorage.getItem('adminToken');
        if (!token) return showLogin();
        showDashboard(); 
    };

    checkAuthStatus();
});

