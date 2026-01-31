window.Helpers = {
    async getFileHash(file) {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-[10000] font-semibold';
        toast.innerHTML = `✓ ${message} `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    checkAdminAuth() {
        if (!window.AppState) return;

        // Handle Admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (window.AppState.isAdminLoggedIn) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        // Handle Visitor-only elements (e.g. Login link in navbar)
        const visitorElements = document.querySelectorAll('.visitor-only');
        visitorElements.forEach(el => {
            if (window.AppState.isAdminLoggedIn) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        });
    }
};
window.showSuccessToast = (msg) => window.Helpers.showSuccessToast(msg);
window.getFileHash = (f) => window.Helpers.getFileHash(f);
