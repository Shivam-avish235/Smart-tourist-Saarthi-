// Smart Tourist Safety Dashboard - JavaScript Application

class TouristSafetyDashboard {
  constructor() {
    this.currentUser = null;
    this.currentPage = 'dashboard';
    this.currentLanguage = 'en';
    this.map = null;
    this.charts = {};
    this.websocket = null;
    this.selectedTourist = null;
    this.isInitialized = false;
    // Sample data (in production, load from APIs)
    this.data = {
      dashboard_stats: {
        activeTourists: 1247,
        totalTourists: 2891,
        emergencyAlerts: 12,
        highRiskAreas: 8,
      },
      tourists: [
        {
          id: '1',
          name: 'Arjun Sharma',
          status: 'active',
          location: { lat: 26.1445, lng: 91.7362 },
          safetyScore: 85,
          lastSeen: '2 minutes ago',
          phone: '+91-9876543210',
          riskLevel: 'low',
        },
        {
          id: '2',
          name: 'Priya Patel',
          status: 'emergency',
          location: { lat: 26.1500, lng: 91.7400 },
          safetyScore: 25,
          lastSeen: '1 minute ago',
          phone: '+91-9876543211',
          riskLevel: 'high',
        },
        {
          id: '3',
          name: 'Rahul Singh',
          status: 'active',
          location: { lat: 26.1400, lng: 91.7320 },
          safetyScore: 70,
          lastSeen: '5 minutes ago',
          phone: '+91-9876543212',
          riskLevel: 'medium',
        },
      ],
      geofences: [
        {
          id: '1',
          name: 'Safe Zone - City Center',
          type: 'circle',
          center: { lat: 26.1445, lng: 91.7362 },
          radius: 2000,
          color: 'green',
          dangerLevel: 'safe',
        },
        {
          id: '2',
          name: 'Caution Area - Market District',
          type: 'circle',
          center: { lat: 26.1500, lng: 91.7400 },
          radius: 1500,
          color: 'yellow',
          dangerLevel: 'caution',
        },
        {
          id: '3',
          name: 'High Risk - Industrial Zone',
          type: 'circle',
          center: { lat: 26.1350, lng: 91.7300 },
          radius: 1000,
          color: 'red',
          dangerLevel: 'danger',
        },
      ],
      emergencyAlerts: [
        {
          id: '1',
          touristId: '2',
          touristName: 'Priya Patel',
          type: 'Panic Button',
          severity: 'Critical',
          timestamp: '2025-09-08T21:30:00Z',
          location: { lat: 26.1500, lng: 91.7400 },
          status: 'Active',
          message: 'Emergency panic button activated',
        },
        {
          id: '2',
          touristId: '5',
          touristName: 'Amit Kumar',
          type: 'Location Loss',
          severity: 'High',
          timestamp: '2025-09-08T20:45:00Z',
          location: { lat: 26.1200, lng: 91.7100 },
          status: 'Investigating',
          message: 'No location update for 30 minutes',
        },
      ],
      languages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
        { code: 'as', name: 'অসমীয়া', flag: '🇮🇳' },
      ],
    };
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      setTimeout(() => this.initializeApp(), 100);
    }
  }

  initializeApp() {
    if (this.isInitialized) return;
    console.log('Initializing Smart Tourist Safety Dashboard...');
    this.setupLanguageSelector();
    this.setupEventListeners();
    this.checkAuthStatus();
    this.isInitialized = true;
    console.log('Dashboard initialization complete');
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    setTimeout(() => {
      this.setupLoginEvents();
      this.setupDashboardEvents();
    }, 50);
  }

  setupLoginEvents() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('#loginForm button[type="submit"]');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    console.log('Setting up login events...', {
      loginForm: !!loginForm,
      loginButton: !!loginButton,
      usernameField: !!usernameField,
      passwordField: !!passwordField,
    });
    if (loginForm && loginButton) {
      const newForm = loginForm.cloneNode(true);
      loginForm.parentNode.replaceChild(newForm, loginForm);
      const newLoginButton = newForm.querySelector('button[type="submit"]');
      newForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleLogin();
        return false;
      });
      newLoginButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleLogin();
        return false;
      });
      if (newForm.querySelector('#username')) {
        newForm.querySelector('#username').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLogin();
          }
        });
      }
      if (newForm.querySelector('#password')) {
        newForm.querySelector('#password').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleLogin();
          }
        });
      }
    }
    const emergencyLink = document.querySelector('.emergency-link');
    if (emergencyLink) {
      emergencyLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert(
          'Emergency Support Contact:\n\nPhone: +91-1800-XXX-XXXX\nEmail: emergency@touristsafety.gov.in\n24/7 Emergency Helpline Available'
        );
      });
    }
    const loginLanguageSelect = document.getElementById('loginLanguageSelect');
    if (loginLanguageSelect) {
      loginLanguageSelect.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }
  }

  setupDashboardEvents() {
    console.log('Dashboard events will be set up after login');
  }

  setupDashboardEventListeners() {
    console.log('Setting up dashboard event listeners...');
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }
    document.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if (page) {
          this.navigateToPage(page);
        }
      });
    });
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.changeLanguage(e.target.value);
      });
    }
    const refreshMapBtn = document.getElementById('refreshMap');
    if (refreshMapBtn) {
      refreshMapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.refreshMapData();
      });
    }
    document.querySelectorAll('[data-period]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('[data-period]').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        this.updateAnalytics(e.target.dataset.period);
      });
    });
    document.querySelectorAll('[data-status]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('[data-status]').forEach((b) => b.classList.remove('btn--primary'));
        e.target.classList.add('btn--primary');
        this.filterEmergencyAlerts(e.target.dataset.status);
      });
    });
    const sendMessageBtn = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');
    if (sendMessageBtn && messageInput) {
      sendMessageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
    const touristSearch = document.getElementById('touristSearch');
    if (touristSearch) {
      touristSearch.addEventListener('input', (e) => {
        this.searchTourists(e.target.value);
      });
    }
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.sidebar').classList.toggle('open');
      });
    }
  }

  setupLanguageSelector() {
    ['languageSelect', 'loginLanguageSelect'].forEach((selectorId) => {
      const selector = document.getElementById(selectorId);
      if (selector) {
        selector.innerHTML = '';
        this.data.languages.forEach((lang) => {
          const option = document.createElement('option');
          option.value = lang.code;
          option.textContent = `${lang.flag} ${lang.name}`;
          selector.appendChild(option);
        });
        selector.value = this.currentLanguage;
      }
    });
  }

  checkAuthStatus() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      this.showDashboard();
    } else {
      this.showLogin();
    }
  }

  handleLogin() {
    console.log('handleLogin called');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    if (!usernameField || !passwordField) {
      console.error('Username or password field not found');
      this.showNotification('Login form error. Please refresh the page.', 'error');
      return;
    }
    const username = usernameField.value.trim();
    const password = passwordField.value.trim();
    console.log('Login attempt:', { username, passwordLength: password.length });

    if (username.length > 0 && password.length > 0) {
      console.log('Credentials valid, proceeding with authentication...');
      const submitBtn = document.querySelector('#loginForm button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = ' Authenticating...';
        submitBtn.disabled = true;
        setTimeout(() => {
          console.log('Authentication successful');
          this.currentUser = { username, role: 'admin' };
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('username', username);
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          this.showDashboard();
          this.showNotification('Login successful! Welcome to the dashboard.', 'success');
        }, 1500);
      }
    } else {
      this.showNotification('Please enter both username and password', 'error');
      if (username.length === 0) {
        usernameField.style.borderColor = '#ef4444';
        setTimeout(() => {
          usernameField.style.borderColor = '';
        }, 3000);
      }
      if (password.length === 0) {
        passwordField.style.borderColor = '#ef4444';
        setTimeout(() => {
          passwordField.style.borderColor = '';
        }, 3000);
      }
    }
  }

  handleLogout() {
    console.log('Logging out...');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('username');
    this.currentUser = null;
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
    this.showLogin();
    this.showNotification('Logged out successfully', 'info');
  }

  showLogin() {
    console.log('Showing login page...');
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    if (loginPage) loginPage.classList.remove('hidden');
    if (dashboardPage) dashboardPage.classList.add('hidden');
    setTimeout(() => this.setupLoginEvents(), 100);
  }

  showDashboard() {
    console.log('Showing dashboard...');
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    if (loginPage) loginPage.classList.add('hidden');
    if (dashboardPage) dashboardPage.classList.remove('hidden');
    const username = sessionStorage.getItem('username') || 'Admin User';
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) userNameElement.textContent = username;
    setTimeout(() => {
      this.setupDashboardEventListeners();
      this.initializeDashboardComponents();
    }, 100);
  }

  initializeDashboardComponents() {
    console.log('Initializing dashboard components...');
    setTimeout(() => {
      try {
        this.updateDashboardStats();
        this.loadTouristsTable();
        this.loadEmergencyAlerts();
        this.initializeMap();
        this.initializeCharts();
        this.startRealTimeUpdates();
        console.log('Dashboard components initialized successfully');
      } catch (error) {
        console.error('Error initializing dashboard components:', error);
        this.showNotification('Some dashboard components may not be working properly', 'warning');
      }
    }, 200);
  }

  navigateToPage(page) {
    console.log('Navigating to page:', page);
    document.querySelectorAll('.menu-item').forEach((item) => item.classList.remove('active'));
    const activeMenuItem = document.querySelector(`[data-page="${page}"]`);
    if (activeMenuItem) activeMenuItem.classList.add('active');
    document.querySelectorAll('.page-content').forEach((content) => content.classList.add('hidden'));
    const pageMap = {
      dashboard: 'dashboardHome',
      map: 'dashboardHome',
      analytics: 'analyticsPage',
      emergency: 'emergencyPage',
      tourists: 'touristsPage',
      settings: 'dashboardHome',
    };
    const targetPage = pageMap[page] || 'dashboardHome';
    const pageElement = document.getElementById(targetPage);
    if (pageElement) pageElement.classList.remove('hidden');
    const titles = {
      dashboard: 'Dashboard Overview',
      map: 'Map View',
      analytics: 'Analytics & Insights',
      emergency: 'Emergency Alerts',
      tourists: 'Tourist Management',
      settings: 'Settings',
    };
    const pageTitleElement = document.querySelector('.page-title');
    if (pageTitleElement) pageTitleElement.textContent = titles[page] || 'Dashboard';
    this.currentPage = page;
    setTimeout(() => {
      if (page === 'analytics') this.initializeCharts();
      else if (page === 'emergency') this.loadEmergencyAlerts();
      else if (page === 'tourists') this.loadTouristsTable();
    }, 100);
  }

  initializeMap() {
    console.log('Initializing map...');
    if (typeof L === 'undefined') {
      console.error('Leaflet library not loaded');
      this.showNotification('Map library not loaded. Please refresh the page.', 'error');
      return;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.log('Map container not found');
      return;
    }
    try {
      mapContainer.innerHTML = '';
      this.map = L.map('map').setView([26.1445, 91.7362], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      this.data.geofences.forEach((geofence) => {
        const color =
          geofence.color === 'green' ? '#10b981' : geofence.color === 'yellow' ? '#f59e0b' : '#ef4444';
        const circle = L.circle([geofence.center.lat, geofence.center.lng], {
          color,
          fillColor: color,
          fillOpacity: 0.2,
          radius: geofence.radius,
          weight: 2,
        }).addTo(this.map);
        circle.bindPopup(
          `<div><strong>${geofence.name}</strong><br>Danger Level: ${geofence.dangerLevel}<br>Radius: ${geofence.radius}m</div>`
        );
      });

      this.data.tourists.forEach((tourist) => {
        const markerColor = tourist.status === 'emergency' ? '#ef4444' : '#10b981';
        const marker = L.circleMarker([tourist.location.lat, tourist.location.lng], {
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.8,
          radius: 8,
          weight: 2,
        }).addTo(this.map);
        marker.bindPopup(
          `<div><strong>${tourist.name}</strong><br>Status: ${tourist.status}<br>Safety Score: ${tourist.safetyScore}%<br>Last Seen: ${tourist.lastSeen}<br>Phone: ${tourist.phone}</div>`
        );
      });

      this.data.emergencyAlerts.forEach((alert) => {
        const alertMarker = L.marker([alert.location.lat, alert.location.lng], {
          icon: L.divIcon({
            className: 'emergency-marker',
            html: '🚨',
            iconSize: [30, 30],
          }),
        }).addTo(this.map);
        alertMarker.bindPopup(
          `<div><strong>Emergency Alert</strong><br>${alert.type}: ${alert.message}<br>Location: ${alert.location.lat.toFixed(
            4
          )}, ${alert.location.lng.toFixed(4)}<br>Time: ${new Date(alert.timestamp).toLocaleString()}<br>Status: ${
            alert.status
          }</div>`
        );
      });
    } catch (error) {
      console.error('Map initialization failed:', error);
      this.showNotification('Failed to initialize map', 'error');
    }
  }

  showNotification(message, type = 'info') {
    const container = document.createElement('div');
    container.className = `notification ${type}`;
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.padding = '12px 20px';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.borderLeft = `5px solid ${type === 'error' ? 'red' : type === 'success' ? 'green' : '#999'}`;
    container.style.borderRadius = '3px';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    container.style.zIndex = 10000;
    container.style.color = '#333';
    container.textContent = message;
    document.body.appendChild(container);
    setTimeout(() => {
      container.style.opacity = 0;
      setTimeout(() => {
        container.remove();
      }, 300);
    }, 4000);
  }

  /* Placeholder stubs for unimplemented functions (should be implemented) */
  updateDashboardStats() {
    console.log('updateDashboardStats() to implement');
  }
  loadTouristsTable() {
    console.log('loadTouristsTable() to implement');
  }
  loadEmergencyAlerts() {
    console.log('loadEmergencyAlerts() to implement');
  }
  initializeCharts() {
    console.log('initializeCharts() to implement');
  }
  startRealTimeUpdates() {
    console.log('startRealTimeUpdates() to implement');
  }
  refreshMapData() {
    console.log('refreshMapData() to implement');
  }
  updateAnalytics(period) {
    console.log('updateAnalytics() to implement');
  }
  filterEmergencyAlerts(status) {
    console.log('filterEmergencyAlerts() to implement');
  }
  sendMessage() {
    console.log('sendMessage() to implement');
  }
  searchTourists(query) {
    console.log('searchTourists() to implement');
  }
  changeLanguage(lang) {
    console.log('changeLanguage() to implement');
  }
}

// Initialize dashboard instance
window.dashboard = new TouristSafetyDashboard();
