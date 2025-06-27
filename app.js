// AppointPro - Professional Appointment Management PWA
class AppointPro {
    constructor() {
        this.currentLanguage = 'en';
        this.currentTab = 'dashboard';
        this.currentView = 'calendar';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.isOnboarded = false;
        this.notificationsEnabled = false;
        
        // Initialize data
        this.customers = [];
        this.appointments = [];
        this.expenses = [];
        
        // Load sample data
        this.loadSampleData();
        
        // Initialize app
        this.init();
    }

    async init() {
        // Register service worker
        this.registerServiceWorker();
        
        // Load saved settings
        this.loadSettings();
        
        // Check if onboarded
        this.isOnboarded = localStorage.getItem('onboarded') === 'true';
        
        // Show splash screen then start app
        setTimeout(() => {
            this.hideSplashScreen();
            if (!this.isOnboarded) {
                this.showOnboarding();
            } else {
                this.showApp();
            }
        }, 2000);

        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize notifications
        this.initializeNotifications();
        
        // Apply theme
        this.applyTheme();
        
        // Load data from localStorage
        this.loadData();
        
        // Update UI
        this.updateDashboard();
        this.updateFinances();
        
        // Start notification scheduler
        this.scheduleNotifications();
    }

    loadSampleData() {
        const sampleData = {
            "sampleCustomers": [
                {
                    "id": "1",
                    "name": "John Smith",
                    "phone": "+1234567890",
                    "notes": "Prefers morning appointments",
                    "createdDate": "2025-06-20",
                    "totalAppointments": 3,
                    "lastVisit": "2025-06-25"
                },
                {
                    "id": "2", 
                    "name": "Maria Rodriguez",
                    "phone": "+1234567891",
                    "notes": "Regular customer - monthly service",
                    "createdDate": "2025-05-15",
                    "totalAppointments": 8,
                    "lastVisit": "2025-06-22"
                }
            ],
            "sampleAppointments": [
                {
                    "id": "1",
                    "customerId": "1",
                    "customerName": "John Smith",
                    "service": "Haircut and styling",
                    "datetime": "2025-06-27T14:30:00",
                    "duration": 60,
                    "price": 45.00,
                    "notes": "Trim sides, keep length on top",
                    "status": "scheduled"
                },
                {
                    "id": "2",
                    "customerId": "2", 
                    "customerName": "Maria Rodriguez",
                    "service": "Color treatment",
                    "datetime": "2025-06-28T10:00:00",
                    "duration": 120,
                    "price": 85.00,
                    "notes": "Root touch-up, usual brown shade",
                    "status": "scheduled"
                }
            ],
            "sampleExpenses": [
                {
                    "id": "1",
                    "amount": 150.00,
                    "category": "Supplies",
                    "description": "Hair products and tools",
                    "date": "2025-06-25",
                    "type": "expense"
                },
                {
                    "id": "2",
                    "amount": 300.00,
                    "category": "Rent",
                    "description": "Shop rent for June",
                    "date": "2025-06-01", 
                    "type": "expense"
                }
            ],
            "serviceTypes": [
                "Haircut",
                "Hair styling", 
                "Color treatment",
                "Highlights",
                "Hair wash",
                "Beard trim",
                "Consultation",
                "Treatment"
            ],
            "expenseCategories": [
                "Supplies",
                "Rent",
                "Utilities", 
                "Marketing",
                "Equipment",
                "Professional development",
                "Insurance",
                "Other"
            ],
            "translations": {
                "en": {
                    "dashboard": "Dashboard",
                    "customers": "Customers", 
                    "appointments": "Appointments",
                    "finances": "Finances",
                    "settings": "Settings",
                    "addCustomer": "Add Customer",
                    "addAppointment": "Add Appointment", 
                    "searchCustomers": "Search customers...",
                    "searchAppointments": "Search appointments...",
                    "todaysAppointments": "Today's Appointments",
                    "upcomingAppointments": "Upcoming",
                    "revenue": "Revenue",
                    "expenses": "Expenses", 
                    "profit": "Profit",
                    "darkMode": "Dark Mode",
                    "language": "Language",
                    "notifications": "Notifications",
                    "loadingApp": "Loading your appointments..."
                },
                "gr": {
                    "dashboard": "Αρχική",
                    "customers": "Πελάτες",
                    "appointments": "Ραντεβού", 
                    "finances": "Οικονομικά",
                    "settings": "Ρυθμίσεις",
                    "addCustomer": "Προσθήκη Πελάτη",
                    "addAppointment": "Προσθήκη Ραντεβού",
                    "searchCustomers": "Αναζήτηση πελατών...",
                    "searchAppointments": "Αναζήτηση ραντεβού...",
                    "todaysAppointments": "Σημερινά Ραντεβού",
                    "upcomingAppointments": "Επόμενα",
                    "revenue": "Έσοδα", 
                    "expenses": "Έξοδα",
                    "profit": "Κέρδος",
                    "darkMode": "Σκοτεινή Λειτουργία",
                    "language": "Γλώσσα",
                    "notifications": "Ειδοποιήσεις",
                    "loadingApp": "Φόρτωση των ραντεβού σας..."
                }
            }
        };

        this.serviceTypes = sampleData.serviceTypes;
        this.expenseCategories = sampleData.expenseCategories;
        this.translations = sampleData.translations;

        // Load sample data if not exists
        if (!localStorage.getItem('customers')) {
            this.customers = sampleData.sampleCustomers;
            this.appointments = sampleData.sampleAppointments;
            this.expenses = sampleData.sampleExpenses;
            this.saveData();
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('ServiceWorker registered:', registration);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        }
    }

