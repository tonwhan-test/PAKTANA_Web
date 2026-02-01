window.Navigation = {
    init() {
        document.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                const pageId = link.getAttribute('data-page');
                if (pageId) {
                    e.preventDefault();
                    this.navigateToPage(pageId);
                    this.closeMobileMenu();
                }
            });
        });

        // Handle contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'กำลังส่ง...';

                const subjectMap = {
                    'general': 'สอบถามทั่วไป',
                    'join': 'สมัครเป็นสมาชิก',
                    'collaborate': 'ขอความร่วมมือ',
                    'other': 'อื่นๆ'
                };

                const formData = {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    subject: subjectMap[document.getElementById('contactSubject').value] || 'ทั่วไป',
                    message: document.getElementById('contactMessageText').value,
                    timestamp: new Date().toLocaleString('th-TH')
                };

                try {
                    // Replace with your Google Apps Script Web App URL
                    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzg3KWDThahpy2sPra83VhfJKwupOfkDokorSiV3tiqec_FG63MFmW2_u26U_0vG2js/exec';

                    // Note: We use fetch with no-cors if just submitting, 
                    // or a full backend proxy if response is needed.
                    // For now, we simulate the logic where the script handles the 'subject'
                    // to route the data to different sheets.

                    /* Example Google Apps Script snippet:
                       function doPost(e) {
                         const data = JSON.parse(e.postData.contents);
                         const ss = SpreadsheetApp.getActiveSpreadsheet();
                         const sheet = ss.getSheetByName(data.subject) || ss.getSheetByName('General');
                         sheet.appendRow([data.timestamp, data.name, data.email, data.message]);
                         return ContentService.createTextOutput('Success');
                       }
                    */

                    console.log('Sending to Google Sheets:', formData);

                    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
                        // If no URL yet, just show success and log
                        window.Helpers.showSuccessToast('ส่งข้อความสำเร็จ! (โหมดทดสอบ)');
                    } else {
                        await fetch(SCRIPT_URL, {
                            method: 'POST',
                            mode: 'no-cors',
                            cache: 'no-cache',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(formData)
                        });
                        window.Helpers.showSuccessToast('ส่งข้อความเรียบร้อยแล้ว');
                    }

                    contactForm.reset();
                } catch (err) {
                    console.error('Submit error:', err);
                    alert('เกิดข้อผิดพลาดในการส่งข้อความ');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        }

        // Handle scroll behavior for nav bar
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('.nav-bar');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-xl');
            } else {
                nav.classList.remove('shadow-xl');
            }
        });

        const lastPage = sessionStorage.getItem('currentPage') || 'home';
        this.navigateToPage(lastPage);
    },

    navigateToPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        const activePage = document.querySelector(`.page[data-page="${pageId}"]`);
        if (activePage) {
            activePage.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'instant' });
            sessionStorage.setItem('currentPage', pageId);
            this.updateNavActiveState(pageId);

            // Track page view
            if (window.AnalyticsService) {
                window.AnalyticsService.trackPageView(pageId);
            }

            // If navigating to analytics page, fetch fresh data
            if (pageId === 'analytics' && window.AnalyticsUI) {
                window.AnalyticsUI.fetchAnalyticsData();
            }

            // Reset hero slider when navigating to home page
            if (pageId === 'home' && window.HeroSlider) {
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    window.HeroSlider.reset();
                }, 100);
            }
        }
    },

    updateNavActiveState(pageId) {
        document.querySelectorAll('a[data-page]').forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    toggleMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('mobileNav');
        const backdrop = document.getElementById('mobileNavBackdrop');

        if (!btn || !nav) return;

        btn.classList.toggle('active');
        nav.classList.toggle('active');

        if (backdrop) {
            backdrop.classList.toggle('active');
        }

        document.body.classList.toggle('overflow-hidden');
    },

    closeMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const nav = document.getElementById('mobileNav');
        const backdrop = document.getElementById('mobileNavBackdrop');

        if (btn) btn.classList.remove('active');
        if (nav) nav.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    },

    navigateToPolicyDetail(index) {
        this.navigateToPage('policies');
        setTimeout(() => {
            const el = document.getElementById(`policy${index}`);
            if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }, 300);
    }
};

window.navigateToPage = (pid) => window.Navigation.navigateToPage(pid);
window.navigateToPolicyDetail = (idx) => window.Navigation.navigateToPolicyDetail(idx);
window.toggleMobileMenu = () => window.Navigation.toggleMobileMenu();
