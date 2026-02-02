window.PolicyService = {
    async fetchPolicies() {
        const { data, error } = await window.supabaseClient
            .from('policies')
            .select('id, icon, title, rank, summary, objective, guidelines, results')
            .order('rank', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async addPolicy(policyObj) {
        const { error } = await window.supabaseClient.from('policies').insert([policyObj]);
        if (error) throw error;
    },

    async updatePolicy(id, policyObj) {
        const { error } = await window.supabaseClient.from('policies').update(policyObj).eq('id', id);
        if (error) throw error;
    },

    async deletePolicy(id) {
        const { error } = await window.supabaseClient.from('policies').delete().eq('id', id);
        if (error) throw error;
    }
};