    loadSettings() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.notificationsEnabled = localStorage.getItem('notifications') === 'true';
        
        // Apply language
        document.documentElement.lang = this.currentLanguage;
        this.updateTranslations();
    }

    hideSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 500);
    }

    showOnboarding() {
        document.getElementById('onboarding').classList.remove('hidden');
    }

    showApp() {
        document.getElementById('app').classList.remove('hidden');
        this.updateDashboard();
        this.updateCustomersList();
        this.updateAppointmentsList();
        this.updateFinances();
        this.initializeCalendar();
        this.populateDropdowns();
    }

    initializeEventListeners() {
        // Form submissions
        document.getElementById('add-customer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomer();
        });

        document.getElementById('add-appointment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAppointment();
        });

        document.getElementById('add-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Theme toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', this.toggleDarkMode.bind(this));
        }

        // Language change
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', this.changeLanguage.bind(this));
        }

        // Notifications toggle
        const notificationsToggle = document.getElementById('notifications-toggle');
        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', this.toggleNotifications.bind(this));
        }
    }

    initializeNotifications() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.notificationsEnabled = true;
                document.getElementById('notifications-toggle').checked = true;
            }
        }
    }

    // Haptic feedback simulation
    triggerHapticFeedback(type = 'light') {
        // Visual feedback since we can't use actual haptics on web
        const activeElement = document.activeElement;
        if (activeElement) {
            activeElement.classList.add(`haptic-${type}`);
            setTimeout(() => {
                activeElement.classList.remove(`haptic-${type}`);
            }, type === 'light' ? 150 : type === 'medium' ? 200 : 250);
        }

        // Try to use vibration API where available (Android)
        if ('vibrate' in navigator) {
            const pattern = {
                light: [10],
                medium: [20],
                heavy: [30, 10, 30]
            };
            navigator.vibrate(pattern[type] || pattern.light);
        }
    }

    // Onboarding functions
    nextOnboardingStep() {
        this.triggerHapticFeedback('light');
        document.getElementById('step-welcome').classList.add('hidden');
        document.getElementById('step-language').classList.remove('hidden');
    }

    setLanguage(lang) {
        this.triggerHapticFeedback('medium');
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        this.updateTranslations();
        
        document.getElementById('step-language').classList.add('hidden');
        document.getElementById('step-notifications').classList.remove('hidden');
    }

    async requestNotificationPermission() {
        this.triggerHapticFeedback('medium');
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                localStorage.setItem('notifications', 'true');
                this.showToast('success', 'Notifications Enabled', 'You will receive appointment reminders');
            }
        }
        this.completeOnboarding();
    }

    skipNotifications() {
        this.triggerHapticFeedback('light');
        this.completeOnboarding();
    }

    completeOnboarding() {
        localStorage.setItem('onboarded', 'true');
        this.isOnboarded = true;
        document.getElementById('onboarding').classList.add('hidden');
        this.showApp();
        this.showToast('success', 'Welcome to AppointPro!', 'Your professional appointment manager is ready');
    }

    // Translation system
    updateTranslations() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translations[this.currentLanguage][key];
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update language select
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }

    // Navigation
    switchTab(tabName) {
        this.triggerHapticFeedback('light');
        
        // Update active states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Update nav title
        const navTitle = document.getElementById('nav-title');
        const titleKey = tabName;
        navTitle.textContent = this.translations[this.currentLanguage][titleKey] || tabName;

        this.currentTab = tabName;

        // Update content based on tab
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'customers':
                this.updateCustomersList();
                break;
            case 'appointments':
                this.updateAppointmentsList();
                this.initializeCalendar();
                break;
            case 'finances':
                this.updateFinances();
                break;
        }
    }

    // Search functionality
    toggleSearch() {
        this.triggerHapticFeedback('light');
        const searchBar = document.getElementById('search-bar');
        const searchInput = document.getElementById('search-input');
        
        searchBar.classList.toggle('hidden');
        
        if (!searchBar.classList.contains('hidden')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            document.getElementById('search-results').classList.add('hidden');
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            document.getElementById('search-results').classList.add('hidden');
            return;
        }

        const results = [];
        
        // Search customers
        this.customers.forEach(customer => {
            if (customer.name.toLowerCase().includes(query.toLowerCase()) ||
                customer.phone.includes(query)) {
                results.push({
                    type: 'customer',
                    data: customer,
                    title: customer.name,
                    subtitle: customer.phone
                });
            }
        });

        // Search appointments
        this.appointments.forEach(appointment => {
            if (appointment.customerName.toLowerCase().includes(query.toLowerCase()) ||
                appointment.service.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    type: 'appointment',
                    data: appointment,
                    title: appointment.service,
                    subtitle: `${appointment.customerName} - ${this.formatDate(appointment.datetime)}`
                });
            }
        });

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="app.selectSearchResult('${result.type}', '${result.data.id}')">
                    <div class="search-result-info">
                        <h4>${result.title}</h4>
                        <p>${result.subtitle}</p>
                    </div>
                    <div class="search-result-type">${result.type}</div>
                </div>
            `).join('');
        }
        
        searchResults.classList.remove('hidden');
    }

    selectSearchResult(type, id) {
        this.triggerHapticFeedback('medium');
        this.toggleSearch();
        
        if (type === 'customer') {
            this.switchTab('customers');
        } else if (type === 'appointment') {
            this.switchTab('appointments');
        }
    }

    // Calendar functionality
    initializeCalendar() {
        this.updateCalendarTitle();
        this.generateCalendar();
    }

    updateCalendarTitle() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        document.getElementById('calendar-title').textContent = `${months[this.currentMonth]} ${this.currentYear}`;
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const today = new Date();
        
        let html = '';
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Previous month's trailing days
        const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = date.toDateString() === today.toDateString();
            const hasAppointments = this.hasAppointmentsOnDate(date);
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasAppointments) classes += ' has-appointments';
            
            html += `<div class="${classes}" onclick="app.selectCalendarDay(${day})">${day}</div>`;
        }

        // Next month's leading days
        const remainingCells = 42 - (firstDay + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        calendarGrid.innerHTML = html;
    }

    hasAppointmentsOnDate(date) {
        return this.appointments.some(appointment => {
            const appointmentDate = new Date(appointment.datetime);
            return appointmentDate.toDateString() === date.toDateString();
        });
    }

    selectCalendarDay(day) {
        this.triggerHapticFeedback('light');
        // Could show day view or appointment details
        console.log('Selected day:', day);
    }

    changeMonth(direction) {
        this.triggerHapticFeedback('light');
        this.currentMonth += direction;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.initializeCalendar();
    }

    switchAppointmentsView(view) {
        this.triggerHapticFeedback('light');
        document.querySelectorAll('.view-toggle').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        if (view === 'calendar') {
            document.getElementById('calendar-view').classList.remove('hidden');
            document.getElementById('appointments-list-view').classList.add('hidden');
        } else {
            document.getElementById('calendar-view').classList.add('hidden');
            document.getElementById('appointments-list-view').classList.remove('hidden');
            this.updateAppointmentsList();
        }
        
        this.currentView = view;
    }

    // Data management
    loadData() {
        try {
            this.customers = JSON.parse(localStorage.getItem('customers')) || [];
            this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        } catch (error) {
            console.error('Error loading data:', error);
            this.loadSampleData();
        }
    }

    saveData() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    // Customer management
    addCustomer() {
        this.triggerHapticFeedback('medium');
        
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const notes = document.getElementById('customer-notes').value.trim();

        if (!name || !phone) {
            this.showToast('error', 'Error', 'Name and phone are required');
            return;
        }

        const customer = {
            id: Date.now().toString(),
            name,
            phone,
            notes,
            createdDate: new Date().toISOString().split('T')[0],
            totalAppointments: 0,
            lastVisit: null
        };

        this.customers.push(customer);
        this.saveData();
        this.closeModal();
        this.updateCustomersList();
        this.populateDropdowns();
        this.showToast('success', 'Customer Added', `${name} has been added successfully`);
    }

    updateCustomersList() {
        const customersList = document.getElementById('customers-list');
        
        if (this.customers.length === 0) {
            customersList.innerHTML = `
                <div class="empty-state">
                    <h3>No Customers Yet</h3>
                    <p>Add your first customer to get started</p>
                    <button class="btn btn-primary" onclick="app.showAddCustomerModal()">Add Customer</button>
                </div>
            `;
            return;
        }

        customersList.innerHTML = this.customers.map(customer => `
            <div class="customer-item" onclick="app.viewCustomer('${customer.id}')">
                <div class="customer-header">
                    <h3 class="customer-name">${customer.name}</h3>
                    <span class="customer-phone">${customer.phone}</span>
                </div>
                <div class="customer-stats">
                    <span class="customer-stat">
                        <strong>${customer.totalAppointments}</strong> appointments
                    </span>
                    ${customer.lastVisit ? `<span class="customer-stat">Last visit: ${this.formatDate(customer.lastVisit)}</span>` : ''}
                </div>
                ${customer.notes ? `<p class="customer-notes">${customer.notes}</p>` : ''}
            </div>
        `).join('');
    }

    viewCustomer(customerId) {
        this.triggerHapticFeedback('light');
        // Could show customer details modal
        console.log('Viewing customer:', customerId);
    }

    // Appointment management
    addAppointment() {
        this.triggerHapticFeedback('medium');
        
        const customerId = document.getElementById('appointment-customer').value;
        const service = document.getElementById('appointment-service').value;
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;
        const duration = parseInt(document.getElementById('appointment-duration').value);
        const price = parseFloat(document.getElementById('appointment-price').value) || 0;
        const notes = document.getElementById('appointment-notes').value.trim();

        if (!customerId || !service || !date || !time) {
            this.showToast('error', 'Error', 'Please fill all required fields');
            return;
        }

        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) {
            this.showToast('error', 'Error', 'Customer not found');
            return;
        }

        const appointment = {
            id: Date.now().toString(),
            customerId,
            customerName: customer.name,
            service,
            datetime: `${date}T${time}:00`,
            duration,
            price,
            notes,
            status: 'scheduled',
            createdDate: new Date().toISOString()
        };

        this.appointments.push(appointment);
        
        // Update customer stats
        customer.totalAppointments++;
        customer.lastVisit = appointment.datetime;
        
        this.saveData();
        this.closeModal();
        this.updateAppointmentsList();
        this.updateDashboard();
        this.updateFinances();
        this.initializeCalendar();
        
        this.showToast('success', 'Appointment Scheduled', `${service} for ${customer.name}`);
        
        // Schedule notification
        this.scheduleAppointmentNotification(appointment);
    }

    updateAppointmentsList() {
        const appointmentsList = document.getElementById('appointments-list');
        
        if (this.appointments.length === 0) {
            appointmentsList.innerHTML = `
                <div class="empty-state">
                    <h3>No Appointments</h3>
                    <p>Schedule your first appointment</p>
                    <button class="btn btn-primary" onclick="app.showAddAppointmentModal()">Add Appointment</button>
                </div>
            `;
            return;
        }

        const sortedAppointments = [...this.appointments].sort((a, b) => 
            new Date(a.datetime) - new Date(b.datetime)
        );

        appointmentsList.innerHTML = sortedAppointments.map(appointment => `
            <div class="appointment-item" onclick="app.viewAppointment('${appointment.id}')">
                <div class="appointment-info">
                    <h4>${appointment.service}</h4>
                    <p>${appointment.customerName}</p>
                    ${appointment.notes ? `<p class="appointment-notes">${appointment.notes}</p>` : ''}
                </div>
                <div class="appointment-time">
                    <span class="time">${this.formatDateTime(appointment.datetime)}</span>
                    ${appointment.price > 0 ? `<span class="price">$${appointment.price.toFixed(2)}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    viewAppointment(appointmentId) {
        this.triggerHapticFeedback('light');
        // Could show appointment details modal
        console.log('Viewing appointment:', appointmentId);
    }

    // Financial management
    addExpense() {
        this.triggerHapticFeedback('medium');
        
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const description = document.getElementById('expense-description').value.trim();
        const date = document.getElementById('expense-date').value;

        if (!amount || !category || !description || !date) {
            this.showToast('error', 'Error', 'Please fill all required fields');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            amount,
            category,
            description,
            date,
            type: 'expense'
        };

        this.expenses.push(expense);
        this.saveData();
        this.closeModal();
        this.updateFinances();
        this.showToast('success', 'Expense Added', `$${amount.toFixed(2)} ${category} expense added`);
    }

    updateFinances() {
        // Calculate totals
        const totalIncome = this.appointments
            .filter(app => app.status === 'completed' && app.price > 0)
            .reduce((sum, app) => sum + app.price, 0);
        
        const totalExpenses = this.expenses
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const totalProfit = totalIncome - totalExpenses;

        // Update finance cards
        document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('total-profit').textContent = `$${totalProfit.toFixed(2)}`;

        // Update monthly revenue on dashboard
        document.getElementById('monthly-revenue').textContent = `$${totalIncome.toFixed(2)}`;

        // Update transactions list
        this.updateTransactionsList();
    }

    updateTransactionsList() {
        const transactionsList = document.getElementById('transactions-list');
        
        const transactions = [
            ...this.appointments
                .filter(app => app.price > 0)
                .map(app => ({
                    ...app,
                    type: 'income',
                    amount: app.price,
                    description: `${app.service} - ${app.customerName}`,
                    date: app.datetime
                })),
            ...this.expenses
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (transactions.length === 0) {
            transactionsList.innerHTML = '<div class="empty-state"><p>No transactions yet</p></div>';
            return;
        }

        transactionsList.innerHTML = transactions.slice(0, 10).map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <h4>${transaction.description || transaction.service}</h4>
                    <p>${transaction.category || 'Service'}</p>
                </div>
                <div class="transaction-amount">
                    <span class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </span>
                    <span class="date">${this.formatDate(transaction.date)}</span>
                </div>
            </div>
        `).join('');
    }

    // Dashboard updates
    updateDashboard() {
        // Update today's appointments count
        const today = new Date().toDateString();
        const todayAppointments = this.appointments.filter(app => {
            const appDate = new Date(app.datetime).toDateString();
            return appDate === today;
        });
        
        document.getElementById('today-count').textContent = todayAppointments.length;

        // Update total customers
        document.getElementById('total-customers').textContent = this.customers.length;

        // Update upcoming appointments
        this.updateUpcomingAppointments();
    }

    updateUpcomingAppointments() {
        const upcomingContainer = document.getElementById('upcoming-appointments');
        const now = new Date();
        
        const upcoming = this.appointments
            .filter(app => new Date(app.datetime) > now)
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
            .slice(0, 5);

        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<div class="empty-state"><p>No upcoming appointments</p></div>';
            return;
        }

        upcomingContainer.innerHTML = upcoming.map(appointment => `
            <div class="appointment-item" onclick="app.viewAppointment('${appointment.id}')">
                <div class="appointment-info">
                    <h4>${appointment.service}</h4>
                    <p>${appointment.customerName}</p>
                </div>
                <div class="appointment-time">
                    <span class="time">${this.formatDateTime(appointment.datetime)}</span>
                    ${appointment.price > 0 ? `<span class="price">$${appointment.price.toFixed(2)}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Modal management
    showAddModal() {
        this.triggerHapticFeedback('light');
        if (this.currentTab === 'customers') {
            this.showAddCustomerModal();
        } else if (this.currentTab === 'appointments') {
            this.showAddAppointmentModal();
        } else if (this.currentTab === 'finances') {
            this.showAddExpenseModal();
        }
    }

    showAddCustomerModal() {
        this.triggerHapticFeedback('light');
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.getElementById('add-customer-modal').style.display = 'block';
        document.getElementById('customer-name').focus();
    }

    showAddAppointmentModal() {
        this.triggerHapticFeedback('light');
        this.populateDropdowns();
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.getElementById('add-appointment-modal').style.display = 'block';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointment-date').value = today;
    }

    showAddExpenseModal() {
        this.triggerHapticFeedback('light');
        this.populateExpenseCategories();
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.getElementById('add-expense-modal').style.display = 'block';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expense-date').value = today;
    }

    closeModal() {
        this.triggerHapticFeedback('light');
        document.getElementById('modal-overlay').classList.add('hidden');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Reset forms
        document.querySelectorAll('form').forEach(form => form.reset());
    }

    populateDropdowns() {
        // Populate customers dropdown
        const customerSelect = document.getElementById('appointment-customer');
        customerSelect.innerHTML = '<option value="">Select Customer</option>' +
            this.customers.map(customer => 
                `<option value="${customer.id}">${customer.name}</option>`
            ).join('');

        // Populate services dropdown
        const serviceSelect = document.getElementById('appointment-service');
        serviceSelect.innerHTML = '<option value="">Select Service</option>' +
            this.serviceTypes.map(service => 
                `<option value="${service}">${service}</option>`
            ).join('');
    }

    populateExpenseCategories() {
        const categorySelect = document.getElementById('expense-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>' +
            this.expenseCategories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('');
    }

    // Notification system
    scheduleAppointmentNotification(appointment) {
        if (!this.notificationsEnabled) return;

        const appointmentTime = new Date(appointment.datetime);
        const notificationTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000); // 30 minutes before
        const now = new Date();

        if (notificationTime > now) {
            const timeUntilNotification = notificationTime.getTime() - now.getTime();
            
            setTimeout(() => {
                this.showNotification(
                    'Upcoming Appointment',
                    `${appointment.service} with ${appointment.customerName} in 30 minutes`,
                    'appointment-reminder'
                );
            }, timeUntilNotification);
        }
    }

    scheduleNotifications() {
        // Schedule notifications for all upcoming appointments
        this.appointments.forEach(appointment => {
            if (appointment.status === 'scheduled') {
                this.scheduleAppointmentNotification(appointment);
            }
        });
    }

    showNotification(title, body, tag) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                tag,
                icon: '/icon-192x192.png',
                requireInteraction: true
            });
        }
        
        // Also show toast notification
        this.showToast('info', title, body);
    }

    // Settings
    toggleDarkMode() {
        this.triggerHapticFeedback('light');
        const isDark = document.getElementById('dark-mode-toggle').checked;
        localStorage.setItem('darkMode', isDark);
        this.applyTheme();
    }

    applyTheme() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        document.getElementById('dark-mode-toggle').checked = isDark;
        
        if (isDark) {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
        } else {
            document.documentElement.setAttribute('data-color-scheme', 'light');
        }
    }

    changeLanguage() {
        const language = document.getElementById('language-select').value;
        this.setLanguage(language);
    }

    toggleNotifications() {
        this.triggerHapticFeedback('light');
        this.notificationsEnabled = document.getElementById('notifications-toggle').checked;
        localStorage.setItem('notifications', this.notificationsEnabled);
        
        if (this.notificationsEnabled && 'Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    exportData() {
        this.triggerHapticFeedback('medium');
        const data = {
            customers: this.customers,
            appointments: this.appointments,
            expenses: this.expenses,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointpro-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('success', 'Data Exported', 'Your data has been downloaded');
    }

    clearData() {
        this.triggerHapticFeedback('heavy');
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    }

    // Utility functions
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showToast(type, title, message) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const iconMap = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast-icon ${type}">
                <span>${iconMap[type]}</span>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 4000);
    }
}

