// Notification system
function showNotification(message, type = 'info') {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.id = 'notificationContainer';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        primary: 'fa-bell'
    };
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="close-notification" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(notification);
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Confirmation dialog system
let confirmCallback = null;
function showConfirmation(message, callback) {
    let overlay = document.getElementById('dialogOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.id = 'dialogOverlay';
        overlay.innerHTML = `
            <div class="dialog">
                <div class="dialog-header">
                    <div class="dialog-title">Confirmation</div>
                    <button class="close-dialog" onclick="closeDialog()">&times;</button>
                </div>
                <div class="dialog-body">
                    <p class="dialog-message" id="dialogMessage">Are you sure you want to perform this action?</p>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn cancel" onclick="closeDialog()">Cancel</button>
                    <button class="dialog-btn confirm" onclick="confirmAction()">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    document.getElementById('dialogMessage').textContent = message;
    overlay.classList.add('active');
    confirmCallback = callback;
}
function closeDialog() {
    let overlay = document.getElementById('dialogOverlay');
    if (overlay) overlay.classList.remove('active');
    confirmCallback = null;
}
function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeDialog();
}
