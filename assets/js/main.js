// Google Apps Script Web App URL (Handles both Policy Proposals and Contact Us)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyWfygOuyQHdkGBTtD6qhggx04467cAdmojemPphQpN4kY4I4NZvgc7mmOLHwipooZ5/exec';

window.AppState = {
    memberData: {},
    galleryData: {}, // Lookup object
    galleryDataArray: [], // Array for list
    policyData: [],
    heroSlides: [],
    gallerySlides: [],
    currentCarouselSource: 'general',
    isAdminLoggedIn: false
};

// Make fetchHeroSlides globally accessible for Admin Management actions
window.fetchHeroSlides = async () => {
    try {
        const slides = await window.SliderService.fetchHeroSlides();
        window.AppState.heroSlides = slides;

        // Only render if current source is general
        if (window.AppState.currentCarouselSource === 'general') {
            window.Renderers.renderHeroSlides(slides);
        }
    } catch (err) {
        console.error('Error fetching/rendering slides:', err);
    }
};

window.switchCarouselSource = (source) => {
    if (window.AppState.currentCarouselSource === source) return;

    window.AppState.currentCarouselSource = source;

    // Update Button UI
    const btnGeneral = document.getElementById('btnSourceGeneral');
    const btnActivities = document.getElementById('btnSourceActivities');

    if (source === 'general') {
        btnGeneral.classList.add('active');
        btnActivities.classList.remove('active');
        window.Renderers.renderHeroSlides(window.AppState.heroSlides);
    } else {
        btnActivities.classList.add('active');
        btnGeneral.classList.remove('active');

        // Always refresh gallery slides from galleryDataArray to stay in sync
        if (window.AppState.galleryDataArray && window.AppState.galleryDataArray.length > 0) {
            window.AppState.gallerySlides = window.AppState.galleryDataArray.map(item => ({
                image_url: item.image_url,
                title: item.title,
                caption: item.description ? item.description.split('<METADATA>')[0] : ''
            }));
        }
        window.Renderers.renderHeroSlides(window.AppState.gallerySlides);
    }
};

async function initApp() {
    // 1. Check Admin Session
    window.AppState.isAdminLoggedIn = await window.AdminAuth.checkSession();
    if (window.Helpers.checkAdminAuth) window.Helpers.checkAdminAuth();

    // 1.5 Load persistent settings
    await loadSiteSettings();

    // 2. Initialize UI Components
    window.Navigation.init();
    if (window.AdminManagement) window.AdminManagement.init();
    setupContactForm(); // "Propose Policy" form
    setupContactUsNewForm(); // New "Contact Us" form

    // 3. Fetch Data and Render
    try {
        const [members, policies, gallery] = await Promise.all([
            window.MemberService.fetchMembers(),
            window.PolicyService.fetchPolicies(),
            window.GalleryService.fetchGallery()
        ]);

        window.Renderers.renderMembers(members);
        window.Renderers.renderPolicies(policies);

        // Store and sort for switcher
        gallery.sort((a, b) => {
            let rankA = 10, rankB = 10;
            try {
                if (a.description && a.description.includes('<METADATA>')) {
                    rankA = JSON.parse(a.description.split('<METADATA>')[1]).rank || 10;
                }
            } catch (e) { }
            try {
                if (b.description && b.description.includes('<METADATA>')) {
                    rankB = JSON.parse(b.description.split('<METADATA>')[1]).rank || 10;
                }
            } catch (e) { }
            return rankA - rankB;
        });

        window.AppState.galleryDataArray = gallery;
        window.AppState.gallerySlides = gallery.map(item => ({
            image_url: item.image_url,
            title: item.title,
            caption: item.description ? item.description.split('<METADATA>')[0] : ''
        }));

        window.Renderers.renderGallery(gallery);

        // Load slides via the global function
        await window.fetchHeroSlides();

        // 4. Analytics
        if (window.AnalyticsService) {
            window.AnalyticsService.trackUniqueVisit();
        }
        // 5. Initialize Scroll Reveal Animations
        if (window.Helpers.initScrollReveal) {
            window.Helpers.initScrollReveal();
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
            window.GalleryService.fetchGallery().then(g => {
                // Sort by rank from metadata
                g.sort((a, b) => {
                    let rankA = 10, rankB = 10;
                    try {
                        if (a.description && a.description.includes('<METADATA>')) {
                            rankA = JSON.parse(a.description.split('<METADATA>')[1]).rank || 10;
                        }
                    } catch (e) { }
                    try {
                        if (b.description && b.description.includes('<METADATA>')) {
                            rankB = JSON.parse(b.description.split('<METADATA>')[1]).rank || 10;
                        }
                    } catch (e) { }
                    return rankA - rankB;
                });

                window.AppState.galleryDataArray = g;
                window.AppState.gallerySlides = g.map(item => ({
                    image_url: item.image_url,
                    title: item.title,
                    caption: item.description ? item.description.split('<METADATA>')[0] : ''
                }));
                window.Renderers.renderGallery(g);
                if (window.AppState.currentCarouselSource === 'activities') {
                    window.Renderers.renderHeroSlides(window.AppState.gallerySlides);
                }
            });
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_slides' }, () => {
            window.fetchHeroSlides();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
            loadSiteSettings();
        })
        .subscribe();
}