// Global functions for HTML onclick handlers
window.app = null;

function nextOnboardingStep() {
    app.nextOnboardingStep();
}

function setLanguage(lang) {
    app.setLanguage(lang);
}

function requestNotificationPermission() {
    app.requestNotificationPermission();
}

function skipNotifications() {
    app.skipNotifications();
}

function switchTab(tab) {
    app.switchTab(tab);
}

function toggleSearch() {
    app.toggleSearch();
}

function showAddModal() {
    app.showAddModal();
}

function showAddCustomerModal() {
    app.showAddCustomerModal();
}

function showAddAppointmentModal() {
    app.showAddAppointmentModal();
}

function showAddExpenseModal() {
    app.showAddExpenseModal();
}

function closeModal() {
    app.closeModal();
}

function switchAppointmentsView(view) {
    app.switchAppointmentsView(view);
}

function changeMonth(direction) {
    app.changeMonth(direction);
}

function toggleDarkMode() {
    app.toggleDarkMode();
}

function changeLanguage() {
    app.changeLanguage();
}

function toggleNotifications() {
    app.toggleNotifications();
}

function exportData() {
    app.exportData();
}

function clearData() {
    app.clearData();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppointPro();
});

// Handle modal overlay clicks
document.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        closeModal();
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        if (!document.getElementById('search-bar').classList.contains('hidden')) {
            toggleSearch();
        }
    }
});