window.AnalyticsService = {
    async trackUniqueVisit() {
        if (!localStorage.getItem('visited_site')) {
            try {
                await window.supabaseClient.rpc('increment_total_visitors');
                localStorage.setItem('visited_site', 'true');
            } catch (e) {
                console.warn('Visitor tracking error', e);
            }
        }
    },

    async trackPageView(pageName) {
        try {
            const { error } = await window.supabaseClient.rpc('increment_page_view', { page_id: pageName });
            if (error) console.warn('Analytics RPC not found', error);
        } catch (err) { console.error('Analytics error:', err); }
    },

    async fetchTotalVisitors() {
        const { data } = await window.supabaseClient.from('analytics_total_visitors').select('count').eq('id', 'total').single();
        return data ? data.count : 0;
    },

    async fetchPageViews() {
        const { data } = await window.supabaseClient.from('analytics_page_views').select('page_id, view_count');
        return data || [];
    },

    async fetchRatings() {
        const { data } = await window.supabaseClient.from('analytics_ratings').select('rating, comment, created_at').order('created_at', { ascending: false });
        return data || [];
    },

    async submitRating(rating, comment) {
        const { error } = await window.supabaseClient.from('analytics_ratings').insert([{
            rating: rating,
            comment: comment
        }]);
        if (error) throw error;
    }
};
window.trackPageView = (name) => window.AnalyticsService.trackPageView(name);
