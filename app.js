// Translation data
const translations = {
  "en": {
    "appTitle": "Appointment Manager",
    "dashboard": "Dashboard",
    "customers": "Customers",
    "appointments": "Appointments",
    "settings": "Settings",
    "addCustomer": "Add Customer",
    "addAppointment": "Add Appointment",
    "customerName": "Customer Name",
    "phoneNumber": "Phone Number",
    "notes": "Notes",
    "service": "Service",
    "dateTime": "Date & Time",
    "save": "Save",
    "cancel": "Cancel",
    "edit": "Edit",
    "delete": "Delete",
    "search": "Search",
    "noCustomers": "No customers found",
    "noAppointments": "No appointments found",
    "todayAppointments": "Today's Appointments",
    "upcomingAppointments": "Upcoming Appointments",
    "language": "Language",
    "theme": "Theme",
    "light": "Light",
    "dark": "Dark",
    "notifications": "Notifications",
    "enabled": "Enabled",
    "disabled": "Disabled",
    "appointmentReminder": "Appointment Reminder",
    "appointmentIn30": "You have an appointment in 30 minutes"
  },
  "el": {
    "appTitle": "Διαχείριση Ραντεβού",
    "dashboard": "Πίνακας Ελέγχου",
    "customers": "Πελάτες",
    "appointments": "Ραντεβού",
    "settings": "Ρυθμίσεις",
    "addCustomer": "Προσθήκη Πελάτη",
    "addAppointment": "Προσθήκη Ραντεβού",
    "customerName": "Όνομα Πελάτη",
    "phoneNumber": "Τηλέφωνο",
    "notes": "Σημειώσεις",
    "service": "Υπηρεσία",
    "dateTime": "Ημερομηνία & Ώρα",
    "save": "Αποθήκευση",
    "cancel": "Ακύρωση",
    "edit": "Επεξεργασία",
    "delete": "Διαγραφή",
    "search": "Αναζήτηση",
    "noCustomers": "Δεν βρέθηκαν πελάτες",
    "noAppointments": "Δεν βρέθηκαν ραντεβού",
    "todayAppointments": "Σημερινά Ραντεβού",
    "upcomingAppointments": "Επερχόμενα Ραντεβού",
    "language": "Γλώσσα",
    "theme": "Θέμα",
    "light": "Φωτεινό",
    "dark": "Σκοτεινό",
    "notifications": "Ειδοποιήσεις",
    "enabled": "Ενεργοποιημένο",
    "disabled": "Απενεργοποιημένο",
    "appointmentReminder": "Υπενθύμιση Ραντεβού",
    "appointmentIn30": "Έχετε ραντεβού σε 30 λεπτά"
  }
};

// Application state
class AppState {
  constructor() {
    this.customers = JSON.parse(localStorage.getItem('customers')) || [];
    this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    this.settings = JSON.parse(localStorage.getItem('settings')) || {
      language: 'en',
      theme: 'light',
      notifications: false
    };
    this.currentView = 'dashboard';
    this.editingCustomer = null;
    this.editingAppointment = null;
    this.notificationPermission = false;
    this.deferredPrompt = null;
  }

  saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(this.customers));
  }

  saveAppointments() {
    localStorage.setItem('appointments', JSON.stringify(this.appointments));
  }

  saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  addCustomer(customer) {
    customer.id = Date.now().toString();
    customer.createdAt = new Date().toISOString();
    this.customers.push(customer);
    this.saveCustomers();
  }

  updateCustomer(id, customer) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = { ...this.customers[index], ...customer };
      this.saveCustomers();
    }
  }

  deleteCustomer(id) {
    this.customers = this.customers.filter(c => c.id !== id);
    // Also delete appointments for this customer
    this.appointments = this.appointments.filter(a => a.customerId !== id);
    this.saveCustomers();
    this.saveAppointments();
  }

  addAppointment(appointment) {
    appointment.id = Date.now().toString();
    appointment.createdAt = new Date().toISOString();
    appointment.notificationScheduled = false;
    this.appointments.push(appointment);
    this.saveAppointments();
    this.scheduleNotification(appointment);
  }

  updateAppointment(id, appointment) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments[index] = { ...this.appointments[index], ...appointment };
      this.saveAppointments();
      this.scheduleNotification(this.appointments[index]);
    }
  }

  deleteAppointment(id) {
    this.appointments = this.appointments.filter(a => a.id !== id);
    this.saveAppointments();
  }

  scheduleNotification(appointment) {
    if (!this.settings.notifications) return;

    const appointmentTime = new Date(appointment.dateTime);
    const notificationTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000); // 30 minutes before
    const now = new Date();

    if (notificationTime > now) {
      const timeUntilNotification = notificationTime.getTime() - now.getTime();
      setTimeout(() => {
        this.showNotification(appointment);
      }, timeUntilNotification);
    }
  }

  showNotification(appointment) {
    if (Notification.permission === 'granted') {
      const customer = this.customers.find(c => c.id === appointment.customerId);
      const customerName = customer ? customer.name : 'Unknown';
      
      new Notification(translations[this.settings.language].appointmentReminder, {
        body: `${customerName} - ${appointment.service}\n${translations[this.settings.language].appointmentIn30}`,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 24 24' fill='%2321808D'><path d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z'/></svg>",
        tag: `appointment-${appointment.id}`
      });
    }
  }
}

// Global app state
const app = new AppState();

// Haptic feedback simulation
function hapticFeedback(element) {
  if (element) {
    element.classList.add('haptic-feedback');
    setTimeout(() => {
      element.classList.remove('haptic-feedback');
    }, 150);
  }
}

// Language and theme management
function updateLanguage() {
  document.documentElement.lang = app.settings.language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[app.settings.language][key]) {
      element.textContent = translations[app.settings.language][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (translations[app.settings.language][key]) {
      element.placeholder = translations[app.settings.language][key];
    }
  });
}

function updateTheme() {
  // Apply theme to document root
  document.documentElement.setAttribute('data-color-scheme', app.settings.theme);
  
  // Update theme icon
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = app.settings.theme === 'light' ? '🌙' : '☀️';
  }
  
  // Update theme select in settings
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = app.settings.theme;
  }
  
  // Force a repaint to ensure theme changes are visible
  document.body.style.display = 'none';
  document.body.offsetHeight;
  document.body.style.display = '';
}

// Navigation with improved responsiveness
function showView(viewName) {
  // Prevent multiple rapid clicks
  if (app.isNavigating) return;
  app.isNavigating = true;
  
  setTimeout(() => {
    app.isNavigating = false;
  }, 300);

  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  // Show selected view
  const targetView = document.getElementById(`${viewName}View`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update navigation with immediate feedback
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeNavItem = document.querySelector(`[data-view="${viewName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }

  app.currentView = viewName;

  // Load data for the view
  setTimeout(() => {
    switch (viewName) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'customers':
        loadCustomers();
        break;
      case 'appointments':
        loadAppointments();
        break;
      case 'settings':
        loadSettings();
        break;
    }
  }, 50);
}

// Dashboard functions
function loadDashboard() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todayAppointments = app.appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime).toISOString().split('T')[0];
    return aptDate === todayStr;
  });

  const upcomingAppointments = app.appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime);
    return aptDate > today;
  });

  document.getElementById('todayCount').textContent = todayAppointments.length;
  document.getElementById('upcomingCount').textContent = upcomingAppointments.length;

  const todayContainer = document.getElementById('todayAppointments');
  if (todayAppointments.length === 0) {
    todayContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">${translations[app.settings.language].noAppointments}</div>
      </div>
    `;
  } else {
    todayContainer.innerHTML = todayAppointments
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
      .map(apt => createAppointmentCard(apt))
      .join('');
  }
}

function createAppointmentCard(appointment) {
  const customer = app.customers.find(c => c.id === appointment.customerId);
  const customerName = customer ? customer.name : 'Unknown Customer';
  const appointmentTime = new Date(appointment.dateTime);
  const timeStr = appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="appointment-card">
      <div class="appointment-time">${timeStr}</div>
      <div class="appointment-customer">${customerName}</div>
      <div class="appointment-service">${appointment.service}</div>
      ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
      <div class="appointment-actions">
        <button class="btn btn--sm btn--secondary" onclick="editAppointment('${appointment.id}')">
          ${translations[app.settings.language].edit}
        </button>
        <button class="btn btn--sm btn--outline" onclick="deleteAppointment('${appointment.id}')">
          ${translations[app.settings.language].delete}
        </button>
      </div>
    </div>
  `;
}

// Customer functions
function loadCustomers() {
  const customersList = document.getElementById('customersList');
  const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
  
  let filteredCustomers = app.customers;
  if (searchTerm) {
    filteredCustomers = app.customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phone.includes(searchTerm)
    );
  }

  if (filteredCustomers.length === 0) {
    customersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-text">${translations[app.settings.language].noCustomers}</div>
      </div>
    `;
  } else {
    customersList.innerHTML = filteredCustomers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(customer => createCustomerCard(customer))
      .join('');
  }
}

