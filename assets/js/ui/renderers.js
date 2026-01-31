window.Renderers = {
    // --- Members ---
    renderMembers(members) {
        window.AppState.memberData = {}; // Store in app state for lookup
        members.forEach(m => window.AppState.memberData[m.id] = m);

        const container = document.getElementById('membersList');
        const homeLeadershipContainer = document.getElementById('homeLeadershipGrid');
        const pageLeadershipContainer = document.getElementById('pageLeadershipGrid');

        // Filter Groups
        const allLeaders = members.filter(m => m.category === 'Leadership').sort((a, b) => a.rank - b.rank);
        const presidents = allLeaders.filter(m => m.position.includes('ประธาน') || m.rank === 1);
        const executives = allLeaders.filter(m => !presidents.includes(m)); // Executives are the rest

        const committees = members.filter(m => m.category === 'Committee').sort((a, b) => a.rank - b.rank);
        const generalMembers = members.filter(m => m.category === 'Member').sort((a, b) => a.rank - b.rank);

        // --- Render Functions ---

        // 1. Home Page Leadership (Mixed but Presidents top)
        if (homeLeadershipContainer) {
            let html = '';
            // Presidents
            html += presidents.map(m => this.createMemberCard(m, true)).join('');

            // Executives Grid (Centered)
            if (executives.length > 0) {
                html += `<div class="col-span-full flex flex-wrap justify-center gap-6 mt-6">`;
                html += executives.map(m => this.createMemberCard(m, true)).join('');
                html += `</div>`;
            }
            homeLeadershipContainer.innerHTML = html;
        }

        // 2. Full Leadership Page (Sectioned)
        if (pageLeadershipContainer) {
            let html = '';

            // Section: President
            if (presidents.length > 0) {
                html += `<div class="col-span-full mb-8 text-center"><h3 class="text-3xl font-bold font-serif text-heading relative inline-block">ประธานสภา <span class="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></span></h3></div>`;
                html += presidents.map(m => this.createMemberCard(m, true)).join('');
            }

            // Section: Executives (Centered)
            if (executives.length > 0) {
                html += `<div class="col-span-full mb-6 mt-12"><h4 class="text-2xl font-bold font-serif text-heading pl-4 border-l-4 border-blue-900">คณะผู้บริหาร</h4></div>`;
                html += `<div class="col-span-full flex flex-wrap justify-center gap-6">`; // Changed from grid to flex
                html += executives.map(m => this.createMemberCard(m, true)).join('');
                html += `</div>`;
            }

            pageLeadershipContainer.innerHTML = html;
        }

        // Render Others
        if (container) {
            let html = '';

            if (committees.length > 0) {
                html += `<div class="col-span-full mb-6 mt-2"><h4 class="text-2xl font-bold font-serif text-heading pl-4 border-l-4 border-yellow-400">คณะกรรมการ</h4></div>`;
                html += `<div class="col-span-full flex flex-wrap justify-center gap-6 w-full">`; // Wrapper for centering
                html += committees.map(m => this.createMemberCard(m, false)).join('');
                html += `</div>`;
            }

            if (generalMembers.length > 0) {
                html += `<div class="col-span-full mb-6 ${committees.length > 0 ? 'mt-12' : 'mt-2'}"><h4 class="text-2xl font-bold font-serif text-heading pl-4 border-l-4 border-blue-900">สมาชิกพรรค</h4></div>`;
                html += `<div class="col-span-full flex flex-wrap justify-center gap-6 w-full">`; // Wrapper for centering
                html += generalMembers.map(m => this.createMemberCard(m, false)).join('');
                html += `</div>`;
            }

            if (committees.length === 0 && generalMembers.length === 0) {
                html = '<div class="col-span-full text-center text-gray-400 py-10">ไม่พบข้อมูลสมาชิก</div>';
            }

            container.innerHTML = html;
        }

        const adminTable = document.getElementById('managementTableBody');
        if (adminTable) {
            const translateCategory = (cat) => {
                const map = {
                    'Leadership': 'ผู้บริหาร',
                    'Committee': 'คณะกรรมการ',
                    'Member': 'สมาชิกทั่วไป'
                };
                return map[cat] || cat;
            };

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
                                ${translateCategory(m.category)}
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

    createMemberCard(m, isLeader) {
        const photoHtml = m.photo_url
            ? `<img src="${m.photo_url}" alt="${m.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-4xl text-gray-400">👤</div>`;

        // 1. PRESIDENT & TOP LEADERSHIP (Special Layout)
        // Check for 'ประธาน' or rank 1 to display the highlight big card
        if (m.category === 'Leadership' && (m.position.includes('ประธาน') || m.rank === 1)) {
            const motto = (m.bio || '').split('<SEP>')[0] || '';
            return `
                <div class="col-span-full mb-8">
                    <div class="president-card group relative bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2rem] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer border border-white/10" onclick="window.Renderers.openMemberModal('${m.id}')">
                        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div class="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                            <div class="w-32 h-32 md:w-60 md:h-60 rounded-full overflow-hidden border-4 md:border-8 border-white/20 shadow-2xl shrink-0 group-hover:scale-105 transition-transform bg-white">
                                ${photoHtml}
                            </div>
                            <div class="text-center md:text-left flex-1 text-white">
                                <span class="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-black mb-4 inline-block uppercase tracking-widest shadow-lg transform group-hover:-translate-y-1 transition-transform">${m.position}</span>
                                <h3 class="text-2xl md:text-5xl font-black mb-4 font-serif tracking-tight leading-tight">${m.name}</h3>
                                ${motto ? `<p class="text-base md:text-xl text-yellow-200/90 italic font-serif leading-relaxed line-clamp-3 md:line-clamp-none">"${motto}"</p>` : ''}
                                <div class="mt-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-xs font-bold tracking-widest text-white/50 hidden md:block">CLICK TO VIEW PROFILE</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 2. LEADERSHIP (Executive Card)
        if (m.category === 'Leadership') {
            return `
                <div class="w-[calc(50%-0.75rem)] md:w-64 group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100" onclick="window.Renderers.openMemberModal('${m.id}')">
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                    <div class="aspect-[4/5] overflow-hidden relative bg-gray-100">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity z-10"></div>
                        ${photoHtml}
                        <div class="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                             <p class="text-[10px] md:text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1 truncate">${m.position}</p>
                             <h4 class="text-base md:text-xl font-bold font-serif leading-tight line-clamp-2">${m.name}</h4>
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. COMMITTEE & GENERAL MEMBER (Minimal Card)
        // Removed specific Committee block to use the unified design below
        return `
            <div class="w-[calc(33.33%-0.75rem)] md:w-48 group relative bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200" onclick="window.Renderers.openMemberModal('${m.id}')">
                <div class="aspect-square overflow-hidden bg-gray-50 relative">
                    ${photoHtml}
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
                <div class="p-2 md:p-3 text-center">
                    <h4 class="font-bold text-slate-700 text-xs md:text-sm mb-0.5 group-hover:text-blue-600 transition-colors truncate px-1">${m.name}</h4>
                    <p class="text-[10px] md:text-xs text-slate-400 truncate px-1">${m.position}</p>
                </div>
            </div>
        `;
    },

    openMemberModal(memberId) {
        const data = window.AppState.memberData[memberId];
        if (!data) return;

        // Parse Bio logic to handle JSON or Legacy
        let motto = '', history = '', studentClass = '', studentNumber = '', contacts = {};
        const rawBio = data.bio || '';

        try {
            if (rawBio.trim().startsWith('{')) {
                const parsed = JSON.parse(rawBio);
                motto = parsed.motto || '';
                history = parsed.history || '';
                studentClass = parsed.studentClass || '';
                studentNumber = parsed.studentNumber || '';
                contacts = parsed.contacts || {};
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

        // Construct Info for Modal
        const infoItems = [];
        if (studentClass) infoItems.push(['ระดับชั้น', studentClass]);
        if (studentNumber) infoItems.push(['เลขที่', studentNumber]);
        if (contacts.phone) infoItems.push(['เบอร์โทร', contacts.phone]);
        if (contacts.fb) infoItems.push(['Facebook', `<a href="${contacts.fb}" target="_blank" class="text-blue-600 hover:underline">Link</a>`]);
        if (contacts.ig) infoItems.push(['Instagram', `<a href="${contacts.ig}" target="_blank" class="text-pink-600 hover:underline">Link</a>`]);
        if (contacts.tt) infoItems.push(['TikTok', `<a href="${contacts.tt}" target="_blank" class="text-black hover:underline">Link</a>`]);

        const info = data.info || {}; // Fallback for really old data
        if (Object.keys(info).length > 0) {
            // Merge old info if not covered (Phone/Email legacy)
            Object.entries(info).forEach(([k, v]) => {
                if (k === 'เบอร์โทร' && !contacts.phone) infoItems.push([k, v]);
                if (k === 'อีเมล' && !contacts.email) infoItems.push([k, v]);
            });
        }

        let cardInfoHtml = '';
        if (infoItems.length > 0) {
            cardInfoHtml = `
                <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100 mt-4">
                    <h5 class="font-bold text-heading mb-4 text-sm">ข้อมูลทั่วไป</h5>
                    <div class="space-y-3">
                        ${infoItems.map(([key, value]) => `
                            <div class="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <span class="text-gray-500 font-medium">${key}</span>
                                <span class="text-heading font-bold">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const adminEditBtn = window.AppState.isAdminLoggedIn
            ? `<button onclick="window.AdminManagement.editMember('${memberId}'); window.Modals.closeModal('memberModal');" class="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-600 py-2 px-4 rounded-full font-bold text-xs transition-all border border-gray-200 mt-4">✏️ แก้ไขข้อมูล</button>`
            : '';

        const content = `
            <div class="p-8 md:p-12">
                <!-- Profile Header -->
                <div class="flex flex-col items-center text-center mb-10">
                    <div class="w-48 h-48 md:w-72 md:h-72 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl mb-8 bg-gray-100 relative group rotate-0 hover:rotate-1 transition-transform duration-500">
                        ${data.photo_url ? `<img src="${data.photo_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">` : '<div class="w-full h-full flex items-center justify-center text-6xl text-gray-300">👤</div>'}
                    </div>
                    
                    <span class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-3 border border-blue-100">${data.position}</span>
                    <h3 class="text-3xl md:text-5xl font-black font-serif text-slate-800 mb-3 leading-tight">${data.name}</h3>
                    ${displayMotto ? `<p class="text-lg md:text-xl text-slate-500 font-serif italic max-w-2xl px-4">"${displayMotto}"</p>` : ''}
                    
                    ${adminEditBtn}
                </div>

                <div class="max-w-4xl mx-auto">
                    <!-- History & Vision -->
                    <div class="mb-10 text-center md:text-left">
                         <h4 class="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                            <span class="w-8 h-[1px] bg-gray-200"></span> ประวัติและวิสัยทัศน์
                        </h4>
                        <p class="text-lg text-slate-600 leading-relaxed font-serif text-center md:text-left">
                            ${(displayHistory || 'มุ่งมั่นพัฒนาโรงเรียนและสร้างสรรค์สิ่งดีๆ ให้กับสังคม').replace(/\n/g, '<br>')}
                        </p>
                    </div>

                    <!-- Info Grid -->
                    ${infoItems.length > 0 ? `
                    <div class="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100">
                        <h5 class="font-bold text-heading mb-6 text-sm flex items-center gap-2">
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
                    <h3 class="text-3xl md:text-4xl font-black text-heading font-serif">
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

                <div class="${listBgClasses[i % 5]} p-10 rounded-3xl border border-white shadow-sm">
                    <h4 class="font-black text-xl mb-8 text-heading flex items-center gap-3">📋 แนวทางการดำเนินงาน</h4>
                    <ul class="space-y-6">
                        ${guidelines.map((g, idx) => `
                            <li class="flex items-start gap-6 bg-white/50 p-6 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-white/50">
                                <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 shadow-lg">${idx + 1}</div>
                                <div>
                                    <strong class="text-heading text-xl block mb-2 font-black">${g.title}</strong>
                                    <p class="text-gray-600 leading-relaxed font-medium">${g.content}</p>
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
                            <h3 class="text-xl md:text-3xl font-black text-slate-800 font-serif leading-tight mb-2 md:mb-2">${data.title}</h3>
                             <div class="inline-flex items-center gap-2 text-gray-500 text-xs md:text-sm font-bold uppercase tracking-wider">
                                <span>📅</span> ${dateDesc}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="prose prose-sm md:prose-lg text-slate-600 font-serif max-w-none leading-relaxed">
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
                <div class="slide active" style="background-color: #1e293b;">
                    ${adminBtn}
                    <div class="slide-content text-center">
                        <div class="text-6xl mb-4">🖼️</div>
                        <h2 class="text-3xl md:text-5xl font-bold text-white mb-2">ยินดีต้อนรับ</h2>
                        <p class="text-gray-400 text-lg">${window.AppState.isAdminLoggedIn ? 'ยังไม่มีรูปสไลด์เริ่มต้น (คลิกปุ่มขวาบนเพื่อจัดการ)' : 'Welcome to Student Council'}</p>
                    </div>
                </div>`;
            return;
        }

        slider.innerHTML = slides.map((s, i) => `
            <div class="slide ${i === 0 ? 'active' : ''}" style="background-image: url('${s.image_url}')">
                <div class="slide-overlay"></div>
                ${adminBtn}
            </div>
        `).join('');

        // Generate dots
        const dotsContainer = document.querySelector('.slider-nav');
        if (dotsContainer) {
            dotsContainer.innerHTML = slides.map((_, i) => `
                <div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="window.HeroSlider.goToSlide(${i})"></div>
            `).join('');
        }

        window.HeroSlider.init();
    }
    // --- Departments ---
    async renderDepartments() {
        const container = document.getElementById('departmentsGrid');
        if (!container) return;

        try {
            const departments = await window.DepartmentService.fetchDepartments();

            if (!departments || departments.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div class="text-4xl mb-4">🏛️</div>
                        <h3 class="text-xl font-bold text-gray-400">ยังไม่มีข้อมูลฝ่ายบริหาร</h3>
                        <p class="text-gray-400 text-sm mt-2">แอดมินสามารถเพิ่มข้อมูลได้</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = departments.map(dept => `
                 <div class="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                     
                    <div class="relative z-10">
                        <!-- Icon/Image -->
                        <div class="w-16 h-16 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-6 text-3xl overflow-hidden">
                            ${dept.icon_url
                    ? `<img src="${dept.icon_url}" class="w-full h-full object-cover">`
                    : '🏛️'}
                        </div>

                        <h3 class="text-xl font-black text-heading font-serif mb-2 group-hover:text-blue-600 transition-colors">${dept.title}</h3>
                        ${dept.role ? `<span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg mb-4 uppercase tracking-wider">${dept.role}</span>` : ''}
                        
                        <p class="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 min-h-[3rem]">
                            ${dept.description || 'ไม่มีรายละเอียด'}
                        </p>

                        <!-- Admin Actions -->
                        <div class="admin-only hidden pt-4 border-t border-gray-50 mt-4 flex justify-end">
                             <button onclick="window.AdminManagement.openDepartmentManagementModal('${dept.id}')" 
                                class="text-sm font-bold text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                                <span>✏️</span> แก้ไข
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Re-check admin visibility after rendering
            window.Helpers.checkAdminAuth();

        } catch (error) {
            console.error('Failed to render departments:', error);
            container.innerHTML = '<p class="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
        }
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
        this.renderDepartments();
        // this.renderHeroSlides(); // Called by main.js separately usually, or here
        this.setupSmoothScroll();

        // Listen for data updates
        window.addEventListener('app-data-updated', () => {
            this.renderPolicies();
            this.renderMembers();
            this.renderGallery();
            this.renderDepartments();
        });
    }
};

window.openMemberModal = (id) => window.Renderers.openMemberModal(id);
window.openImageModal = (id) => window.Renderers.openImageModal(id);