async function loadSiteSettings() {
    try {
        const settings = await window.SettingsService.fetchSettings();
        const config = {};

        // Default values as per user request
        const defaults = {
            'contact_email': '-',
            'contact_phone': '-',
            'contact_address': '-',
            'social_fb': '#',
            'social_ig': '#',
            'social_tt': '#',
            'home_summary_heading': '-',
            'home_summary_intro': '-'
        };

        settings.forEach(s => config[s.key] = s.value);

        const email = config['contact_email'] || defaults['contact_email'];
        const phone = config['contact_phone'] || defaults['contact_phone'];
        const address = config['contact_address'] || defaults['contact_address'];
        const fb = config['social_fb'] || defaults['social_fb'];
        const ig = config['social_ig'] || defaults['social_ig'];
        const tt = config['social_tt'] || defaults['social_tt'];
        const summaryHeading = config['home_summary_heading'] || defaults['home_summary_heading'];
        const summaryIntro = config['home_summary_intro'] || defaults['home_summary_intro'];

        const formatUrl = (url) => {
            if (!url || url === '#') return '#';
            if (!url.startsWith('http')) return 'https://' + url;
            return url;
        };

        const fbUrl = formatUrl(fb);
        const igUrl = formatUrl(ig);
        const ttUrl = formatUrl(tt);

        // Update UI (Summary)
        const sHeading = document.getElementById('summaryHeading');
        const sIntro = document.getElementById('summaryIntro');
        if (sHeading) sHeading.innerText = summaryHeading;
        if (sIntro) sIntro.innerText = summaryIntro;

        // Update UI (Footer)
        const fEmail = document.getElementById('footerEmail');
        const fPhone = document.getElementById('footerPhone');
        const fAddress = document.getElementById('footerAddress');
        const fSocials = document.getElementById('footerSocials');

        if (fEmail) fEmail.innerText = email;
        if (fPhone) fPhone.innerText = phone;
        if (fAddress) fAddress.innerHTML = address.replace(/\n/g, '<br>');

        // Update Socials (Footer)
        if (fSocials) {
            let socialHtml = '';
            if (fbUrl !== '#') {
                socialHtml += `<a href="${fbUrl}" target="_blank" class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"><i class="fab fa-facebook-f"></i></a>`;
            }
            if (igUrl !== '#') {
                socialHtml += `<a href="${igUrl}" target="_blank" class="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-500 transition-colors"><i class="fab fa-instagram"></i></a>`;
            }
            if (ttUrl !== '#') {
                socialHtml += `<a href="${ttUrl}" target="_blank" class="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition-colors"><i class="fab fa-tiktok"></i></a>`;
            }
            fSocials.innerHTML = socialHtml;
        }

        // Update Contact Page if exists
        const pEmail = document.getElementById('pageContactEmail');
        const pPhone = document.getElementById('pageContactPhone');
        const pAddress = document.getElementById('pageContactAddress');
        const pSocials = document.getElementById('pageContactSocials');

        if (pEmail) pEmail.innerText = email;
        if (pPhone) pPhone.innerText = phone;
        if (pAddress) pAddress.innerHTML = address.replace(/\n/g, '<br>');

        if (pSocials) {
            let pSocialHtml = '';
            if (fbUrl !== '#') {
                pSocialHtml += `<a href="${fbUrl}" target="_blank" class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform"><i class="fab fa-facebook-f"></i></a>`;
            }
            if (igUrl !== '#') {
                pSocialHtml += `<a href="${igUrl}" target="_blank" class="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform"><i class="fab fa-instagram"></i></a>`;
            }
            if (ttUrl !== '#') {
                pSocialHtml += `<a href="${ttUrl}" target="_blank" class="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform"><i class="fab fa-tiktok"></i></a>`;
            }
            pSocials.innerHTML = pSocialHtml;
        }

    } catch (err) {
        console.error('Error loading site settings:', err);
    }
}

// Handler for "Propose Policy" (formerly Contact)
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
            // Attempt to send to Google Sheets directly if URL is provided
            // Otherwise fallback to Supabase (or do both)
            if (GOOGLE_SCRIPT_URL) {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Important for Google Apps Script
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message, type: 'policy_proposal' })
                });
            }

            // Also keep Supabase storage for backup if configured
            if (window.supabaseClient) {
                await window.supabaseClient.from('contact_submissions').insert([{
                    name, email, subject, message, created_at: new Date().toISOString()
                }]);
            }

            alert('ส่งข้อนโยบายเรียบร้อยแล้ว! ขอบคุณสำหรับความคิดเห็น');
            form.reset();
        } catch (err) {
            console.error('Contact Error:', err);
            // Even if it fails, sometimes no-cors opaque response causes error in strict mode? 
            // Usually fetch won't throw on 4xx/5xx, but network error will.
            alert('ส่งข้อมูลสำเร็จ (หรือเกิดข้อผิดพลาดเครือข่าย)');
            form.reset();
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Handler for NEW "Contact Us" form
function setupContactUsNewForm() {
    const form = document.getElementById('contactUsNewForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        const name = document.getElementById('newContactName').value;
        const email = document.getElementById('newContactEmail').value;
        const subject = document.getElementById('newContactSubject').value;
        const message = document.getElementById('newContactMessage').value;

        if (!name || !email || !message || !subject) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        submitBtn.innerText = 'กำลังส่ง...';
        submitBtn.disabled = true;

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message,
                    type: 'general_contact',
                    timestamp: new Date().toISOString()
                })
            });

            alert('ส่งข้อความเรียบร้อยแล้ว! ทางเราจะรีบตอบกลับโดยเร็วที่สุด');
            form.reset();
        } catch (err) {
            console.error('New Contact Error:', err);
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