function createCustomerCard(customer) {
  return `
    <div class="customer-card">
      <div class="customer-info">
        <div class="customer-name">${customer.name}</div>
        <div class="customer-phone">${customer.phone}</div>
        ${customer.notes ? `<div class="customer-notes">${customer.notes}</div>` : ''}
      </div>
      <div class="customer-actions">
        <button class="btn btn--sm btn--secondary" onclick="editCustomer('${customer.id}')">
          ${translations[app.settings.language].edit}
        </button>
        <button class="btn btn--sm btn--outline" onclick="deleteCustomer('${customer.id}')">
          ${translations[app.settings.language].delete}
        </button>
      </div>
    </div>
  `;
}

function showCustomerModal(customer = null) {
  app.editingCustomer = customer;
  const modal = document.getElementById('customerModal');
  const title = document.getElementById('customerModalTitle');
  const form = document.getElementById('customerForm');

  title.textContent = customer ? 
    translations[app.settings.language].edit + ' ' + translations[app.settings.language].customers.slice(0, -1) :
    translations[app.settings.language].addCustomer;

  if (customer) {
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerNotes').value = customer.notes || '';
  } else {
    form.reset();
  }

  modal.classList.add('active');
}

function hideCustomerModal() {
  document.getElementById('customerModal').classList.remove('active');
  app.editingCustomer = null;
}

function saveCustomer() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const notes = document.getElementById('customerNotes').value.trim();

  if (!name || !phone) {
    showToast('Please fill in required fields');
    return;
  }

  const customerData = { name, phone, notes };

  if (app.editingCustomer) {
    app.updateCustomer(app.editingCustomer.id, customerData);
  } else {
    app.addCustomer(customerData);
  }

  hideCustomerModal();
  loadCustomers();
  updateAppointmentCustomerSelect();
  showToast('Customer saved successfully!');
}

function editCustomer(id) {
  const customer = app.customers.find(c => c.id === id);
  if (customer) {
    hapticFeedback(event.target);
    showCustomerModal(customer);
  }
}

function deleteCustomer(id) {
  if (confirm('Are you sure you want to delete this customer?')) {
    hapticFeedback(event.target);
    app.deleteCustomer(id);
    loadCustomers();
    updateAppointmentCustomerSelect();
    showToast('Customer deleted successfully!');
  }
}

