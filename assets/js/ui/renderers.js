window.Renderers = {
    // --- Members ---
    categoryMap: {
        'Leadership': 'ประธาน',
        'Committee': 'คณะกรรมการ',
        'Member': 'สมาชิกทั่วไป',
        'ประธาน': 'ประธาน',
        'รองประธาน': 'รองประธาน',
        'เลขานุการ': 'เลขานุการ',
        'เหรัญญิก': 'เหรัญญิก',
        'เทคนิค': 'ฝ่ายเทคนิค',
        'ปฏิคม': 'ฝ่ายปฏิคม',
        'สวัสดิการ': 'ฝ่ายสวัสดิการ',
        'ประชาสัมพันธ์': 'ฝ่ายประชาสัมพันธ์',
        'วิชาการ': 'ฝ่ายวิชาการ',
        'อาคารสถานที่': 'ฝ่ายอาคารสถานที่',
        'นันทนาการ': 'ฝ่ายนันทนาการ'
    },

    renderMembers(members) {
        window.AppState.memberData = {}; // Store in app state for lookup
        members.forEach(m => window.AppState.memberData[m.id] = m);

        const container = document.getElementById('membersList');
        const homeLeadershipContainer = document.getElementById('homeLeadershipGrid');
        const pageLeadershipContainer = document.getElementById('pageLeadershipGrid');

        // Define Category order and titles
        const categories = [
            { id: 'ประธาน', title: 'ประธาน', color: 'border-yellow-400' },
            { id: 'รองประธาน', title: 'รองประธาน', color: 'border-blue-900' },
            { id: 'เลขานุการ', title: 'เลขานุการ', color: 'border-blue-900' },
            { id: 'เหรัญญิก', title: 'เหรัญญิก', color: 'border-blue-900' },
            { id: 'เทคนิค', title: 'ฝ่ายเทคนิค', color: 'border-blue-900' },
            { id: 'ปฏิคม', title: 'ฝ่ายปฏิคม', color: 'border-blue-900' },
            { id: 'สวัสดิการ', title: 'ฝ่ายสวัสดิการ', color: 'border-blue-900' },
            { id: 'ประชาสัมพันธ์', title: 'ฝ่ายประชาสัมพันธ์', color: 'border-blue-900' },
            { id: 'วิชาการ', title: 'ฝ่ายวิชาการ', color: 'border-blue-900' },
            { id: 'อาคารสถานที่', title: 'ฝ่ายอาคารสถานที่', color: 'border-blue-900' },
            { id: 'นันทนาการ', title: 'ฝ่ายนันทนาการ', color: 'border-blue-900' },
            { id: 'Leadership', title: 'ประธาน', color: 'border-blue-900' },
            { id: 'Committee', title: 'คณะกรรมการ', color: 'border-yellow-400' },
            { id: 'Member', title: 'สมาชิกทั่วไป', color: 'border-gray-300' }
        ];

        // 1. Home Page Leadership
        // 1. Home Page Leadership
        if (homeLeadershipContainer) {
            // User requested to hide members on home page, ensuring only "View All" button is visible below.
            homeLeadershipContainer.innerHTML = '';
        }

        // 2. Full Leadership Page (Sectioned)
        if (pageLeadershipContainer) {
            let html = '';
            const processedCategories = [];

            categories.forEach(cat => {
                if (cat.id === 'Leadership' && processedCategories.includes('ประธาน')) return;

                let group;
                if (cat.id === 'ประธาน') {
                    group = members.filter(m => m.category === 'ประธาน' || m.category === 'Leadership').sort((a, b) => a.rank - b.rank);
                    processedCategories.push('ประธาน');
                } else {
                    group = members.filter(m => m.category === cat.id).sort((a, b) => a.rank - b.rank);
                    processedCategories.push(cat.id);
                }

                if (group.length > 0) {
                    const accentColor = cat.color.replace('border-', 'text-').replace('border-', 'bg-');
                    const borderColor = cat.color;

                    // Determine Size
                    let groupSize = 'small';
                    if (cat.id === 'ประธาน' || cat.id === 'Leadership') groupSize = 'large';
                    else if (cat.id === 'รองประธาน') groupSize = 'medium';

                    html += `
                    <div class="w-full mb-16 mt-24 flex flex-col items-center justify-center reveal-on-scroll">
                        <div class="relative px-8 md:px-16 py-6 group">
                            <!-- Decorative Border Corners -->
                            <div class="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 ${borderColor} opacity-60 transition-all group-hover:w-full group-hover:h-full group-hover:opacity-20 duration-700"></div>
                            <div class="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 ${borderColor} opacity-60 transition-all group-hover:w-full group-hover:h-full group-hover:opacity-20 duration-700"></div>
                            
                            <h4 class="text-3xl md:text-5xl font-black text-heading tracking-[0.15em] text-center relative z-10 px-4">
                                ${cat.title}
                            </h4>
                            
                            <!-- Premium Accent Line -->
                            <div class="flex items-center justify-center mt-6 gap-6 relative z-10">
                                <div class="h-[2px] w-12 md:w-32 bg-gradient-to-r from-transparent to-[#C5A059]"></div>
                                <div class="w-4 h-4 rotate-45 border-2 border-[#C5A059] bg-white shadow-[0_0_15px_rgba(197,160,89,0.4)]"></div>
                                <div class="h-[2px] w-12 md:w-32 bg-gradient-to-l from-transparent to-[#C5A059]"></div>
                            </div>
                        </div>
                    </div>`;

                    html += `<div class="w-full flex flex-wrap justify-center gap-10 px-4">`;
                    html += group.map(m => this.createMemberCard(m, cat.id !== 'Member', false, groupSize)).join('');
                    html += `</div>`;
                }
            });
            pageLeadershipContainer.innerHTML = html;
            if (container) container.innerHTML = '';
        }

        const adminTable = document.getElementById('managementTableBody');
        if (adminTable) {
            adminTable.innerHTML = members.map(m => `
                <div class="group hover:bg-gray-50 transition-all duration-200 p-4 md:px-6 md:py-4">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        
                        <!-- Col 1: Member Info -->
                        <div class="md:col-span-5 flex items-center gap-4">
                            <div class="w-16 h-16 md:w-12 md:h-12 rounded-xl md:rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-sm">
                                ${m.photo_url ? `<img src="${m.photo_url}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400">👤</div>'}
                            </div>
                            <div class="min-w-0 flex-1">
                                <h4 class="font-bold text-heading text-base truncate">${m.name}</h4>
                                <p class="text-xs text-gray-400 md:hidden mt-0.5">${m.position}</p>
                            </div>
                        </div>

                        <!-- Col 2: Position & Category -->
                        <div class="md:col-span-3 flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-1 mt-2 md:mt-0 ml-[4.5rem] md:ml-0">
                            <div class="text-sm font-medium text-gray-500 hidden md:block truncate w-full" title="${m.position}">${m.position}</div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                ${window.Renderers.categoryMap[m.category] || m.category}
                            </span>
                        </div>

                        <!-- Col 3: Rank -->
                        <div class="md:col-span-2 flex items-center justify-between md:justify-center ml-[4.5rem] md:ml-0">
                            <span class="text-xs text-gray-400 md:hidden font-bold">ลำดับ:</span>
                            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold font-mono">${m.rank}</span>
                        </div>

                        <!-- Col 4: Action -->
                        <div class="md:col-span-2 text-right mt-3 md:mt-0 flex justify-end">
                            <button onclick="window.AdminManagement.editMember('${m.id}')" 
                                class="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                                <span>✏️</span> <span class="md:hidden">แก้ไขข้อมูล</span><span class="hidden md:inline">แก้ไข</span>
                            </button>
                        </div>

                    </div>
                </div>
            `).join('');
        }
    },

    createMemberCard(m, isLeader, isHome = true, size = 'small') {
        const photoHtml = m.photo_url
            ? `<img src="${m.photo_url}" alt="${m.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-4xl text-gray-400">👤</div>`;

        const categoryTitle = window.Renderers.categoryMap[m.category] || m.category;

        // --- Data Parsing Logic (Fix for JSON showing in UI) ---
        let motto = '', history = '';
        const rawBio = m.bio || '';
        try {
            if (rawBio.trim().startsWith('{')) {
                const parsed = JSON.parse(rawBio);
                motto = parsed.motto || '';
                history = parsed.history || '';
            } else if (rawBio.includes('<SEP>')) {
                const parts = rawBio.split('<SEP>');
                motto = parts[0] || '';
            } else if (m.position.includes('ประธาน') || m.rank === 1) {
                motto = rawBio;
            }
        } catch (e) {
            motto = rawBio;
        }

        // 1. PRESIDENT & TOP LEADERSHIP (Hero Card - Rank 1 only and ONLY for Home)
        if (isHome && m.rank === 1) {
            return `
                <div class="w-full mb-12 flex justify-center px-4">
                    <div class="president-card group relative bg-gradient-to-br from-[#74040E] to-[#4a0309] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer border border-white/10 w-full max-w-5xl" onclick="window.Modals.closeModal('memberModal'); window.Renderers.openMemberModal('${m.id}')">
                        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        
                        <div class="relative p-6 md:p-12 flex flex-col md:flex-row items-center gap-6 md:gap-14">
                            <!-- Image Section (Portrait Rectangle) -->
                            <div class="relative shrink-0">
                                <div class="w-48 h-64 md:w-64 md:h-80 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700 bg-white/5 backdrop-blur-sm">
                                    ${photoHtml}
                                </div>
                            </div>

                            <!-- Content Section -->
                            <div class="text-center md:text-left flex-1 text-white pr-4 md:pr-12">
                                <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-5 py-2 rounded-full text-xs md:text-sm font-black mb-6 inline-block uppercase tracking-[0.2em] shadow-lg transform group-hover:-translate-y-1 transition-transform italic">${categoryTitle}</span>
                                <h3 class="text-2xl md:text-5xl font-black mb-2 tracking-tight leading-tight drop-shadow-lg" title="${m.name}">${m.name}</h3>
                                <p class="text-yellow-400 text-base md:text-2xl mb-8 font-bold uppercase tracking-widest opacity-90">${m.position}</p>
                                
                                ${motto ? `
                                <div class="relative max-w-2xl mx-auto md:mx-0">
                                    <div class="flex justify-center md:justify-start gap-1">
                                        <span class="text-2xl md:text-4xl text-yellow-400/30 leading-none shrink-0">“</span>
                                        <p class="text-sm md:text-xl text-white/90 italic leading-relaxed">
                                            ${motto}
                                            <span class="text-2xl md:text-4xl text-yellow-400/30 leading-none inline-block align-bottom ml-1">”</span>
                                        </p>
                                    </div>
                                </div>
                                ` : ''}

                                <div class="mt-8 md:mt-10 flex items-center justify-center md:justify-start gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-xs font-bold tracking-widest">
                                    <span class="px-5 py-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/10 text-yellow-400 border-yellow-400/30">CLICK TO VIEW PROFILE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // --- NEW: HIERARCHICAL HORIZONTAL CARD FOR MEMBER DIRECTORY PAGE ---
        if (!isHome) {
            // Sizing Logic
            let maxWidth = 'max-w-xl';
            let imgSize = 'w-24 h-32 md:w-32 md:h-44';
            let nameSize = 'text-lg md:text-xl';
            let posSize = 'text-xs md:text-sm';
            let padding = 'p-4 md:p-6';

            if (size === 'large') {
                maxWidth = 'max-w-5xl';
                imgSize = 'w-32 h-44 md:w-56 md:h-72';
                nameSize = 'text-3xl md:text-4xl';
                posSize = 'text-lg md:text-xl';
                padding = 'p-8 md:p-12';
            } else if (size === 'medium') {
                maxWidth = 'max-w-3xl';
                imgSize = 'w-28 h-38 md:w-40 md:h-56';
                nameSize = 'text-xl md:text-2xl';
                posSize = 'text-sm md:text-base';
                padding = 'p-6 md:p-8';
            }

            return `
                <div class="w-full ${maxWidth} group relative bg-gradient-to-br from-[#74040E] to-[#4a0309] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-primary/30 transition-all duration-500 cursor-pointer border border-white/10" onclick="window.Renderers.openMemberModal('${m.id}')">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-10"></div>
                    <div class="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                    
                    <div class="relative ${padding} flex flex-col sm:flex-row items-center sm:items-start gap-5 md:gap-10">
                        <!-- Image Section -->
                        <div class="relative shrink-0 flex justify-center w-full sm:w-auto">
                            <div class="${imgSize} rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-700 bg-white/5 backdrop-blur-sm">
                                ${photoHtml}
                            </div>
                        </div>

                        <!-- Content Section -->
                        <div class="text-center sm:text-left flex-1 text-white pr-0 sm:pr-4 min-w-0">
                            <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full text-[10px] md:text-xs font-black mb-3 inline-block uppercase tracking-wider shadow-lg italic transition-transform group-hover:-translate-y-0.5">${categoryTitle}</span>
                            <h3 class="${nameSize} font-black mb-1 leading-tight drop-shadow-md" title="${m.name}">${m.name}</h3>
                            <p class="text-yellow-400 ${posSize} mb-4 font-bold uppercase tracking-widest opacity-90">${m.position}</p>
                            
                            ${motto ? `
                            <div class="relative mt-2">
                                <div class="flex justify-center sm:justify-start gap-1.5">
                                    <span class="text-lg md:text-2xl text-yellow-400/30 leading-none shrink-0">“</span>
                                    <p class="text-[11px] md:text-[13px] text-white/80 italic font-medium leading-relaxed">
                                        ${motto}
                                        <span class="text-lg md:text-2xl text-yellow-400/30 leading-none inline-block align-bottom ml-1">”</span>
                                    </p>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Hover Effect Text -->
                    <div class="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 text-[10px] font-bold tracking-widest text-yellow-400/50">
                        VIEW PROFILE →
                    </div>
                </div>
            `;
        }

        // 2. LEADERSHIP (Executive Card - All other leaders - ONLY FOR HOME)
        if (m.category === 'Leadership' || m.category === 'ประธาน' || (isLeader && m.category !== 'Member')) {
            return `
                <div class="w-full sm:w-[380px] m-4 shrink-0 group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100" onclick="window.Renderers.openMemberModal('${m.id}')">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                    <div class="aspect-[4/5] overflow-hidden relative bg-gray-100">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10"></div>
                        ${photoHtml}
                        <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform pr-12">
                             <p class="text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1 truncate">${categoryTitle}</p>
                             <h4 class="text-sm md:text-xl font-bold leading-tight" title="${m.name}">${m.name}</h4>
                             <p class="text-[10px] md:text-xs text-white/70">${m.position}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. COMMITTEE & GENERAL MEMBER (Minimal Card - ONLY FOR HOME)
        return `
            <div class="w-full sm:w-[260px] m-3 shrink-0 group relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200" onclick="window.Renderers.openMemberModal('${m.id}')">
                <div class="aspect-square overflow-hidden bg-gray-50 relative">
                    ${photoHtml}
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    <div class="absolute top-2 right-2">
                         <span class="bg-blue-600/90 text-white text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">${categoryTitle}</span>
                    </div>
                </div>
                <div class="p-3 md:p-4 text-center">
                     <h4 class="font-bold text-slate-700 text-xs md:text-base mb-0.5 group-hover:text-blue-600 transition-colors px-1">${m.name}</h4>
                    <p class="text-[10px] md:text-xs text-slate-400 px-1">${m.position}</p>
                </div>
            </div>
        `;
    },

    openMemberModal(memberId) {
        const data = window.AppState.memberData[memberId];
        if (!data) return;

        // Parse Bio logic to handle JSON or Legacy
        let motto = '', history = '', studentClass = '', studentNumber = '', contacts = {}, achievements = [];
        const rawBio = data.bio || '';

        try {
            if (rawBio.trim().startsWith('{')) {
                const parsed = JSON.parse(rawBio);
                motto = parsed.motto || '';
                history = parsed.history || '';
                studentClass = parsed.studentClass || '';
                studentNumber = parsed.studentNumber || '';
                contacts = parsed.contacts || {};
                achievements = parsed.achievements || [];
            } else if (rawBio.includes('<SEP>')) {
                const parts = rawBio.split('<SEP>');
                motto = parts[0];
                history = parts[1];
            } else {
                history = rawBio;
            }
        } catch (e) {
            history = rawBio;
        }

        const displayMotto = motto;
        const displayHistory = history;

        // Construct Info and Social Media for Modal
        const infoItems = [];
        if (studentClass) infoItems.push(['ระดับชั้น', studentClass]);
        if (studentNumber) infoItems.push(['เลขที่', studentNumber]);
        if (contacts.phone) infoItems.push(['เบอร์โทร', contacts.phone]);

        const info = data.info || {};
        if (Object.keys(info).length > 0) {
            Object.entries(info).forEach(([k, v]) => {
                if (k === 'เบอร์โทร' && !contacts.phone) infoItems.push([k, v]);
                if (k === 'อีเมล' && !contacts.email) infoItems.push([k, v]);
            });
        }

        const formatUrl = (url) => {
            if (!url || url === '#' || url.trim() === '') return null;
            let formatted = url.trim();
            if (!formatted.startsWith('http')) formatted = 'https://' + formatted;
            return formatted;
        };

        const fbUrl = formatUrl(contacts.fb);
        const igUrl = formatUrl(contacts.ig);
        const ttUrl = formatUrl(contacts.tt);

        // Social Media Icons Block
        const socialItems = [];
        if (fbUrl) socialItems.push(`<a href="${fbUrl}" target="_blank" class="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xl hover:scale-110 transition-transform shadow-lg"><i class="fab fa-facebook-f"></i></a>`);
        if (igUrl) socialItems.push(`<a href="${igUrl}" target="_blank" class="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center text-xl hover:scale-110 transition-transform shadow-lg"><i class="fab fa-instagram"></i></a>`);
        if (ttUrl) socialItems.push(`<a href="${ttUrl}" target="_blank" class="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-xl hover:scale-110 transition-transform shadow-lg"><i class="fab fa-tiktok"></i></a>`);

        const socialHtml = socialItems.length > 0 ? `<div class="flex gap-4 mt-6 items-center justify-center">${socialItems.join('')}</div>` : '';

        // Achievements Block
        let achievementsHtml = '';
        if (achievements.length > 0) {
            achievementsHtml = `
                <div class="mt-12">
                    <h4 class="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-6 flex items-center justify-center md:justify-start gap-2">
                        <span class="w-8 h-[1px] bg-gray-200"></span> ผลงานและที่มาของสมาชิก
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${achievements.map(ach => `
                            <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                ${ach.image_url ? `
                                <div class="aspect-video overflow-hidden">
                                    <img src="${ach.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                                </div>
                                ` : ''}
                                <div class="p-6">
                                    <p class="text-slate-600 text-sm leading-relaxed">${ach.description || 'ไม่มีคำอธิบาย'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const adminEditBtn = window.AppState.isAdminLoggedIn
            ? `<button onclick="window.Modals.closeModal('memberModal'); window.AdminManagement.editMember('${memberId}');" class="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-600 py-2 px-4 rounded-full font-bold text-xs transition-all border border-gray-200 mt-4">✏️ แก้ไขข้อมูล</button>`
            : '';

        const content = `
            <div class="p-8 md:p-12">
                <!-- Profile Header -->
                <div class="flex flex-col items-center text-center mb-10">
                    <div class="w-full max-w-[320px] aspect-[3/4] rounded-3xl overflow-hidden border-8 border-white shadow-2xl mb-8 bg-gray-100 relative group rotate-0 hover:rotate-1 transition-transform duration-500">
                        ${data.photo_url ? `<img src="${data.photo_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : '<div class="w-full h-full flex items-center justify-center text-6xl text-gray-300">👤</div>'}
                    </div>
                    
                    <span class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-blue-100">${data.position}</span>
                    <h3 class="text-3xl md:text-5xl font-black text-slate-800 mb-3 leading-tight">${data.name}</h3>
                    ${displayMotto ? `<p class="text-lg md:text-xl text-slate-500 italic max-w-2xl px-4">"${displayMotto}"</p>` : ''}
                    
                    ${socialHtml}
                    ${adminEditBtn}
                </div>

                <div class="max-w-4xl mx-auto">
                    <!-- History & Vision -->
                    <div class="mb-10 text-center md:text-left">
                         <h4 class="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                            <span class="w-8 h-[1px] bg-gray-200"></span> ประวัติและวิสัยทัศน์
                        </h4>
                        <p class="text-lg text-slate-600 leading-relaxed text-center md:text-left">
                            ${(displayHistory || 'มุ่งมั่นพัฒนาโรงเรียนและสร้างสรรค์สิ่งดีๆ ให้กับสังคม').replace(/\n/g, '<br>')}
                        </p>
                    </div>

                    ${achievementsHtml}

                    <!-- Info Grid -->
                    ${infoItems.length > 0 ? `
                    <div class="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 mt-12">
                        <h5 class="font-bold text-heading mb-6 text-sm flex items-center justify-center md:justify-start gap-2">
                             <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> ข้อมูลทั่วไป
                        </h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            ${infoItems.map(([key, value]) => `
                                <div class="flex justify-between items-center text-sm border-b border-gray-200/50 pb-2 last:border-0 last:pb-0 md:border-b-0 md:pb-0">
                                    <span class="text-gray-500 font-medium">${key}</span>
                                    <span class="text-heading font-bold">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.getElementById('memberModalContent').innerHTML = content;
        window.Modals.openModal('memberModal');
    },

    // --- Policies ---
    renderPolicies(policies) {
        window.AppState.policyData = policies;
        this.renderPoliciesHome();
        this.renderPoliciesDetail();
        if (window.AppState.isAdminLoggedIn) this.renderPolicyManagementTable();
    },

    renderPoliciesHome() {
        const grid = document.getElementById('policiesHomeGrid');
        if (!grid) return;
        const data = window.AppState.policyData;

        if (data.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">ยังไม่มีข้อมูลนโยบาย</div>';
            return;
        }

        grid.innerHTML = data.map((p, i) => `
            <div class="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-secondary hover:shadow-xl transition-all cursor-pointer group"
                onclick="window.Navigation.navigateToPolicyDetail(${i + 1})">
                <div class="flex items-start mb-4">
                    <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform">
                        <span class="text-3xl">${p.icon || '📖'}</span>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-heading mb-1">${p.title}</h3>
                        <span class="text-sm text-secondary font-semibold uppercase tracking-widest">Policy ${String(i + 1).padStart(2, '0')}</span>
                    </div>
                </div>
                <p class="text-body leading-relaxed line-clamp-3">${p.summary}</p>
                <div class="mt-6 text-primary font-bold flex items-center text-sm">
                    <span>อ่านรายละเอียด</span> 
                    <span class="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
            </div>
        `).join('');
    },

    renderPoliciesDetail() {
        const container = document.getElementById('policiesDetailContainer');
        if (!container) return;
        const data = window.AppState.policyData;

        if (data.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-gray-400">ยังไม่มีข้อมูลนโยบาย</div>';
            return;
        }

        container.innerHTML = data.map((p, i) => {
            let guidelines = [];
            try { guidelines = JSON.parse(p.guidelines || '[]'); } catch (e) { guidelines = []; }

            const bgClasses = ['bg-blue-50', 'bg-amber-50', 'bg-purple-50', 'bg-green-50', 'bg-teal-50'];
            const listBgClasses = ['bg-indigo-50', 'bg-orange-50', 'bg-indigo-50', 'bg-teal-50', 'bg-blue-50'];

            return `
            <div class="policy-detail-section mb-20" id="policy${i + 1}">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
                    <h3 class="text-3xl md:text-4xl font-black text-heading">
                        <span class="text-4xl md:text-5xl mr-2">${p.icon || '📖'}</span> 
                        ${p.title}
                    </h3>
                    <span class="bg-primary text-white px-4 py-1 rounded-full text-xs font-black tracking-[0.2em] uppercase">Policy ${String(i + 1).padStart(2, '0')}</span>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div class="${bgClasses[i % 5]} p-10 rounded-3xl border border-white shadow-sm">
                        <h4 class="font-black text-xl mb-4 text-heading flex items-center gap-3">🎯 วัตถุประสงค์</h4>
                        <p class="text-gray-700 leading-relaxed text-lg">${p.objective}</p>
                    </div>

                    <div class="bg-green-50 p-10 rounded-3xl border border-white shadow-sm">
                        <h4 class="font-black text-xl mb-4 text-heading flex items-center gap-3">🎖️ ผลลัพธ์ที่คาดหวัง</h4>
                        <p class="text-gray-700 leading-relaxed text-lg">${p.results}</p>
                    </div>
                </div>

                <div class="${listBgClasses[i % 5]} p-6 md:p-12 rounded-[2.5rem] border border-white shadow-sm">
                    <h4 class="font-black text-xl md:text-2xl mb-10 text-heading flex items-center gap-3">
                        <span class="w-2 h-8 bg-primary rounded-full"></span> แนวทางการดำเนินงาน
                    </h4>
                    <ul class="space-y-6 md:space-y-8">
                        ${guidelines.map((g, idx) => `
                            <li class="bg-white/80 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] hover:bg-white transition-all duration-300 border border-transparent hover:border-white shadow-sm hover:shadow-xl group">
                                <div class="flex items-start gap-4 md:gap-6 mb-4 md:mb-6">
                                    <div class="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#74040E] text-white flex items-center justify-center font-black shrink-0 shadow-[0_10px_20px_rgba(116,4,14,0.3)] text-lg md:text-xl">
                                        ${idx + 1}
                                    </div>
                                    <h5 class="text-lg md:text-3xl font-black text-heading leading-tight mt-1 md:mt-2">
                                        ${g.title}
                                    </h5>
                                </div>
                                <div class="pl-1 md:pl-20">
                                    <p class="text-gray-600 leading-relaxed font-medium text-sm md:text-xl opacity-90">
                                        ${g.content}
                                    </p>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            `;
        }).join('');
    },

    renderPolicyManagementTable() {
        const tableBody = document.getElementById('policyManagementTableBody');
        if (!tableBody) return;
        const data = window.AppState.policyData;

        if (data.length === 0) {
            tableBody.innerHTML = '<div class="px-6 py-12 text-center text-gray-500">ไม่มีข้อมูลนโยบาย</div>';
            return;
        }

        tableBody.innerHTML = data.map(p => `
            <div class="group hover:bg-gray-50 transition-all duration-200 p-4 md:px-6 md:py-4">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <!-- Icon -->
                    <div class="md:col-span-1 flex justify-start md:justify-center">
                        <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl shadow-sm border border-gray-200">
                            ${p.icon || '📖'}
                        </div>
                    </div>

                    <!-- Title & Desc -->
                    <div class="md:col-span-8 min-w-0">
                        <h4 class="font-bold text-heading text-lg md:text-base mb-1 md:mb-0">${p.title}</h4>
                        <p class="text-sm text-gray-500 line-clamp-2 md:line-clamp-1">${p.summary}</p>
                    </div>

                    <!-- Rank -->
                    <div class="md:col-span-1 flex items-center justify-between md:justify-center mt-2 md:mt-0 ml-[3.5rem] md:ml-0">
                        <span class="md:hidden text-xs font-bold text-gray-400">ลำดับ:</span>
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold font-mono">${p.rank}</span>
                    </div>

                    <!-- Actions -->
                    <div class="md:col-span-2 text-right mt-3 md:mt-0 flex justify-end">
                         <button onclick="window.AdminManagement.editPolicy('${p.id}')" 
                            class="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                            <span>✏️</span> <span class="md:hidden">แก้ไขข้อมูล</span><span class="hidden md:inline">แก้ไข</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // --- Gallery ---
    renderGallery(gallery) {
        window.AppState.galleryData = {};
        gallery.forEach(item => window.AppState.galleryData[item.id] = item);

        const grid = document.getElementById('galleryGrid');
        const adminGrid = document.getElementById('galleryManagementGrid');

        if (grid) {
            grid.innerHTML = gallery.map(item => {
                const adminControls = window.AppState.isAdminLoggedIn
                    ? `<button onclick="event.stopPropagation(); window.openGalleryManagementModal('${item.id}')" class="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-30 transition-all hover:scale-110" title="แก้ไข/ลบ"><span class="text-lg">✏️</span></button>`
                    : '';

                return `
                <div class="gallery-item group relative bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all border border-gray-100 flex flex-col" onclick="window.Renderers.openImageModal('${item.id}')">
                    ${adminControls}
                    <div class="aspect-video w-full overflow-hidden bg-gray-100 relative">
                         <img src="${item.image_url}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                    </div>
                    <div class="p-5 flex flex-col gap-2 relative z-20 bg-white flex-1">
                         <div class="flex justify-between items-start">
                             <h4 class="font-bold text-heading text-lg leading-tight line-clamp-2 pr-6">${item.title}</h4>
                             <span class="text-xs font-bold text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-md shrink-0 ml-2">${new Date(item.date).toLocaleDateString('th-TH')}</span>
                         </div>
                         <p class="text-gray-500 text-sm line-clamp-2 font-medium">${(item.description || '').split('<METADATA>')[0]}</p>
                    </div>
                </div>
            `;
            }).join('');
        }

        if (adminGrid) {
            adminGrid.innerHTML = gallery.map(item => `
                <div class="relative group rounded-xl overflow-hidden aspect-video shadow-md border-2 border-transparent hover:border-primary transition-all cursor-pointer" onclick="window.AdminManagement.openGalleryManagementModal('${item.id}')">
                    <img src="${item.image_url}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white font-bold">✏️ แก้ไข</span>
                    </div>
                </div>
            `).join('');
        }
    },

    openImageModal(imageId) {
        const data = window.AppState.galleryData[imageId];
        if (!data) return;

        const dateDesc = new Date(data.date).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Support multiple images from metadata (embedded in description or column)
        let images = [];

        // 1. Check embedded in Description
        if (data.description && data.description.includes('<METADATA>')) {
            try {
                const parts = data.description.split('<METADATA>');
                const meta = JSON.parse(parts[1]);
                images = meta.images || [];
            } catch (e) {
                console.error('Failed to parse metadata from description:', e);
            }
        }
        // 2. Check legacy Metadata column
        else if (data.metadata) {
            try {
                const meta = JSON.parse(data.metadata);
                images = meta.images || [];
            } catch (e) {
                console.error('Failed to parse metadata:', e);
            }
        }
        if (images.length === 0 && data.image_url) {
            images = [data.image_url];
        }

        const hasMultipleImages = images.length > 1;

        // Generate gallery HTML - Responsive Clean Version
        let galleryHtml = '';
        if (images.length > 0) {
            galleryHtml = `
                <div class="relative w-full">
                    <!-- Main Image Display -->
                    <div id="galleryMainImage" class="relative overflow-hidden rounded-t-2xl md:rounded-3xl bg-black/5 flex items-center justify-center">
                        <img src="${images[0]}" class="w-full h-auto max-h-[50vh] md:max-h-[70vh] object-contain mx-auto transition-opacity duration-300" alt="${data.title}">
                    </div>
                    
                    ${hasMultipleImages ? `
                    <!-- Gallery Navigation -->
                    <div class="flex items-center gap-3 mt-4 md:mt-6 px-4 overflow-x-auto pb-2 custom-scrollbar snap-x">
                        ${images.map((img, idx) => `
                            <button 
                                onclick="window.Renderers.switchGalleryImage('${imageId}', ${idx})"
                                class="gallery-thumb snap-start ${idx === 0 ? 'active ring-2 md:ring-4 ring-blue-500 ring-offset-2' : ''} shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 border-transparent transition-all cursor-pointer opacity-70 hover:opacity-100 active:scale-95"
                                data-thumb-index="${idx}">
                                <img src="${img}" class="w-full h-full object-cover" alt="รูปที่ ${idx + 1}">
                            </button>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            `;
        } else {
            galleryHtml = `<div class="aspect-video flex items-center justify-center text-gray-300 text-6xl bg-gray-50 rounded-3xl">📸</div>`;
        }

        const content = `
            <div class="bg-white rounded-2xl md:rounded-3xl overflow-hidden w-[95%] md:w-full max-w-5xl mx-auto shadow-2xl my-4 md:my-0">
                <!-- Image Section - Full Width, No Frame -->
                <div class="p-0">
                    ${galleryHtml}
                </div>
                
                <!-- Content Section -->
                <div class="p-5 md:p-10">
                    <!-- Title & Date -->
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-4 md:mb-6 border-b border-gray-100 pb-4 md:pb-6">
                        <div class="w-full">
                            <h3 class="text-xl md:text-3xl font-black text-slate-800 leading-tight mb-2 md:mb-2">${data.title}</h3>
                             <div class="inline-flex items-center gap-2 text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
                                <span>📅</span> ${dateDesc}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="prose prose-sm md:prose-lg text-slate-600 max-none leading-relaxed">
                         <p>${(data.description || '').split('<METADATA>')[0].replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('imageModalContent').innerHTML = content;
        window.Modals.openModal('imageModal');
    },

    switchGalleryImage(imageId, index) {
        const data = window.AppState.galleryData[imageId];
        if (!data) return;

        let images = [];

        if (data.description && data.description.includes('<METADATA>')) {
            try {
                const parts = data.description.split('<METADATA>');
                const meta = JSON.parse(parts[1]);
                images = meta.images || [];
            } catch (e) {
                console.error('Failed to parse metadata from description:', e);
            }
        } else if (data.metadata) {
            try {
                const meta = JSON.parse(data.metadata);
                images = meta.images || [];
            } catch (e) {
                console.error('Failed to parse metadata:', e);
            }
        } else if (data.image_url) {
            images = [data.image_url];
        }

        const mainImg = document.querySelector('#galleryMainImage img');
        if (mainImg && images[index]) {
            // Fade out
            mainImg.style.opacity = '0.5';

            setTimeout(() => {
                mainImg.src = images[index];
                mainImg.style.opacity = '1';
            }, 200);

            // Update active thumbnail
            document.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
                if (idx === index) {
                    thumb.classList.add('active', 'ring-4', 'ring-blue-500', 'ring-offset-2', 'opacity-100');
                    thumb.classList.remove('opacity-70');
                } else {
                    thumb.classList.remove('active', 'ring-4', 'ring-blue-500', 'ring-offset-2', 'opacity-100');
                    thumb.classList.add('opacity-70');
                }
            });
        }
    },

    // --- Slider ---
    renderHeroSlides(slides) {
        const slider = document.getElementById('heroSlider');
        if (!slider) return;

        const adminBtn = window.AppState.isAdminLoggedIn
            ? `<button onclick="window.AdminManagement.openHeroSlideModal()" class="absolute top-6 right-6 z-50 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full font-bold shadow-lg transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-sm"><span>⚙️</span> จัดการสไลด์</button>`
            : '';

        if (!slides || slides.length === 0) {
            slider.innerHTML = `
                <div class="slider-track" id="sliderTrack">
                    <div class="slide active" style="background-color: #1e293b;">
                        <div class="slide-content text-center">
                            <div class="text-6xl mb-4">🖼️</div>
                            <h2 class="text-3xl md:text-5xl font-bold text-white mb-2">ยินดีต้อนรับ</h2>
                            <p class="text-gray-400 text-lg">${window.AppState.isAdminLoggedIn ? 'ยังไม่มีรูปสไลด์เริ่มต้น (คลิกปุ่มขวาบนเพื่อจัดการ)' : 'Welcome to Student Council'}</p>
                        </div>
                    </div>
                </div>
                ${adminBtn}`;
            return;
        }

        const isActivities = window.AppState.currentCarouselSource === 'activities';

        const slidesHtml = slides.map((s, i) => `
            <div class="slide ${i === 0 ? 'active' : ''} ${isActivities ? 'slide-gallery' : ''}" ${!isActivities ? `style="background-image: url('${s.image_url}')"` : ''}>
                ${isActivities ? `
                    <div class="slide-bg-blur" style="background-image: url('${s.image_url}')"></div>
                    <img src="${s.image_url}" class="slide-img-contain" alt="${s.title}">
                ` : `
                    <div class="slide-overlay"></div>
                    <div class="slide-content">
                        <h1 class="text-4xl md:text-6xl font-bold mb-4 font-serif text-shadow">${s.title}</h1>
                        <p class="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto text-shadow">${s.caption || ''}</p>
                    </div>
                `}
            </div>
        `).join('');

        slider.innerHTML = `
            <div class="slider-track" id="sliderTrack">
                ${slidesHtml}
            </div>
            ${adminBtn}
            
            <div class="slider-arrow left" onclick="window.changeSlide(-1)">‹</div>
            <div class="slider-arrow right" onclick="window.changeSlide(1)">›</div>
            
            ${slides.length > 1 ? `
            <div class="slider-nav">
                ${slides.map((_, i) => `<div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})"></div>`).join('')}
            </div>
            ` : ''}
        `;

        // Reset and Initialize Slider State to prevent sync issues
        window.HeroSlider.currentSlide = 0;
        window.HeroSlider.init();
        // Force initial position set (though usually 0 is default)
        window.HeroSlider.showSlide(0);
    },
    // --- Utils ---
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    },

    // Initialize all renderers
    init() {
        this.renderPolicies();
        this.renderMembers();
        this.renderGallery();
        this.setupSmoothScroll();

        // Listen for data updates
        window.addEventListener('app-data-updated', () => {
            this.renderPolicies();
            this.renderMembers();
            this.renderGallery();
        });
    }
};

window.openMemberModal = (id) => window.Renderers.openMemberModal(id);
window.openImageModal = (id) => window.Renderers.openImageModal(id);
