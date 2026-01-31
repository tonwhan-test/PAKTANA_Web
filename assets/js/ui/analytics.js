window.AnalyticsUI = {
    async fetchAnalyticsData() {
        try {
            const visitors = await window.AnalyticsService.fetchTotalVisitors();
            if (document.getElementById('totalVisitorsDisplay')) {
                document.getElementById('totalVisitorsDisplay').textContent = (visitors || 0).toLocaleString();
            }

            const pageViews = await window.AnalyticsService.fetchPageViews();
            const container = document.getElementById('analyticsPageViews');

            const labelsMap = {
                'home': 'หน้าแรก',
                'policies': 'นโยบาย',
                'leadership': 'ทำเนียบสมาชิก',
                'activities': 'กิจกรรม',
                'contact': 'เสนอนโยบาย',
                'contact_us_new': 'ติดต่อสอบถาม',
                'admin': 'Admin',
                'manage_members': 'จัดการสมาชิก',
                'manage_policies': 'จัดการนโยบาย',
                'gallery': 'แกลเลอรี่'
            };

            if (container) {
                if (pageViews && pageViews.length > 0) {
                    pageViews.sort((a, b) => b.view_count - a.view_count);
                    container.innerHTML = '';

                    const maxViews = Math.max(...pageViews.map(v => v.view_count));

                    pageViews.forEach(row => {
                        const label = labelsMap[row.page_id] || row.page_id;
                        const percentage = (row.view_count / maxViews) * 100;
                        const el = document.createElement('div');
                        el.className = 'group p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300';
                        el.innerHTML = `
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full ${row.view_count > (maxViews * 0.7) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}"></span>
                                    <span class="font-bold text-gray-800 text-sm">${label}</span>
                                </div>
                                <span class="bg-white px-2 py-0.5 rounded-lg border border-gray-100 text-[10px] font-black text-blue-600 shadow-sm">
                                    ${row.view_count.toLocaleString()} Views
                                </span>
                            </div>
                            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
                            </div>
                        `;
                        container.appendChild(el);
                    });
                } else {
                    container.innerHTML = '<div class="text-center text-gray-400 py-10">📉 ไม่มีข้อมูลการเข้าชม</div>';
                }
            }

            const ratings = await window.AnalyticsService.fetchRatings();
            if (ratings && ratings.length > 0) {
                const total = ratings.length;
                const avg = ratings.reduce((acc, r) => acc + r.rating, 0) / total;
                if (document.getElementById('avgRatingDisplay')) {
                    document.getElementById('avgRatingDisplay').textContent = avg.toFixed(1);
                }
                if (document.getElementById('totalRatingsDisplay')) {
                    document.getElementById('totalRatingsDisplay').textContent = `จาก ${total} คน`;
                }

                const feedbackList = document.getElementById('analyticsFeedbackList');
                if (feedbackList) {
                    feedbackList.innerHTML = '';
                    ratings.slice(0, 20).forEach(r => {
                        const el = document.createElement('div');
                        el.className = 'p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all';
                        el.innerHTML = `
                            <div class="flex justify-between items-center mb-2">
                                <div class="flex text-yellow-400 text-xs">
                                    ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                                </div>
                                <span class="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">${new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                            </div>
                            ${r.comment ? `<p class="text-gray-600 text-xs italic leading-relaxed">"${r.comment}"</p>` : '<p class="text-gray-300 text-[10px] italic">ไม่มีความเห็น</p>'}
                        `;
                        feedbackList.appendChild(el);
                    });
                }
            } else {
                const feedbackList = document.getElementById('analyticsFeedbackList');
                if (feedbackList) feedbackList.innerHTML = '<div class="text-center py-10 text-gray-300 text-sm">ยังไม่มีความคิดเห็น</div>';
            }

            this.renderAnalyticsChart(pageViews, labelsMap);

        } catch (err) {
            console.error('Fetch Analytics UI Error:', err);
        }
    },

    renderAnalyticsChart(pageViews, labelsMap) {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;

        const views = pageViews || [];
        if (window.analyticsChartInstance) window.analyticsChartInstance.destroy();

        // Sort views for chart too
        const sortedViews = [...views].sort((a, b) => b.view_count - a.view_count).slice(0, 8);
        const labels = sortedViews.map(v => labelsMap[v.page_id] || v.page_id);
        const data = sortedViews.map(v => v.view_count);

        window.analyticsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ยอดเข้าชม',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
                    borderRadius: 8,
                    borderWidth: 0,
                    barPercentage: 0.6
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal bars look better for labels
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 12, family: "'Sarabun', sans-serif", weight: 'bold' },
                        bodyFont: { size: 12, family: "'Sarabun', sans-serif" },
                        displayColors: false,
                        callbacks: {
                            label: (context) => `👁️ ${context.raw.toLocaleString()} ครั้ง`
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { family: "'Sarabun', sans-serif", size: 10 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { family: "'Sarabun', sans-serif", size: 12, weight: 'bold' } }
                    }
                }
            }
        });
    },

    currentRating: 0,
    setRating(n) {
        this.currentRating = n;
        const stars = document.getElementById('starRating').children;
        for (let i = 0; i < 5; i++) {
            stars[i].style.color = i < n ? '#fbbf24' : '#d1d5db';
        }
    },

    async submitRating() {
        if (window.AppState.isAdminLoggedIn) {
            alert('ผู้ดูแลระบบไม่สามารถให้คะแนนได้');
            return;
        }

        if (this.currentRating === 0) {
            alert('กรุณาเลือกดาวเพื่อระบุความพึงพอใจ');
            return;
        }

        const comment = document.getElementById('ratingComment').value;
        const btn = document.querySelector('#ratingModal button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'กำลังส่ง...';

        try {
            await window.AnalyticsService.submitRating(this.currentRating, comment);
            window.Helpers.showSuccessToast('ขอบคุณสำหรับคะแนนครับ!');
            window.Modals.closeModal('ratingModal');
            this.currentRating = 0;
            // Clear stars
            const stars = document.getElementById('starRating').children;
            for (let i = 0; i < 5; i++) stars[i].style.color = '#d1d5db';
            document.getElementById('ratingComment').value = '';
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    openAnalyticsModal() {
        if (!window.AppState.isAdminLoggedIn) return;
        this.fetchAnalyticsData();
        window.Modals.openModal('analyticsModal');
    }
};

window.setRating = (n) => window.AnalyticsUI.setRating(n);
window.submitRating = () => window.AnalyticsUI.submitRating();
window.fetchAnalyticsData = () => window.AnalyticsUI.fetchAnalyticsData();
window.openAnalyticsModal = () => window.AnalyticsUI.openAnalyticsModal();
