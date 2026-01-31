window.AdminAuth = {
    async checkSession() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        const loggedIn = !!session;
        this.updateAdminUI(loggedIn);
        return loggedIn;
    },

    async login(email, password) {
        const mappedEmail = email.includes('@') ? email : `${email}@admin.com`;
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: mappedEmail,
            password: password
        });
        if (error) throw error;

        window.AppState.isAdminLoggedIn = true;
        this.updateAdminUI(true);
        // Navigate to home or show admin panel
        if (window.Navigation) window.Navigation.navigateToPage('home');
        window.Helpers.showSuccessToast('เข้าสู่ระบบสำเร็จ');
        return data;
    },

    async logout() {
        if (!confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return;
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        window.AppState.isAdminLoggedIn = false;
        this.updateAdminUI(false);
        location.reload();
    },

    updateAdminUI(loggedIn) {
        document.body.classList.toggle('admin-active', loggedIn);
        const toolbar = document.getElementById('adminToolbar');
        if (toolbar) toolbar.classList.toggle('show', loggedIn);

        // Show/hide edit buttons
        document.querySelectorAll('.admin-edit-btn').forEach(btn => {
            btn.style.display = loggedIn ? 'block' : 'none';
        });

        // Hide floating rate button for admin
        const rateBtn = document.getElementById('floatingRateBtn');
        if (rateBtn) {
            rateBtn.style.display = loggedIn ? 'none' : '';
        }

        // --- NEW: Call checkAdminAuth to handle .admin-only links (remove 'hidden' class) ---
        if (window.Helpers && window.Helpers.checkAdminAuth) {
            window.Helpers.checkAdminAuth();
        }

        // Toggle admin section visibility
        const adminSection = document.getElementById('adminLoginSection');
        if (adminSection) {
            // If logged in, we might want to hide the login form
            if (loggedIn) {
                // But we usually just rely on navigation to other pages
            }
        }
    }
};

window.logoutAdmin = () => window.AdminAuth.logout();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.innerHTML = '⏳ Authenticating...';

            const user = document.getElementById('adminUsername').value;
            const pass = document.getElementById('adminPassword').value;

            try {
                await window.AdminAuth.login(user, pass);
                loginForm.reset();
            } catch (err) {
                console.error(err);
                const msg = document.getElementById('adminLoginMessage');
                if (msg) {
                    msg.innerHTML = `
                        <div class="flex items-center gap-2 text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-500/30">
                            <span>❌</span>
                            <span>Login Failed: ${err.message}</span>
                        </div>
                    `;
                    msg.classList.add('show');
                }
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});
