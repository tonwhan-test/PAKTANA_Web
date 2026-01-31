// Replace this with your actual Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzUYk9O3Rk1Ahso7EjzNkdQW2nDM5zbZfh-P-Jycd8gvqP2FSXx0ohhRkWluaWA18LL/exec';

window.AppState = {
    memberData: {},
    galleryData: {},
    policyData: [],
    isAdminLoggedIn: false
};

// Make fetchHeroSlides globally accessible for Admin Management actions
window.fetchHeroSlides = async () => {
    try {
        const slides = await window.SliderService.fetchHeroSlides();
        window.Renderers.renderHeroSlides(slides);
    } catch (err) {
        console.error('Error fetching/rendering slides:', err);
    }
};

async function initApp() {
    // 1. Check Admin Session
    window.AppState.isAdminLoggedIn = await window.AdminAuth.checkSession();
    if (window.Helpers.checkAdminAuth) window.Helpers.checkAdminAuth();

    // 2. Initialize UI Components
    window.Navigation.init();
    if (window.AdminManagement) window.AdminManagement.init();
    setupContactForm();

    // 3. Fetch Data and Render
    try {
        const [members, policies, gallery] = await Promise.all([
            window.MemberService.fetchMembers(),
            window.PolicyService.fetchPolicies(),
            window.GalleryService.fetchGallery()
        ]);

        window.Renderers.renderMembers(members);
        window.Renderers.renderPolicies(policies);
        window.Renderers.renderGallery(gallery);

        // Load slides via the global function
        await window.fetchHeroSlides();

        // 4. Analytics
        if (window.AnalyticsService) {
            window.AnalyticsService.trackUniqueVisit();
        }
    } catch (err) {
        console.error('Initial Data Fetch Error:', err);
    }

    // 5. Setup Realtime Updates
    setupRealtimeUpdates();
}

function setupRealtimeUpdates() {
    if (!window.supabaseClient) return;

    window.supabaseClient.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
            window.MemberService.fetchMembers().then(m => window.Renderers.renderMembers(m));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'policies' }, () => {
            window.PolicyService.fetchPolicies().then(p => window.Renderers.renderPolicies(p));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
            window.GalleryService.fetchGallery().then(g => window.Renderers.renderGallery(g));
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
            window.fetchHeroSlides();
        })
        .subscribe();
}

function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        // Basic Validation
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const subject = document.getElementById('contactSubject').value;
        const message = document.getElementById('contactMessageText').value;

        if (!name || !email || !message) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        submitBtn.innerText = 'กำลังส่ง...';
        submitBtn.disabled = true;

        try {
            // Send to Supabase (which should trigger the webhook to Google Sheets)
            const { data, error } = await window.supabaseClient
                .from('contact_submissions')
                .insert([
                    {
                        name: name,
                        email: email,
                        subject: subject,
                        message: message,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;

            alert('ส่งข้อความเรียบร้อยแล้ว! ขอบคุณสำหรับความคิดเห็น');
            form.reset();
        } catch (err) {
            console.error('Contact Error:', err);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + err.message);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