// Appointment functions
function loadAppointments() {
  const appointmentsList = document.getElementById('appointmentsList');
  
  if (app.appointments.length === 0) {
    appointmentsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">${translations[app.settings.language].noAppointments}</div>
      </div>
    `;
  } else {
    appointmentsList.innerHTML = app.appointments
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .map(appointment => createFullAppointmentCard(appointment))
      .join('');
  }
}

function createFullAppointmentCard(appointment) {
  const customer = app.customers.find(c => c.id === appointment.customerId);
  const customerName = customer ? customer.name : 'Unknown Customer';
  const appointmentDate = new Date(appointment.dateTime);
  const dateStr = appointmentDate.toLocaleDateString();
  const timeStr = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `
    <div class="appointment-card">
      <div class="appointment-time">${dateStr} ${timeStr}</div>
      <div class="appointment-customer">${customerName}</div>
      <div class="appointment-service">${appointment.service}</div>
      ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
      <div class="appointment-actions">
        <button class="btn btn--sm btn--secondary" onclick="editAppointment('${appointment.id}')">
          ${translations[app.settings.language].edit}
        </button>
        <button class="btn btn--sm btn--outline" onclick="deleteAppointment('${appointment.id}')">
          ${translations[app.settings.language].delete}
        </button>
      </div>
    </div>
  `;
}

function showAppointmentModal(appointment = null) {
  app.editingAppointment = appointment;
  const modal = document.getElementById('appointmentModal');
  const title = document.getElementById('appointmentModalTitle');
  const form = document.getElementById('appointmentForm');

  title.textContent = appointment ? 
    translations[app.settings.language].edit + ' ' + translations[app.settings.language].appointments.slice(0, -1) :
    translations[app.settings.language].addAppointment;

  updateAppointmentCustomerSelect();

  if (appointment) {
    document.getElementById('appointmentCustomer').value = appointment.customerId;
    document.getElementById('appointmentService').value = appointment.service;
    document.getElementById('appointmentDateTime').value = appointment.dateTime.slice(0, 16);
    document.getElementById('appointmentNotes').value = appointment.notes || '';
  } else {
    form.reset();
    // Set minimum date to today
    const now = new Date();
    const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('appointmentDateTime').min = minDateTime;
  }

  modal.classList.add('active');
}

function hideAppointmentModal() {
  document.getElementById('appointmentModal').classList.remove('active');
  app.editingAppointment = null;
}

function updateAppointmentCustomerSelect() {
  const select = document.getElementById('appointmentCustomer');
  select.innerHTML = '<option value="">Select a customer...</option>';
  
  app.customers
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = customer.name;
      select.appendChild(option);
    });
}

function saveAppointment() {
  const customerId = document.getElementById('appointmentCustomer').value;
  const service = document.getElementById('appointmentService').value.trim();
  const dateTime = document.getElementById('appointmentDateTime').value;
  const notes = document.getElementById('appointmentNotes').value.trim();

  if (!customerId || !service || !dateTime) {
    showToast('Please fill in required fields');
    return;
  }

  const appointmentData = { customerId, service, dateTime, notes };

  if (app.editingAppointment) {
    app.updateAppointment(app.editingAppointment.id, appointmentData);
  } else {
    app.addAppointment(appointmentData);
  }

  hideAppointmentModal();
  loadAppointments();
  if (app.currentView === 'dashboard') {
    loadDashboard();
  }
  showToast('Appointment saved successfully!');
}

function editAppointment(id) {
  const appointment = app.appointments.find(a => a.id === id);
  if (appointment) {
    hapticFeedback(event.target);
    showAppointmentModal(appointment);
  }
}

function deleteAppointment(id) {
  if (confirm('Are you sure you want to delete this appointment?')) {
    hapticFeedback(event.target);
    app.deleteAppointment(id);
    loadAppointments();
    if (app.currentView === 'dashboard') {
      loadDashboard();
    }
    showToast('Appointment deleted successfully!');
  }
}

// Settings functions
function loadSettings() {
  document.getElementById('languageSelect').value = app.settings.language;
  document.getElementById('themeSelect').value = app.settings.theme;
  updateNotificationButton();
}

function updateNotificationButton() {
  const button = document.getElementById('notificationToggle');
  const span = button.querySelector('span');
  
  if (app.settings.notifications) {
    button.classList.remove('btn--outline');
    button.classList.add('btn--primary');
    span.textContent = translations[app.settings.language].enabled;
  } else {
    button.classList.remove('btn--primary');
    button.classList.add('btn--outline');
    span.textContent = translations[app.settings.language].disabled;
  }
}

async function toggleNotifications() {
  hapticFeedback(event.target);
  
  if (!app.settings.notifications) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        app.settings.notifications = true;
        app.notificationPermission = true;
        app.saveSettings();
        updateNotificationButton();
        showToast('Notifications enabled!');
        
        // Reschedule all future appointments
        app.appointments.forEach(appointment => {
          app.scheduleNotification(appointment);
        });
      } else {
        showToast('Notification permission denied');
      }
    } catch (error) {
      showToast('Notifications not supported');
    }
  } else {
    app.settings.notifications = false;
    app.saveSettings();
    updateNotificationButton();
    showToast('Notifications disabled');
  }
}

// Utility functions
function showToast(message) {
  const toast = document.getElementById('notificationToast');
  const messageEl = toast.querySelector('.toast-message');
  messageEl.textContent = message;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// PWA functions
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const swCode = `
      const CACHE_NAME = 'appointment-manager-v1';
      const urlsToCache = [
        '/',
        '/style.css',
        '/app.js'
      ];

      self.addEventListener('install', event => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
        );
      });

      self.addEventListener('fetch', event => {
        event.respondWith(
          caches.match(event.request)
            .then(response => response || fetch(event.request))
        );
      });
    `;
    
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
}

function handleInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    app.deferredPrompt = e;
    showInstallPrompt();
  });
}

function showInstallPrompt() {
  const installPrompt = document.getElementById('installPrompt');
  installPrompt.classList.remove('hidden');
  
  setTimeout(() => {
    installPrompt.classList.add('hidden');
  }, 10000); // Hide after 10 seconds
}

function installApp() {
  hapticFeedback(event.target);
  
  if (app.deferredPrompt) {
    app.deferredPrompt.prompt();
    app.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('App installed successfully!');
      }
      app.deferredPrompt = null;
      document.getElementById('installPrompt').classList.add('hidden');
    });
  }
}

function dismissInstall() {
  hapticFeedback(event.target);
  document.getElementById('installPrompt').classList.add('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize app
  updateLanguage();
  updateTheme();
  showView('dashboard');
  registerServiceWorker();
  handleInstallPrompt();

  // Navigation with debouncing
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      hapticFeedback(e.currentTarget);
      const view = e.currentTarget.getAttribute('data-view');
      showView(view);
    });
  });

  // Theme toggle with immediate visual feedback
  document.getElementById('themeToggle').addEventListener('click', (e) => {
    e.preventDefault();
    hapticFeedback(e.target);
    
    app.settings.theme = app.settings.theme === 'light' ? 'dark' : 'light';
    app.saveSettings();
    updateTheme();
  });

  // Settings
  document.getElementById('languageSelect').addEventListener('change', (e) => {
    app.settings.language = e.target.value;
    app.saveSettings();
    updateLanguage();
    loadDashboard();
    loadCustomers();
    loadAppointments();
    updateNotificationButton();
  });

  document.getElementById('themeSelect').addEventListener('change', (e) => {
    app.settings.theme = e.target.value;
    app.saveSettings();
    updateTheme();
  });

  document.getElementById('notificationToggle').addEventListener('click', toggleNotifications);

  // Customer modal
  document.getElementById('addCustomerBtn').addEventListener('click', (e) => {
    hapticFeedback(e.target);
    showCustomerModal();
  });
  
  document.getElementById('closeCustomerModal').addEventListener('click', hideCustomerModal);
  document.getElementById('cancelCustomer').addEventListener('click', hideCustomerModal);
  document.getElementById('saveCustomer').addEventListener('click', saveCustomer);

  // Appointment modal
  document.getElementById('addAppointmentBtn').addEventListener('click', (e) => {
    hapticFeedback(e.target);
    showAppointmentModal();
  });
  
  document.getElementById('closeAppointmentModal').addEventListener('click', hideAppointmentModal);
  document.getElementById('cancelAppointment').addEventListener('click', hideAppointmentModal);
  document.getElementById('saveAppointment').addEventListener('click', saveAppointment);

  // Search
  document.getElementById('customerSearch').addEventListener('input', loadCustomers);

  // Modal backdrop clicks
  document.getElementById('customerModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideCustomerModal();
    }
  });

  document.getElementById('appointmentModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      hideAppointmentModal();
    }
  });

  // PWA install
  document.getElementById('installBtn').addEventListener('click', installApp);
  document.getElementById('dismissInstall').addEventListener('click', dismissInstall);

  // Form submissions
  document.getElementById('customerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveCustomer();
  });

  document.getElementById('appointmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveAppointment();
  });

  // Check notification permission on load
  if (Notification.permission === 'granted') {
    app.notificationPermission = true;
  }

  // Schedule notifications for existing appointments
  app.appointments.forEach(appointment => {
    if (app.settings.notifications) {
      app.scheduleNotification(appointment);
    }
  });
});

// Expose functions to global scope for onclick handlers
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;