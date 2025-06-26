// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
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
                        .then(response => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        }
                    )
                );
            });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed');
            });
    });
}

// App State Management
class AppState {
    constructor() {
        this.customers = this.loadData('customers') || [];
        this.appointments = this.loadData('appointments') || [];
        this.settings = this.loadData('settings') || {
            language: 'en',
            theme: 'auto'
        };
        this.currentSection = 'dashboard';
        this.editingCustomer = null;
        this.editingAppointment = null;
        
        // Initialize with sample data if empty
        if (this.customers.length === 0) {
            this.initializeSampleData();
        }
    }

    initializeSampleData() {
        const sampleCustomers = [
            {
                id: 1,
                name: "John Smith",
                phone: "+1-555-0123",
                email: "john.smith@email.com",
                notes: "Prefers morning appointments",
                createdAt: "2025-06-01T10:00:00Z"
            },
            {
                id: 2,
                name: "Maria Papadopoulos",
                phone: "+30-210-1234567",
                email: "maria.p@email.com",
                notes: "Μιλάει ελληνικά",
                createdAt: "2025-06-02T14:30:00Z"
            },
            {
                id: 3,
                name: "David Johnson",
                phone: "+1-555-0456",
                email: "d.johnson@email.com",
                notes: "",
                createdAt: "2025-06-03T09:15:00Z"
            }
        ];

        const sampleAppointments = [
            {
                id: 1,
                customerId: 1,
                date: "2025-06-28",
                time: "10:00",
                service: "Consultation",
                status: "Scheduled",
                notes: "Initial consultation",
                createdAt: "2025-06-27T08:00:00Z"
            },
            {
                id: 2,
                customerId: 2,
                date: "2025-06-28",
                time: "14:30",
                service: "Follow-up",
                status: "Confirmed",
                notes: "Follow-up appointment",
                createdAt: "2025-06-26T16:00:00Z"
            },
            {
                id: 3,
                customerId: 3,
                date: "2025-06-29",
                time: "09:00",
                service: "Consultation",
                status: "Scheduled",
                notes: "",
                createdAt: "2025-06-27T12:00:00Z"
            }
        ];

        this.customers = sampleCustomers;
        this.appointments = sampleAppointments;
        this.saveData('customers', this.customers);
        this.saveData('appointments', this.appointments);
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(`appointmentManager_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return null;
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(`appointmentManager_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    }

    getNextId(type) {
        const items = type === 'customer' ? this.customers : this.appointments;
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }
}

// Internationalization
const translations = {
    en: {
        appName: "Appointment Manager",
        dashboard: "Dashboard",
        customers: "Customers",
        appointments: "Appointments",
        settings: "Settings",
        addCustomer: "Add Customer",
        addAppointment: "Add Appointment",
        editCustomer: "Edit Customer",
        editAppointment: "Edit Appointment",
        name: "Name",
        phone: "Phone",
        email: "Email",
        notes: "Notes",
        date: "Date",
        time: "Time",
        service: "Service",
        status: "Status",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        search: "Search",
        language: "Language",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        auto: "Auto",
        scheduled: "Scheduled",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled",
        consultation: "Consultation",
        followUp: "Follow-up",
        treatment: "Treatment",
        recentAppointments: "Recent Appointments",
        totalCustomers: "Total Customers",
        todayAppointments: "Today's Appointments",
        required: "Required",
        optional: "Optional",
        noCustomers: "No customers yet",
        noAppointments: "No appointments yet",
        addFirstCustomer: "Add your first customer to get started",
        addFirstAppointment: "Schedule your first appointment"
    },
    el: {
        appName: "Διαχείριση Ραντεβού",
        dashboard: "Πίνακας",
        customers: "Πελάτες",
        appointments: "Ραντεβού",
        settings: "Ρυθμίσεις",
        addCustomer: "Προσθήκη Πελάτη",
        addAppointment: "Προσθήκη Ραντεβού",
        editCustomer: "Επεξεργασία Πελάτη",
        editAppointment: "Επεξεργασία Ραντεβού",
        name: "Όνομα",
        phone: "Τηλέφωνο",
        email: "Email",
        notes: "Σημειώσεις",
        date: "Ημερομηνία",
        time: "Ώρα",
        service: "Υπηρεσία",
        status: "Κατάσταση",
        save: "Αποθήκευση",
        cancel: "Ακύρωση",
        edit: "Επεξεργασία",
        delete: "Διαγραφή",
        search: "Αναζήτηση",
        language: "Γλώσσα",
        theme: "Θέμα",
        light: "Φωτεινό",
        dark: "Σκοτεινό",
        auto: "Αυτόματο",
        scheduled: "Προγραμματισμένο",
        confirmed: "Επιβεβαιωμένο",
        completed: "Ολοκληρωμένο",
        cancelled: "Ακυρωμένο",
        consultation: "Συμβουλευτική",
        followUp: "Παρακολούθηση",
        treatment: "Θεραπεία",
        recentAppointments: "Πρόσφατα Ραντεβού",
        totalCustomers: "Σύνολο Πελατών",
        todayAppointments: "Σημερινά Ραντεβού",
        required: "Υποχρεωτικό",
        optional: "Προαιρετικό",
        noCustomers: "Δεν υπάρχουν πελάτες ακόμα",
        noAppointments: "Δεν υπάρχουν ραντεβού ακόμα",
        addFirstCustomer: "Προσθέστε τον πρώτο σας πελάτη για να ξεκινήσετε",
        addFirstAppointment: "Προγραμματίστε το πρώτο σας ραντεβού"
    }
};

// Haptic Feedback for iOS
function hapticFeedback(type = 'light') {
    if ('navigator' in window && 'vibrate' in navigator) {
        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(50);
                break;
            case 'success':
                navigator.vibrate([10, 50, 10]);
                break;
            case 'error':
                navigator.vibrate([50, 50, 50]);
                break;
        }
    }
}

