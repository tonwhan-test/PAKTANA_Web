window.SliderService = {
    async fetchHeroSlides() {
        const { data, error } = await window.supabaseClient
            .from('hero_slides')
            .select('id, title, image_url, created_at')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async addSlide(payload) {
        const { error } = await window.supabaseClient.from('hero_slides').insert([payload]);
        if (error) throw error;
    },

    async deleteSlide(id) {
        const { error } = await window.supabaseClient.from('hero_slides').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadSlideImage(file) {
        const fileExt = file.name.split('.').pop();
        const hash = await window.Helpers.getFileHash(file);
        const fileName = `s_${hash}.${fileExt}`;
        const filePath = `slides/${fileName}`;

        const { data, error } = await window.supabaseClient.storage
            .from('members')
            .upload(filePath, file, {
                upsert: true,
                cacheControl: '2592000' // 30 days
            });

        if (error) throw error;

        const { data: publicData } = window.supabaseClient.storage
            .from('members')
            .getPublicUrl(filePath);

        return publicData.publicUrl;
    }
};
