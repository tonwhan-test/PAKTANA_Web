// Make management functions globally accessible
window.deleteMember = () => window.AdminManagement.deleteMember();
window.addMember = () => window.AdminManagement.addMember();
window.editMember = (id) => window.AdminManagement.editMember(id);

window.AdminManagement = {
    init() {
        this.setupMemberForm();
        this.setupPolicyForm();
        this.setupGalleryForm();
        this.setupSliderForm();
        this.setupContactEditForm();
    },

    // --- Member Management ---
    addMember() {
        if (!window.AppState.isAdminLoggedIn) return;
        document.getElementById('managementModalTitle').textContent = 'เพิ่มสมาชิก';
        const form = document.getElementById('memberManagementForm');
        if (form) form.reset();
        document.getElementById('manageMemberId').value = '';
        document.getElementById('deleteMemberBtn').style.display = 'none'; // Hide delete
        document.getElementById('managePhotoPreview').innerHTML = '<div class="text-4xl">👤</div>';
        document.getElementById('fileName').textContent = 'ยังไม่ได้เลือกไฟล์';

        // Clear achievements
        document.getElementById('manageMemberAchievementsList').innerHTML = '';

        window.Modals.openModal('memberManagementModal');
    },

    editMember(id) {
        if (!window.AppState.isAdminLoggedIn) return;
        const member = window.AppState.memberData[id];
        if (!member) return;

        document.getElementById('managementModalTitle').textContent = 'แก้ไขสมาชิก';
        document.getElementById('manageMemberId').value = member.id;
        document.getElementById('deleteMemberBtn').style.display = 'block'; // Show delete
        document.getElementById('manageMemberName').value = member.name;
        document.getElementById('manageMemberPosition').value = member.position;
        document.getElementById('manageMemberCategory').value = member.category;
        document.getElementById('manageMemberRank').value = member.rank;
        document.getElementById('manageMemberPhotoUrl').value = member.photo_url || '';

        // Parse Data from Bio (JSON or Separator or Text)
        let motto = '', history = '', studentClass = '', studentNumber = '', contacts = {};
        const rawBio = member.bio || '';

        try {
            if (rawBio.trim().startsWith('{')) {
                // New JSON Format
                const data = JSON.parse(rawBio);
                motto = data.motto || '';
                history = data.history || '';
                studentClass = data.studentClass || '';
                studentNumber = data.studentNumber || '';
                contacts = data.contacts || {};
            } else if (rawBio.includes('<SEP>')) {
                // Legacy Separator Format
                const parts = rawBio.split('<SEP>');
                motto = parts[0] || '';
                history = parts[1] || '';
            } else {
                // Legacy Plain Text
                history = rawBio;
            }
        } catch (e) {
            history = rawBio;
        }

        // Populate Fields
        document.getElementById('manageMemberMotto').value = motto;
        document.getElementById('manageMemberBio').value = history;
        document.getElementById('manageMemberClass').value = studentClass;
        document.getElementById('manageMemberNumber').value = studentNumber;
        document.getElementById('manageMemberPhone').value = contacts.phone || '';
        document.getElementById('manageMemberFb').value = contacts.fb || '';
        document.getElementById('manageMemberIg').value = contacts.ig || '';
        document.getElementById('manageMemberTt').value = contacts.tt || '';

        // Populate Achievements
        const achievementsList = document.getElementById('manageMemberAchievementsList');
        achievementsList.innerHTML = '';
        const achievements = (rawBio.trim().startsWith('{') ? JSON.parse(rawBio).achievements : []) || [];
        achievements.forEach(ach => this.addAchievementField(ach));

        const preview = document.getElementById('managePhotoPreview');
        if (member.photo_url) {
            preview.innerHTML = `<img src="${member.photo_url}" class="w-full h-full object-cover">`;
        } else {
            preview.innerHTML = '<div class="text-4xl">👤</div>';
        }

        window.Modals.openModal('memberManagementModal');
    },

    setupMemberForm() {
        const form = document.getElementById('memberManagementForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'กำลังบันทึก...';

            try {
                const id = document.getElementById('manageMemberId').value;
                const fileInput = document.getElementById('manageMemberPhoto');
                let imageUrl = document.getElementById('manageMemberPhotoUrl').value;

                if (fileInput.files.length > 0) {
                    imageUrl = await window.MemberService.uploadMemberImage(fileInput.files[0]);
                }

                // Construct Rich Data Object and handle Achievement Uploads
                const achievementItems = document.querySelectorAll('.achievement-item');
                const achievements = [];

                for (const item of achievementItems) {
                    const fileInput = item.querySelector('.ach-file-input');
                    const desc = item.querySelector('.ach-desc').value;
                    let imgUrl = item.querySelector('.ach-img-url').value;

                    if (fileInput.files.length > 0) {
                        try {
                            submitBtn.textContent = `กำลังอัปโหลดรูปผลงาน...`;
                            imgUrl = await window.MemberService.uploadMemberImage(fileInput.files[0]);
                        } catch (err) {
                            console.error('Failed to upload achievement image:', err);
                        }
                    }

                    if (imgUrl || desc) {
                        achievements.push({ image_url: imgUrl, description: desc });
                    }
                }

                const richData = {
                    motto: document.getElementById('manageMemberMotto').value,
                    history: document.getElementById('manageMemberBio').value,
                    studentClass: document.getElementById('manageMemberClass').value,
                    studentNumber: document.getElementById('manageMemberNumber').value,
                    contacts: {
                        phone: document.getElementById('manageMemberPhone').value,
                        fb: document.getElementById('manageMemberFb').value,
                        ig: document.getElementById('manageMemberIg').value,
                        tt: document.getElementById('manageMemberTt').value
                    },
                    achievements: achievements
                };

                const data = {
                    name: document.getElementById('manageMemberName').value,
                    position: document.getElementById('manageMemberPosition').value,
                    category: document.getElementById('manageMemberCategory').value,
                    rank: parseInt(document.getElementById('manageMemberRank').value) || 10,
                    bio: JSON.stringify(richData), // Store as JSON string
                    photo_url: imageUrl
                };

                if (id) await window.MemberService.updateMember(id, data);
                else await window.MemberService.addMember(data);

                window.Helpers.showSuccessToast('บันทึกข้อมูลสมาชิกสำเร็จ');
                window.Modals.closeModal('memberManagementModal');

                // Refresh data manually or reload
                const members = await window.MemberService.fetchMembers();
                window.Renderers.renderMembers(members);

                // If it's first-time add, reload might be safer for complex state
                if (!id) setTimeout(() => location.reload(), 500);
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    },

    addAchievementField(data = { image_url: '', description: '' }) {
        const container = document.getElementById('manageMemberAchievementsList');
        const id = 'ach_' + Date.now() + Math.random().toString(36).substr(2, 5);

        const div = document.createElement('div');
        div.className = 'achievement-item bg-gray-50/50 p-5 rounded-3xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md';
        div.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" 
                class="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-20">✕</button>
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div class="md:col-span-4">
                    <div class="relative cursor-pointer group/ach" onclick="document.getElementById('input_${id}').click()">
                        <div class="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group-hover/ach:border-blue-400 transition-colors flex items-center justify-center relative">
                            <img src="${data.image_url || ''}" 
                                 class="w-full h-full object-cover ach-preview ${data.image_url ? '' : 'hidden'}" id="preview_${id}">
                            <div class="flex flex-col items-center gap-2 text-gray-400 ${data.image_url ? 'hidden' : ''}" id="placeholder_${id}">
                                <span class="text-3xl">📷</span>
                                <span class="text-[10px] font-bold uppercase tracking-wider">อัปโหลดรูป</span>
                            </div>
                            <div class="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/ach:opacity-100 transition-opacity font-bold text-xs backdrop-blur-sm">เปลี่ยนรูป</div>
                        </div>
                        <input type="file" id="input_${id}" class="hidden ach-file-input" accept="image/*" 
                            onchange="window.AdminManagement.previewAchievementImage(this, '${id}')">
                        <input type="hidden" class="ach-img-url" value="${data.image_url}">
                    </div>
                </div>
                <div class="md:col-span-8">
                    <textarea placeholder="คำอธิบายผลงาน หรือที่มาของรูปภาพนี้..." 
                        class="w-full min-h-[100px] rounded-2xl px-5 py-4 bg-white border border-gray-100 focus:border-blue-500 outline-none text-sm resize-none ach-desc transition-all shadow-sm">${data.description}</textarea>
                </div>
            </div>
        `;
        container.appendChild(div);
    },

    previewAchievementImage(input, id) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById(`preview_${id}`);
                const placeholder = document.getElementById(`placeholder_${id}`);
                img.src = e.target.result;
                img.classList.remove('hidden');
                if (placeholder) placeholder.classList.add('hidden');
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    async deleteMember() {
        const id = document.getElementById('manageMemberId').value;
        if (!id) return;
        if (!confirm('คุณต้องการลบสมาชิกท่านนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้')) return;

        try {
            await window.MemberService.deleteMember(id);
            window.Helpers.showSuccessToast('ลบสมาชิกเรียบร้อย');
            window.Modals.closeModal('memberManagementModal');
            if (typeof fetchMembers === 'function') fetchMembers();
            else location.reload();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    },

    previewMemberPhoto(input) {
        const fileName = document.getElementById('fileName');
        const preview = document.getElementById('managePhotoPreview');

        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (fileName) fileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                if (preview) preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
            document.getElementById('manageMemberPhotoUrl').value = '';
        }
    },

    // --- Policy Management ---
    addPolicy() {
        if (!window.AppState.isAdminLoggedIn) return;
        document.getElementById('policyModalTitle').textContent = 'เพิ่มนโยบายใหม่';
        const form = document.getElementById('policyManagementForm');
        if (form) form.reset();
        document.getElementById('managePolicyId').value = '';
        document.getElementById('guidelinesContainer').innerHTML = '';
        window.Modals.openModal('policyManagementModal');
    },

    editPolicy(id) {
        if (!window.AppState.isAdminLoggedIn) return;
        const policy = window.AppState.policyData.find(p => p.id == id);
        if (!policy) return;

        document.getElementById('policyModalTitle').textContent = 'แก้ไขนโยบาย';
        document.getElementById('managePolicyId').value = policy.id;
        document.getElementById('managePolicyIcon').value = policy.icon;
        document.getElementById('managePolicyTitle').value = policy.title;
        document.getElementById('managePolicyRank').value = policy.rank;
        document.getElementById('managePolicySummary').value = policy.summary;
        document.getElementById('managePolicyObjective').value = policy.objective;
        document.getElementById('managePolicyResults').value = policy.results;

        const container = document.getElementById('guidelinesContainer');
        container.innerHTML = '';
        let guidelines = [];
        try { guidelines = JSON.parse(policy.guidelines || '[]'); } catch (e) { guidelines = []; }

        guidelines.forEach(g => this.addGuidelineRow(g.title, g.content));

        window.Modals.openModal('policyManagementModal');
    },

    addGuidelineRow(title = '', content = '') {
        const container = document.getElementById('guidelinesContainer');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'guideline-row bg-gray-50 p-4 rounded-xl relative border border-gray-100 group';
        row.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            <div class="space-y-3">
                <input type="text" placeholder="หัวข้อแนวทาง" value="${title}" required
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold guideline-title">
                <textarea placeholder="รายละเอียดแนวทาง..." rows="2" required
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm guideline-content">${content}</textarea>
            </div>
        `;
        container.appendChild(row);
    },

    async deletePolicy() {
        const id = document.getElementById('managePolicyId').value;
        if (!id) return;
        if (!confirm('ยืนยันลบนโยบายนี้?')) return;

        try {
            await window.PolicyService.deletePolicy(id);
            window.Helpers.showSuccessToast('ลบนโยบายเรียบร้อย');
            window.Modals.closeModal('policyManagementModal');
            if (typeof fetchPolicies === 'function') fetchPolicies();
            else location.reload();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    },

    setupPolicyForm() {
        const form = document.getElementById('policyManagementForm');
        if (!form) return;

        // Ensure delete button visibility toggles
        const updateModalUI = () => {
            const id = document.getElementById('managePolicyId').value;
            const deleteBtn = document.getElementById('deletePolicyBtn');
            if (deleteBtn) deleteBtn.style.display = id ? 'block' : 'none';
        };
        // We can hook into editPolicy to show it
        const originalEditPolicy = this.editPolicy;
        this.editPolicy = (id) => {
            originalEditPolicy.call(this, id);
            const deleteBtn = document.getElementById('deletePolicyBtn');
            if (deleteBtn) deleteBtn.style.display = 'block';
        };
        // And hook into addPolicy to hide it
        const originalAddPolicy = this.addPolicy;
        this.addPolicy = () => {
            originalAddPolicy.call(this);
            const deleteBtn = document.getElementById('deletePolicyBtn');
            if (deleteBtn) deleteBtn.style.display = 'none';
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'กำลังบันทึก...';

            try {
                const id = document.getElementById('managePolicyId').value;
                const guidelines = [];
                document.querySelectorAll('.guideline-row').forEach(row => {
                    const title = row.querySelector('.guideline-title').value;
                    const content = row.querySelector('.guideline-content').value;
                    if (title && content) guidelines.push({ title, content });
                });

                const data = {
                    icon: document.getElementById('managePolicyIcon').value,
                    title: document.getElementById('managePolicyTitle').value,
                    rank: parseInt(document.getElementById('managePolicyRank').value) || 0,
                    summary: document.getElementById('managePolicySummary').value,
                    objective: document.getElementById('managePolicyObjective').value,
                    guidelines: JSON.stringify(guidelines),
                    results: document.getElementById('managePolicyResults').value
                };

                if (id) await window.PolicyService.updatePolicy(id, data);
                else await window.PolicyService.addPolicy(data);

                window.Helpers.showSuccessToast('บันทึกข้อมูลนโยบายสำเร็จ');
                window.Modals.closeModal('policyManagementModal');
                if (typeof fetchPolicies === 'function') fetchPolicies();
                else location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    },

    // --- Gallery Management ---
    selectedGalleryFiles: [],

    openGalleryManagementModal(id = null) {
        if (!window.AppState.isAdminLoggedIn) {
            alert('กรุณาเข้าสู่ระบบผู้ดูแลระบบก่อนใช้งานฟังก์ชันนี้');
            return;
        }
        const form = document.getElementById('galleryForm');
        if (form) form.reset();
        this.selectedGalleryFiles = [];
        document.getElementById('manageGalleryId').value = id || '';
        document.getElementById('galleryPreviewGrid').innerHTML = '';
        document.getElementById('deleteItemBtn').style.display = id ? 'block' : 'none';

        if (id) {
            const item = window.AppState.galleryData[id];
            if (item) {
                document.getElementById('manageGalleryTitle').value = item.title;

                // Parse description and metadata
                let description = item.description || '';
                let existingImages = [];

                if (description.includes('<METADATA>')) {
                    const parts = description.split('<METADATA>');
                    description = parts[0];
                    try {
                        const meta = JSON.parse(parts[1]);
                        existingImages = meta.images || [];
                    } catch (e) {
                        console.error('Failed to parse metadata from description:', e);
                    }
                } else if (item.metadata) {
                    // Fallback to reading from metadata column if it exists (legacy/migration)
                    try {
                        const meta = JSON.parse(item.metadata);
                        existingImages = meta.images || [];
                    } catch (e) {
                        console.error('Failed to parse metadata:', e);
                    }
                }

                document.getElementById('manageGalleryDesc').value = description;
                document.getElementById('manageGalleryDate').value = item.date;

                // Handle fallback to single image_url
                if (existingImages.length === 0 && item.image_url) {
                    existingImages = [item.image_url];
                }

                document.getElementById('manageGalleryUrls').value = JSON.stringify(existingImages);

                // Show existing images
                if (existingImages.length > 0) {
                    const grid = document.getElementById('galleryPreviewGrid');
                    grid.innerHTML = existingImages.map((url, idx) => `
                        <div class="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                            <img src="${url}" class="w-full h-full object-cover">
                            <div class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">${idx + 1}</div>
                        </div>
                    `).join('');
                }
            }
        }
        window.Modals.openModal('galleryManagementModal');
    },

    setupGalleryForm() {
        const form = document.getElementById('galleryForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'กำลังอัปโหลด...';

            try {
                const id = document.getElementById('manageGalleryId').value;
                let imageUrls = [];

                // Get existing URLs if editing
                const existingUrls = document.getElementById('manageGalleryUrls').value;
                if (existingUrls) {
                    try {
                        imageUrls = JSON.parse(existingUrls);
                    } catch (e) {
                        imageUrls = [];
                    }
                }

                // Upload new files if any
                if (this.selectedGalleryFiles.length > 0) {
                    btn.textContent = `กำลังอัปโหลด ${this.selectedGalleryFiles.length} รูป...`;
                    const uploadPromises = this.selectedGalleryFiles.map(file =>
                        window.GalleryService.uploadGalleryImage(file)
                    );
                    const newUrls = await Promise.all(uploadPromises);
                    imageUrls = id ? newUrls : [...imageUrls, ...newUrls]; // Replace if editing, append if new
                }

                if (imageUrls.length === 0) throw new Error("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");

                // Store in format compatible with current database (using description for metadata)
                const pureDescription = document.getElementById('manageGalleryDesc').value;
                const metadataStr = JSON.stringify({ images: imageUrls });
                const combinedDescription = pureDescription + '<METADATA>' + metadataStr;

                const payload = {
                    title: document.getElementById('manageGalleryTitle').value,
                    description: combinedDescription,
                    date: document.getElementById('manageGalleryDate').value,
                    image_url: imageUrls[0], // Primary image
                    // metadata: metadataStr // Removed to avoid schema error
                };

                if (id) await window.GalleryService.updateGalleryItem(id, payload);
                else await window.GalleryService.addGalleryItem(payload);

                window.Helpers.showSuccessToast('บันทึกข้อมูลเรียบร้อย');
                window.Modals.closeModal('galleryManagementModal');
                this.selectedGalleryFiles = [];
                if (typeof fetchGallery === 'function') fetchGallery();
                else location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    },

    previewGalleryImages(input) {
        if (!input.files || input.files.length === 0) return;

        this.selectedGalleryFiles = Array.from(input.files);
        const grid = document.getElementById('galleryPreviewGrid');
        grid.innerHTML = '';

        this.selectedGalleryFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'relative group aspect-square rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg';
                div.innerHTML = `
                    <img src="${e.target.result}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <button type="button" onclick="window.AdminManagement.removeGalleryImage(${index})" 
                            class="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm transition-all hover:bg-red-600">
                            ลบ
                        </button>
                    </div>
                    <div class="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">${index + 1}</div>
                `;
                grid.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    },

    removeGalleryImage(index) {
        this.selectedGalleryFiles.splice(index, 1);
        const input = document.getElementById('manageGalleryFiles');
        const dt = new DataTransfer();
        this.selectedGalleryFiles.forEach(file => dt.items.add(file));
        input.files = dt.files;
        this.previewGalleryImages(input);
    },

    async deleteGalleryItem() {
        const id = document.getElementById('manageGalleryId').value;
        if (!id) return;
        if (!confirm('คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?')) return;

        try {
            const item = window.AppState.galleryData[id];
            if (item && item.image_url) {
                await window.GalleryService.deleteImage(item.image_url);
            }
            await window.GalleryService.deleteGalleryItem(id);
            window.Helpers.showSuccessToast('ลบช้อมูลเรียบร้อย');
            window.Modals.closeModal('galleryManagementModal');
            if (typeof fetchGallery === 'function') fetchGallery();
            else location.reload();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    },

    // --- Slider Management ---
    openHeroSlideModal() {
        if (!window.AppState.isAdminLoggedIn) return;
        const form = document.getElementById('heroSlideForm');
        if (form) form.reset();
        document.getElementById('slidePreview').innerHTML = 'ภาพตัวอย่าง';
        this.loadSlidesList();
        window.Modals.openModal('heroSlideModal');
    },

    setupSliderForm() {
        const form = document.getElementById('heroSlideForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'กำลังบันทึก...';

            try {
                const fileInput = document.getElementById('slideFile');
                if (!fileInput) throw new Error('ไม่พบช่องเลือกไฟล์');
                if (!fileInput.files || !fileInput.files[0]) throw new Error('กรุณาเลือกรูปภาพ');

                const imageUrl = await window.SliderService.uploadSlideImage(fileInput.files[0]);

                const payload = {
                    title: '',
                    subtitle: '',
                    description: '',
                    image_url: imageUrl
                };

                await window.SliderService.addSlide(payload);
                window.Helpers.showSuccessToast('เพิ่มสไลด์เรียบร้อย');
                form.reset();
                document.getElementById('slidePreview').innerHTML = 'ภาพตัวอย่าง';
                this.loadSlidesList();
                if (typeof window.fetchHeroSlides === 'function') window.fetchHeroSlides();
                else location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = '+ เพิ่มสไลด์';
            }
        });
    },

    async loadSlidesList() {
        const list = document.getElementById('heroSlidesList');
        if (!list) return;
        list.innerHTML = '<div class="text-center py-4">⏳ กำลังโหลด...</div>';

        try {
            const slides = await window.SliderService.fetchHeroSlides();
            if (slides.length > 0) {
                list.innerHTML = '';
                slides.forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'flex items-center gap-4 bg-gray-50 p-3 rounded-lg border';
                    el.innerHTML = `
                        <div class="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            <img src="${item.image_url}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h5 class="font-bold truncate text-sm">${item.title || 'ไม่มีหัวข้อ'}</h5>
                        </div>
                        <button onclick="window.AdminManagement.deleteHeroSlide('${item.id}', '${item.image_url}')" class="text-red-500 hover:text-red-700 text-sm font-bold bg-white border border-red-200 px-3 py-1 rounded">
                            ลบ
                        </button>
                    `;
                    list.appendChild(el);
                });
            } else {
                list.innerHTML = '<div class="text-center text-gray-400 py-4">ไม่มีข้อมูล</div>';
            }
        } catch (err) {
            list.innerHTML = '<div class="text-center text-red-500 py-4">Error loading slides</div>';
        }
    },

    async deleteHeroSlide(id, imageUrl) {
        if (!confirm('ยืนยันการลบสไลด์นี้?')) return;
        try {
            await window.SliderService.deleteSlide(id);
            window.Helpers.showSuccessToast('ลบสไลด์เรียบร้อย');
            this.loadSlidesList();
            if (typeof fetchHeroSlides === 'function') fetchHeroSlides();
            else location.reload();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    },

    previewSlideImage(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('slidePreview').innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },
    // --- Contact Info Management ---
    openContactEditModal() {
        if (!window.AppState.isAdminLoggedIn) return;

        // Load current values
        const email = document.getElementById('footerEmail').innerText;
        const phone = document.getElementById('footerPhone').innerText;
        const address = document.getElementById('footerAddress').innerHTML.replace(/<br>/g, '\n');

        // Get social links (finding by icon class)
        const socials = document.getElementById('footerSocials').querySelectorAll('a');
        let fb = '', ig = '', tt = '';
        socials.forEach(a => {
            if (a.querySelector('.fa-facebook-f')) fb = a.getAttribute('href');
            if (a.querySelector('.fa-instagram')) ig = a.getAttribute('href');
            if (a.querySelector('.fa-tiktok')) tt = a.getAttribute('href');
        });

        // Populate form
        document.getElementById('editEmail').value = email;
        document.getElementById('editPhone').value = phone;
        document.getElementById('editAddress').value = address;
        document.getElementById('editFb').value = fb !== '#' ? fb : '';
        document.getElementById('editIg').value = ig !== '#' ? ig : '';
        document.getElementById('editTt').value = tt !== '#' ? tt : '';

        window.Modals.openModal('contactEditModal');
    },

    setupContactEditForm() {
        const form = document.getElementById('contactEditForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real app, save to DB. For now, update DOM directly.

            const email = document.getElementById('editEmail').value;
            const phone = document.getElementById('editPhone').value;
            const address = document.getElementById('editAddress').value.replace(/\n/g, '<br>');
            const fb = document.getElementById('editFb').value.trim();
            const ig = document.getElementById('editIg').value.trim();
            const tt = document.getElementById('editTt').value.trim();

            // Update UI (Footer)
            document.getElementById('footerEmail').innerText = email;
            document.getElementById('footerPhone').innerText = phone;
            document.getElementById('footerAddress').innerHTML = address;

            // Update UI (Contact Page)
            const pageEmail = document.getElementById('pageContactEmail');
            const pagePhone = document.getElementById('pageContactPhone');
            const pageAddress = document.getElementById('pageContactAddress');
            if (pageEmail) pageEmail.innerText = email;
            if (pagePhone) pagePhone.innerText = phone;
            if (pageAddress) pageAddress.innerHTML = address;

            const socialContainer = document.getElementById('footerSocials');
            const pageSocialContainer = document.getElementById('pageContactSocials');
            let socialHtml = '';

            if (fb && fb !== '#') {
                socialHtml += `<a href="${fb}" target="_blank" class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors"><i class="fab fa-facebook-f"></i></a>`;
            }
            if (ig && ig !== '#') {
                socialHtml += `<a href="${ig}" target="_blank" class="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-500 transition-colors"><i class="fab fa-instagram"></i></a>`;
            }
            if (tt && tt !== '#') {
                socialHtml += `<a href="${tt}" target="_blank" class="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition-colors"><i class="fab fa-tiktok"></i></a>`;
            }

            socialContainer.innerHTML = socialHtml;
            if (pageSocialContainer) pageSocialContainer.innerHTML = socialHtml;

            window.Helpers.showSuccessToast('บันทึกข้อมูลติดต่อเรียบร้อย');
            window.Modals.closeModal('contactEditModal');
        });
    }
};

window.addMember = () => window.AdminManagement.addMember();
window.editMember = (id) => window.AdminManagement.editMember(id);
window.addPolicy = () => window.AdminManagement.addPolicy();
window.editPolicy = (id) => window.AdminManagement.editPolicy(id);
window.addGuidelineRow = (t, c) => window.AdminManagement.addGuidelineRow(t, c);
window.previewSelectedFile = (input) => window.AdminManagement.previewMemberPhoto(input);
window.previewGalleryImages = (input) => window.AdminManagement.previewGalleryImages(input);
window.previewSlideImage = (input) => window.AdminManagement.previewSlideImage(input);
window.deleteGalleryItem = () => window.AdminManagement.deleteGalleryItem();
window.openHeroSlideModal = () => window.AdminManagement.openHeroSlideModal();
window.openGalleryManagementModal = (id) => window.AdminManagement.openGalleryManagementModal(id);
window.deletePolicy = () => window.AdminManagement.deletePolicy();
window.openContactEditModal = () => window.AdminManagement.openContactEditModal();
