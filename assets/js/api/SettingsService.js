window.SettingsService = {
    async fetchSettings() {
        const { data, error } = await window.supabaseClient
            .from('site_settings')
            .select('key, value');

        if (error) {
            console.warn('site_settings table might not exist, using defaults.');
            return [];
        }
        return data || [];
    },

    async updateSetting(key, value) {
        // Upsert setting
        const { error } = await window.supabaseClient
            .from('site_settings')
            .upsert({ key, value }, { onConflict: 'key' });

        if (error) throw error;
    },

    async updateMultipleSettings(settingsArray) {
        // settingsArray: [{key: '...', value: '...'}, ...]
        const { error } = await window.supabaseClient
            .from('site_settings')
            .upsert(settingsArray, { onConflict: 'key' });

        if (error) throw error;
    }
};
