// static/js/tickets.js
class TicketSystem {
    constructor() {
        this.initEventListeners();
        this.updateStatsPeriodically();
    }

    initEventListeners() {
        // مدیریت انتساب تیکت‌ها
        document.querySelectorAll('.assign-btn').forEach(btn => {
            btn.addEventListener('click', this.handleTicketAssignment.bind(this));
        });

        // مدیریت تغییر وضعیت
        document.querySelectorAll('.status-change-btn').forEach(btn => {
            btn.addEventListener('click', this.handleStatusChange.bind(this));
        });

        // جستجوی تیکت‌ها
        const searchInput = document.getElementById('ticketSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }

    async handleTicketAssignment(event) {
        const button = event.target;
        const ticketId = button.dataset.ticketId;

        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال انتساب...';

            const response = await fetch(`/ticket/admin/tickets/${ticketId}/assign/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                button.innerHTML = '<i class="fas fa-check"></i> محول شد';
                button.classList.remove('btn-outline-success');
                button.classList.add('btn-success');

                // بروزرسانی UI
                const row = button.closest('tr');
                row.classList.add('table-info');

                this.showNotification('تیکت با موفقیت به شما محول شد', 'success');
            }
        } catch (error) {
            console.error('Error assigning ticket:', error);
            button.disabled = false;
            button.innerHTML = 'انتساب به من';
            this.showNotification('خطا در انتساب تیکت', 'error');
        }
    }

    async handleStatusChange(event) {
        const button = event.target;
        const ticketId = button.dataset.ticketId;
        const newStatusId = button.dataset.statusId;

        try {
            const response = await fetch(`/ticket/admin/tickets/${ticketId}/change-status/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `status=${newStatusId}`
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('وضعیت تیکت با موفقیت تغییر کرد', 'success');
                // ریلود صفحه برای بروزرسانی وضعیت
                setTimeout(() => location.reload(), 1000);
            }
        } catch (error) {
            console.error('Error changing ticket status:', error);
            this.showNotification('خطا در تغییر وضعیت تیکت', 'error');
        }
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    async updateStatsPeriodically() {
        // بروزرسانی آمار هر 30 ثانیه
        setInterval(async () => {
            try {
                const response = await fetch('/ticket/admin/tickets/stats/api/');
                const stats = await response.json();

                this.updateStatsDisplay(stats);
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }, 30000);
    }

    updateStatsDisplay(stats) {
        // بروزرسانی نمایش آمار در صفحه
        const elements = {
            'total': document.querySelector('.stats-total'),
            'open': document.querySelector('.stats-open'),
            'unread': document.querySelector('.stats-unread'),
            'assigned_to_me': document.querySelector('.stats-assigned')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (element) {
                element.textContent = stats[`${key}_tickets`];
            }
        }
    }

    showNotification(message, type = 'info') {
        // ایجاد نوتیفیکیشن سفارشی
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.notification-container') || this.createNotificationContainer();
        container.appendChild(notification);

        // حذف خودکار نوتیفیکیشن بعد از 5 ثانیه
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
}

// مقداردهی اولیه زمانی که DOM لود شد
document.addEventListener('DOMContentLoaded', function() {
    new TicketSystem();
});