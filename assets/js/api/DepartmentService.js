window.DepartmentService = {
    async fetchDepartments() {
        const { data, error } = await window.supabaseClient
            .from('departments')
            .select('*')
            .order('rank', { ascending: true });

        if (error) {
            console.error('Error fetching departments:', error);
            return [];
        }
        return data || [];
    },

    async addDepartment(payload) {
        const { error } = await window.supabaseClient.from('departments').insert([payload]);
        if (error) throw error;
    },

    async updateDepartment(id, payload) {
        const { error } = await window.supabaseClient.from('departments').update(payload).eq('id', id);
        if (error) throw error;
    },

    async deleteDepartment(id) {
        const { error } = await window.supabaseClient.from('departments').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadDepartmentIcon(file) {
        // Reuse member storage or create new bucket
        const fileExt = file.name.split('.').pop();
        const hash = await window.Helpers.getFileHash(file);
        const fileName = `dept_${hash}.${fileExt}`;
        const filePath = `departments/${fileName}`;

        const { data, error } = await window.supabaseClient.storage
            .from('members') // Reusing members bucket for simplicity
            .upload(filePath, file, { upsert: true });

        if (error) throw error;

        const { data: publicData } = window.supabaseClient.storage
            .from('members')
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    }
};
