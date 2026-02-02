window.GalleryService = {
    async fetchGallery() {
        const { data, error } = await window.supabaseClient
            .from('gallery')
            .select('id, title, description, date, image_url')
            .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addGalleryItem(payload) {
        const { error } = await window.supabaseClient.from('gallery').insert([payload]);
        if (error) throw error;
    },

    async updateGalleryItem(id, payload) {
        const { error } = await window.supabaseClient.from('gallery').update(payload).eq('id', id);
        if (error) throw error;
    },

    async deleteGalleryItem(id) {
        const { error } = await window.supabaseClient.from('gallery').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadGalleryImage(file) {
        const fileExt = file.name.split('.').pop();
        const hash = await window.Helpers.getFileHash(file);
        const fileName = `g_${hash}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

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
    },

    async deleteImage(imageUrl) {
        if (imageUrl && imageUrl.includes('gallery/')) {
            try {
                const fileName = imageUrl.split('/gallery/').pop();
                const filePath = `gallery/${fileName}`;
                await window.supabaseClient.storage.from('members').remove([filePath]);
            } catch (err) {
                console.warn('Could not delete image file:', err);
            }
        }
    }
};