// App Controller
class AppController {
    constructor() {
        this.state = new AppState();
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.updateLanguage();
        this.showSection('dashboard');
        this.updateDashboard();
        this.hideLoadingScreen();
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            const app = document.getElementById('app');
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                app.classList.remove('hidden');
            }, 300);
        }, 1500);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                hapticFeedback('light');
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // Search
        document.getElementById('search-btn').addEventListener('click', () => {
            hapticFeedback('light');
            this.toggleSearch();
        });

        document.getElementById('search-close').addEventListener('click', () => {
            hapticFeedback('light');
            this.toggleSearch(false);
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderCurrentSection();
        });

        // Customer Management
        document.getElementById('add-customer-btn').addEventListener('click', () => {
            hapticFeedback('medium');
            this.showCustomerModal();
        });

        document.getElementById('customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            hapticFeedback('success');
            this.saveCustomer();
        });

        // Appointment Management
        document.getElementById('add-appointment-btn').addEventListener('click', () => {
            hapticFeedback('medium');
            this.showAppointmentModal();
        });

        document.getElementById('appointment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            hapticFeedback('success');
            this.saveAppointment();
        });

        // Modal Management
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                hapticFeedback('light');
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Settings
        document.getElementById('language-select').addEventListener('change', (e) => {
            hapticFeedback('light');
            this.state.settings.language = e.target.value;
            this.state.saveData('settings', this.state.settings);
            this.updateLanguage();
        });

        document.getElementById('theme-select').addEventListener('change', (e) => {
            hapticFeedback('light');
            this.state.settings.theme = e.target.value;
            this.state.saveData('settings', this.state.settings);
            this.applyTheme();
        });

        // PWA Install
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt();
        });
    }

    showInstallPrompt() {
        // Show custom install prompt
        const notification = document.createElement('div');
        notification.className = 'update-notification show';
        notification.innerHTML = 'Install app for better experience';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    translate(key) {
        return translations[this.state.settings.language][key] || key;
    }

    updateLanguage() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        // Update document title and loading screen
        document.title = this.translate('appName');
        document.getElementById('loading-title').textContent = this.translate('appName');

        // Update language select
        document.getElementById('language-select').value = this.state.settings.language;

        // Update theme select options
        const themeSelect = document.getElementById('theme-select');
        themeSelect.innerHTML = `
            <option value="auto">${this.translate('auto')}</option>
            <option value="light">${this.translate('light')}</option>
            <option value="dark">${this.translate('dark')}</option>
        `;
        themeSelect.value = this.state.settings.theme;

        // Update placeholders
        const searchInput = document.getElementById('search-input');
        searchInput.placeholder = this.translate('search') + '...';

        // Update service and status options in modals
        this.updateModalOptions();
    }

    updateModalOptions() {
        // Update service options
        const serviceSelect = document.getElementById('appointment-service');
        if (serviceSelect) {
            const currentValue = serviceSelect.value;
            serviceSelect.innerHTML = `
                <option value="">Select service...</option>
                <option value="Consultation">${this.translate('consultation')}</option>
                <option value="Follow-up">${this.translate('followUp')}</option>
                <option value="Treatment">${this.translate('treatment')}</option>
            `;
            serviceSelect.value = currentValue;
        }

        // Update status options
        const statusSelect = document.getElementById('appointment-status');
        if (statusSelect) {
            const currentValue = statusSelect.value;
            statusSelect.innerHTML = `
                <option value="Scheduled">${this.translate('scheduled')}</option>
                <option value="Confirmed">${this.translate('confirmed')}</option>
                <option value="Completed">${this.translate('completed')}</option>
                <option value="Cancelled">${this.translate('cancelled')}</option>
            `;
            statusSelect.value = currentValue;
        }
    }

    applyTheme() {
        const theme = this.state.settings.theme;
        document.getElementById('theme-select').value = theme;

        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionName);
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === `${sectionName}-section`);
        });

        // Update header title
        document.getElementById('page-title').textContent = this.translate(sectionName);

        // Update search button visibility
        const searchBtn = document.getElementById('search-btn');
        searchBtn.style.display = ['customers', 'appointments'].includes(sectionName) ? 'block' : 'none';

        this.state.currentSection = sectionName;
        this.renderCurrentSection();
    }

    renderCurrentSection() {
        switch (this.state.currentSection) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'customers':
                this.renderCustomers();
                break;
            case 'appointments':
                this.renderAppointments();
                break;
        }
    }

    updateDashboard() {
        // Update stats
        document.getElementById('total-customers').textContent = this.state.customers.length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.state.appointments.filter(apt => apt.date === today);
        document.getElementById('today-appointments').textContent = todayAppointments.length;

        // Update recent appointments
        const recentAppointments = this.state.appointments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        this.renderAppointmentsList('recent-appointments', recentAppointments);
    }

    renderCustomers() {
        let customers = this.state.customers;
        
        if (this.searchTerm) {
            customers = customers.filter(customer =>
                customer.name.toLowerCase().includes(this.searchTerm) ||
                customer.phone.toLowerCase().includes(this.searchTerm) ||
                customer.email.toLowerCase().includes(this.searchTerm)
            );
        }

        const container = document.getElementById('customers-list');
        
        if (customers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div class="empty-state-text">${this.translate('noCustomers')}</div>
                    <div class="empty-state-subtext">${this.translate('addFirstCustomer')}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = customers.map(customer => `
            <div class="customer-item">
                <div class="customer-header">
                    <h3 class="customer-name">${customer.name}</h3>
                </div>
                <div class="customer-phone">${customer.phone}</div>
                ${customer.email ? `<div class="customer-email">${customer.email}</div>` : ''}
                ${customer.notes ? `<div class="customer-notes">${customer.notes}</div>` : ''}
                <div class="item-actions">
                    <button class="btn btn--secondary action-btn" onclick="app.editCustomer(${customer.id})">
                        ${this.translate('edit')}
                    </button>
                    <button class="btn btn--outline action-btn" onclick="app.deleteCustomer(${customer.id})">
                        ${this.translate('delete')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderAppointments() {
        let appointments = this.state.appointments;
        
        if (this.searchTerm) {
            appointments = appointments.filter(appointment => {
                const customer = this.state.customers.find(c => c.id === appointment.customerId);
                return customer?.name.toLowerCase().includes(this.searchTerm) ||
                       appointment.service.toLowerCase().includes(this.searchTerm) ||
                       appointment.status.toLowerCase().includes(this.searchTerm);
            });
        }

        this.renderAppointmentsList('appointments-list', appointments);
    }

    renderAppointmentsList(containerId, appointments) {
        const container = document.getElementById(containerId);
        
        if (appointments.length === 0) {
            if (containerId === 'appointments-list') {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📅</div>
                        <div class="empty-state-text">${this.translate('noAppointments')}</div>
                        <div class="empty-state-subtext">${this.translate('addFirstAppointment')}</div>
                    </div>
                `;
            } else {
                container.innerHTML = `<div class="text-center text-muted">${this.translate('noAppointments')}</div>`;
            }
            return;
        }

        appointments.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateB - dateA;
        });

        container.innerHTML = appointments.map(appointment => {
            const customer = this.state.customers.find(c => c.id === appointment.customerId);
            const dateTime = new Date(appointment.date + 'T' + appointment.time);
            const formattedDate = dateTime.toLocaleDateString(this.state.settings.language === 'el' ? 'el-GR' : 'en-US');
            const formattedTime = dateTime.toLocaleTimeString(this.state.settings.language === 'el' ? 'el-GR' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return `
                <div class="appointment-item">
                    <div class="appointment-header">
                        <h3 class="appointment-customer">${customer?.name || 'Unknown Customer'}</h3>
                        <span class="appointment-status ${appointment.status.toLowerCase()}">
                            ${this.translate(appointment.status.toLowerCase())}
                        </span>
                    </div>
                    <div class="appointment-datetime">${formattedDate} • ${formattedTime}</div>
                    <div class="appointment-service">${this.translate(appointment.service.toLowerCase().replace('-', ''))}</div>
                    ${appointment.notes ? `<div class="appointment-notes">${appointment.notes}</div>` : ''}
                    ${containerId === 'appointments-list' ? `
                        <div class="item-actions">
                            <button class="btn btn--secondary action-btn" onclick="app.editAppointment(${appointment.id})">
                                ${this.translate('edit')}
                            </button>
                            <button class="btn btn--outline action-btn" onclick="app.deleteAppointment(${appointment.id})">
                                ${this.translate('delete')}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    toggleSearch(show = null) {
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.getElementById('search-input');
        
        if (show === null) {
            show = searchBar.classList.contains('hidden');
        }

        if (show) {
            searchBar.classList.remove('hidden');
            searchInput.focus();
        } else {
            searchBar.classList.add('hidden');
            searchInput.value = '';
            this.searchTerm = '';
            this.renderCurrentSection();
        }
    }

    showCustomerModal(customer = null) {
        const modal = document.getElementById('customer-modal');
        const title = document.getElementById('customer-modal-title');
        const form = document.getElementById('customer-form');

        this.state.editingCustomer = customer;

        if (customer) {
            title.textContent = this.translate('editCustomer');
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-phone').value = customer.phone;
            document.getElementById('customer-email').value = customer.email || '';
            document.getElementById('customer-notes').value = customer.notes || '';
        } else {
            title.textContent = this.translate('addCustomer');
            form.reset();
        }

        this.showModal(modal);
    }

    showAppointmentModal(appointment = null) {
        const modal = document.getElementById('appointment-modal');
        const title = document.getElementById('appointment-modal-title');
        const form = document.getElementById('appointment-form');
        const customerSelect = document.getElementById('appointment-customer');

        this.state.editingAppointment = appointment;

        // Populate customer dropdown
        customerSelect.innerHTML = '<option value="">Select customer...</option>' +
            this.state.customers.map(customer => 
                `<option value="${customer.id}">${customer.name}</option>`
            ).join('');

        // Update modal options with current language
        this.updateModalOptions();

        if (appointment) {
            title.textContent = this.translate('editAppointment');
            document.getElementById('appointment-customer').value = appointment.customerId;
            document.getElementById('appointment-date').value = appointment.date;
            document.getElementById('appointment-time').value = appointment.time;
            document.getElementById('appointment-service').value = appointment.service;
            document.getElementById('appointment-status').value = appointment.status;
            document.getElementById('appointment-notes').value = appointment.notes || '';
        } else {
            title.textContent = this.translate('addAppointment');
            form.reset();
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            document.getElementById('appointment-date').value = tomorrow.toISOString().split('T')[0];
        }

        this.showModal(modal);
    }

    showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.state.editingCustomer = null;
        this.state.editingAppointment = null;
    }

    saveCustomer() {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const notes = document.getElementById('customer-notes').value.trim();

        if (!name || !phone) {
            hapticFeedback('error');
            return;
        }

        if (this.state.editingCustomer) {
            // Update existing customer
            const customer = this.state.customers.find(c => c.id === this.state.editingCustomer.id);
            customer.name = name;
            customer.phone = phone;
            customer.email = email;
            customer.notes = notes;
        } else {
            // Add new customer
            const newCustomer = {
                id: this.state.getNextId('customer'),
                name,
                phone,
                email,
                notes,
                createdAt: new Date().toISOString()
            };
            this.state.customers.push(newCustomer);
        }

        this.state.saveData('customers', this.state.customers);
        this.closeModal(document.getElementById('customer-modal'));
        this.renderCurrentSection();
        this.updateDashboard();
    }

    saveAppointment() {
        const customerId = parseInt(document.getElementById('appointment-customer').value);
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const service = document.getElementById('appointment-service').value;
        const status = document.getElementById('appointment-status').value;
        const notes = document.getElementById('appointment-notes').value.trim();

        if (!customerId || !date || !time || !service) {
            hapticFeedback('error');
            return;
        }

        if (this.state.editingAppointment) {
            // Update existing appointment
            const appointment = this.state.appointments.find(a => a.id === this.state.editingAppointment.id);
            appointment.customerId = customerId;
            appointment.date = date;
            appointment.time = time;
            appointment.service = service;
            appointment.status = status;
            appointment.notes = notes;
        } else {
            // Add new appointment
            const newAppointment = {
                id: this.state.getNextId('appointment'),
                customerId,
                date,
                time,
                service,
                status,
                notes,
                createdAt: new Date().toISOString()
            };
            this.state.appointments.push(newAppointment);
        }

        this.state.saveData('appointments', this.state.appointments);
        this.closeModal(document.getElementById('appointment-modal'));
        this.renderCurrentSection();
        this.updateDashboard();
    }

    editCustomer(id) {
        hapticFeedback('light');
        const customer = this.state.customers.find(c => c.id === id);
        if (customer) {
            this.showCustomerModal(customer);
        }
    }

    deleteCustomer(id) {
        hapticFeedback('medium');
        
        if (confirm('Are you sure you want to delete this customer?')) {
            // Remove customer
            this.state.customers = this.state.customers.filter(c => c.id !== id);
            
            // Remove associated appointments
            this.state.appointments = this.state.appointments.filter(a => a.customerId !== id);
            
            this.state.saveData('customers', this.state.customers);
            this.state.saveData('appointments', this.state.appointments);
            
            hapticFeedback('success');
            this.renderCurrentSection();
            this.updateDashboard();
        }
    }

    editAppointment(id) {
        hapticFeedback('light');
        const appointment = this.state.appointments.find(a => a.id === id);
        if (appointment) {
            this.showAppointmentModal(appointment);
        }
    }

    deleteAppointment(id) {
        hapticFeedback('medium');
        
        if (confirm('Are you sure you want to delete this appointment?')) {
            this.state.appointments = this.state.appointments.filter(a => a.id !== id);
            this.state.saveData('appointments', this.state.appointments);
            
            hapticFeedback('success');
            this.renderCurrentSection();
            this.updateDashboard();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});

// Handle back button for modal closing
window.addEventListener('popstate', (e) => {
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
        app.closeModal(openModal);
    }
});