/*************************************************
 * 1. CENTRAL CONFIGURATION
 *************************************************/
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbxzEqryOdmFGUWp_vUmTw3qr5VzIxZ33nFlgmsLFuOobpo9oU8b7FiGPUnLuV6XcjXH/exec',
    TERM_ENDS: ['2026-07-22', '2026-12-18', '2027-04-02'],
    SOCIAL_LINK: 'https://instagram.com'
};

/*************************************************
 * 2. GLOBAL STATE & UTILITIES
 *************************************************/
let db = { tutors: [], dropdowns: { subjects: [], days: [], times: [] }, pricing: { baseRate: 2, multipliers: {} }, gallery: [], links: [] };
let activeJobsList = [];

const $ = id => document.getElementById(id);
const setHtml = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

const getTutorDisplayName = t => {
    const rawFirst = t['first name'] || t['name'] || '';
    const rawLast = t['last name'] || '';
    return rawFirst && rawLast ? `${rawFirst} ${rawLast}` : (rawFirst || t.combinedfullname || '');
};

const getTutorSubjects = t => [1,2,3,4,5].map(i => t[`subject ${i} taught`] ? `${t[`subject ${i} taught`]}<sup>${t[`subject ${i} level`] || ''}</sup>` : '').filter(Boolean);

const getStandardQuals = t => [1,2,3,4,5].map(i => {
    const s = t[`qual subject ${i}`] || t[`qual ${i} subject`];
    return s ? `<li>${t[`qual ${i} level`]||''} ${s} (${t[`qual ${i} grade`]||''})</li>` : '';
}).filter(Boolean).join('');

const getExtraQuals = t => [1,2,3,4,5].map(i => {
    const e = t[`extra qual. ${i}`] || t[`extra qual ${i}`];
    return e ? `<li>${e}</li>` : '';
}).filter(Boolean).join('');

const formatVideoUrl = url => {
    if (!url) return '';
    return url.includes('drive.google') ? `https://drive.google.com/file/d/${url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]}/preview` : url.replace('watch?v=', 'embed/');
};

const formatPhotoUrl = url => {
    if (!url) return '';
    const match = url.match(/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    const id = match?.[1] || match?.[2];
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : '';
};

/*************************************************
 * 3. INITIALIZATION
 *************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await (await fetch(CONFIG.API_URL)).json();
        if (data.error) throw data.error;
        db = data;
        
        // Render links from secure API package
        if (db.links && db.links.length > 0) {
            const linksHtml = db.links.map(l => `<a class="book" href="${l.url}" target="_blank"><span>${l.text}</span></a>`).join('');
            setHtml('link-library', linksHtml);
        } else {
            setHtml('link-library', '<p class="loader-text">No links active.</p>');
        }
        
        buildDropdowns();
        buildGallery();
        setupRoster();
        setupCalculator();
        setupStaffPortal();
    } catch (e) {
        console.error("Database error", e);
    } finally {
        setTimeout(() => {
            const loader = $('startup-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }
        }, 1200); 
    }
});

/*************************************************
 * 4. GLOBAL EVENT ROUTER
 *************************************************/
document.addEventListener('click', async (e) => {
    const videoBtn = e.target.closest('.tutor-video-btn');
    if (videoBtn) {
        $('modal-iframe').src = videoBtn.dataset.url;
        $('modal-title').innerText = `${videoBtn.dataset.name}'s Intro`;
        $('global-video-modal').classList.remove('hidden');
    }
    
    if (e.target.closest('.close-modal-btn')) {
        $('global-video-modal').classList.add('hidden');
        $('modal-iframe').src = ''; 
    }

    const shareBtn = e.target.closest('.social-share-btn');
    if (shareBtn) {
        const url = shareBtn.dataset.shareUrl;
        if (navigator.share) navigator.share({ title: '@family. Gallery', url: url }).catch(()=>{});
        else { navigator.clipboard.writeText(url); alert("Image link copied to clipboard!"); }
    }

    const claimBtn = e.target.closest('.claim-job-btn');
    if (claimBtn) claimJob(claimBtn.dataset.jobId, claimBtn);
});

/*************************************************
 * 5. CORE RENDER FUNCTIONS
 *************************************************/
function buildDropdowns() {
    let sHtml = '', lHtml = '', locHtml = '';
    
    Object.entries(db.pricing?.multipliers || {}).forEach(([k, item]) => {
        const val = typeof item === 'object' ? (item.multiplier ?? 1) : parseFloat(item);
        const desc = item.description ? ` (${item.description.trim()})` : '';
        const label = k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + desc;
        
        const opt = `<option value="${val}">${label}</option>`;
        if (k.match(/club|tuition|service|walking/i)) sHtml += opt;
        else if (k.match(/level|gcse|sats|11\+/i)) lHtml += `<option value="${val}">${label.replace(/Gcse\/sats/i, 'GCSE/SATs')}</option>`;
        else if (k.match(/online|travel|person/i)) locHtml += `<option value="${val}">${label.replace(/In person/i, 'In-Person')}</option>`;
    });

    setHtml('calc-service', sHtml); 
    setHtml('calc-level', lHtml); 
    setHtml('calc-location', locHtml);
    setHtml('calc-day', db.dropdowns.days.map(d => `<option value="${d}">${d}</option>`).join(''));
    setHtml('calc-time', db.dropdowns.times.map(t => `<option value="${t}">${t}</option>`).join(''));
    setHtml('tutorSubjectSelect', `<option value="">All Subjects</option>` + db.dropdowns.subjects.map(s => `<option value="${s.toLowerCase()}">${s}</option>`).join(''));
    
    const validTutors = db.tutors.map(getTutorDisplayName).filter(Boolean);
    setHtml('calc-tutor', `<option value="Any">Any Tutor</option>` + validTutors.map(n => `<option value="${n}">${n}</option>`).join(''));
}

function buildGallery() {
    if (!db.gallery?.length) return setHtml('gallery', '<p class="loader-text">No showcases active.</p>');

    const parseDate = (name) => {
        const match = (name || '').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (!match) return { ts: 0, label: '' }; 

        let [_, d, m, y] = match;
        if (y.length === 2) y = '20' + y; 

        const postDate = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0,0,0,0);
        postDate.setHours(0,0,0,0);
        
        const diffDays = Math.floor((today.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let label = match[0];
        if (diffDays <= 0) label = "Today";
        else if (diffDays === 1) label = "Yesterday";
        else if (diffDays < 7) label = `${diffDays} days ago`;
        else if (diffDays < 30) label = `${Math.floor(diffDays / 7)} weeks ago`;
        else if (diffDays < 365) label = `${Math.floor(diffDays / 30)} months ago`;
        else label = `${Math.floor(diffDays / 365)} years ago`;

        return { ts: postDate.getTime(), label };
    };

    const sorted = [...db.gallery].map(post => {
        const name = typeof post === 'object' ? post.name : '';
        const locMatch = (name || '').match(/\[(.*?)\]/);
        return { 
            ...post, 
            ...parseDate(name), 
            location: locMatch ? locMatch[1].trim() : '',
            id: typeof post === 'object' ? post.id : post, 
            rawName: name || '' 
        };
    }).sort((a, b) => a.ts - b.ts); 

    const feedHtml = sorted.map(post => {
        let cleanName = post.rawName.replace(/\.[^/.]+$/, "").replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, "").replace(/\[.*?\]/, "").trim();
        cleanName = cleanName.replace(/^[-–—\s]+|[-–—\s]+$/g, '');

        return `
        <div class="social-post">
            <div class="social-header">
                <div class="social-avatar">@</div>
                <div class="social-meta">
                    <span class="social-username">@family.</span>
                    ${post.location ? `<span class="social-location">${post.location}</span>` : ''}
                </div>
                <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">
                    ${post.label ? `<span class="social-date" style="font-size:12px; color:var(--text-muted);">${post.label}</span>` : ''}
                    <button data-share-url="https://drive.google.com/file/d/${post.id}/view" class="social-share-btn" style="margin-left: 0;">⎘</button>
                </div>
            </div>
            <img class="social-img" src="https://drive.google.com/thumbnail?id=${post.id}&sz=w1200" alt="Gallery Post" loading="lazy">
            ${cleanName ? `<div class="social-footer"><strong>@family.</strong> ${cleanName}</div>` : ''}
        </div>`;
    }).join('');

    setHtml('gallery', `<div class="gallery-wrapper"><div class="social-carousel" id="clean-carousel">${feedHtml}</div></div>`);
    setTimeout(() => { const carousel = $('clean-carousel'); if (carousel) carousel.scrollLeft = carousel.scrollWidth; }, 50);
}

function setupRoster() {
    const revealBtn = $('revealBtn');
    if (!revealBtn) return;

    const render = () => {
        const txt = ($('tutorSearchInput')?.value || '').toLowerCase().trim();
        const subjFilter = ($('tutorSubjectSelect')?.value || '').toLowerCase().trim();

        const html = db.tutors.map(t => {
            const name = getTutorDisplayName(t);
            if (!name) return '';

                       const subs = getTutorSubjects(t);
            const stdQuals = getStandardQuals(t); // Uses our new function
            const extQuals = getExtraQuals(t);    // Uses our new function
            const vid = formatVideoUrl(t['video link'] || t.video);
            const photo = formatPhotoUrl(t.photo);
            
            const matchTxt = [name, t.pitch, t['based in'], t.location].join(' ').toLowerCase().includes(txt);
            const matchSubj = !subjFilter || subs.join(' ').toLowerCase().includes(subjFilter);
            if (!matchTxt || !matchSubj) return '';

                       return `
                <div class="tutor-card">
                    <div class="exp-badge">${t['yrs experience ']?.trim() || t['yrs experience'] || '0'} YRS</div>
                    <div class="portrait"><img src="${photo}" alt="${name}" loading="lazy"></div>
                    <h3 class="tutor-name capitalize">${name}</h3>
                    <div class="distance-badge">📍 ${t['based in']||''} ${t.distance ? '• Travels: '+t.distance+'km' : ''}</div>
                    
                    <div class="slaptag" style="margin-bottom: 15px;">${[1,2,3,4,5].map(i=>t[`adjective ${i}`]).filter(Boolean).join(' • ').toUpperCase()}</div>
                    
                    ${t.pitch ? `
                        <div class="card-section-title">About Me</div>
                        <div class="pitch">"${t.pitch}"</div>
                    ` : ''}

                    ${subs.length ? `
                        <div class="card-section-title">Core Subjects</div>
                        <div class="subjects">${subs.join(' • ').toUpperCase()}</div>
                    ` : ''}

                    ${stdQuals ? `
                        <div class="card-section-title">Qualifications</div>
                        <div class="quals"><ul>${stdQuals}</ul></div>
                    ` : ''}

                    ${extQuals ? `
                        <div class="card-section-title">Extra Qualifications</div>
                        <div class="quals"><ul>${extQuals}</ul></div>
                    ` : ''}

                    ${vid ? `<button data-url="${vid}" data-name="${name}" class="tutor-video-btn" style="margin-top: 15px;">▶ Watch Intro Video</button>` : ''}
                </div>`;
        }).filter(Boolean).join('');

        setHtml('tutorCardsContainer', html || '<p class="loader-text" style="text-align:center;width:100%;">No roster matches.</p>');
    };

    revealBtn.onclick = () => { $('loggedOutView').classList.add('hidden'); $('loggedInView').classList.remove('hidden'); render(); };
    $('tutorSearchInput')?.addEventListener('input', render);
    $('tutorSubjectSelect')?.addEventListener('change', render);
}

function setupCalculator() {
    if (!$('calc-qty')) return;

    const termDates = CONFIG.TERM_ENDS.map(d => new Date(d));
    const weeks = Math.max(1, Math.ceil(((termDates.find(d => d >= new Date()) || termDates.at(-1)) - new Date()) / 604800000));
    
   if($('weeks-left-display')) $('weeks-left-display').innerText = weeks;
    if($('form-weeks')) $('form-weeks').innerText = weeks;
    if($('form-base-rate')) $('form-base-rate').innerText = Number(db.pricing.baseRate).toFixed(2);

    const calc = () => {
        const n = parseFloat($('calc-qty').value) || 1;
        const s = parseFloat($('calc-service').value) || 1;
        const l = parseFloat($('calc-level').value) || 1;
        const loc = parseFloat($('calc-location').value) || 1;
        const disc = Math.max(0.5, 1 - (0.1 * n));
        
        const total = (db.pricing.baseRate * 2 * weeks * s * l * loc * n * disc).toFixed(2);
        if($('grand-total')) $('grand-total').innerText = total;
        
        const getPercStr = val => {
            const diff = Math.round((val - 1) * 100);
            return diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '';
        };

        if($('form-base-rate')) $('form-base-rate').innerText = Number(db.pricing.baseRate).toFixed(2);
        if($('form-service')) $('form-service').innerText = s.toFixed(2);
        if($('form-level')) $('form-level').innerText = l.toFixed(2);
        if($('form-location')) $('form-location').innerText = loc.toFixed(2);
        if($('form-qty')) $('form-qty').innerText = n;
        if($('form-discount')) $('form-discount').innerText = disc.toFixed(2);

        if($('sentence-perc-service')) $('sentence-perc-service').innerText = getPercStr(s);
        if($('sentence-perc-level')) $('sentence-perc-level').innerText = getPercStr(l);
        if($('sentence-perc-location')) $('sentence-perc-location').innerText = getPercStr(loc);
        if($('sentence-perc-discount')) $('sentence-perc-discount').innerText = disc < 1 ? `-${Math.round((1 - disc) * 100)}%` : '';
    };

    ['calc-qty', 'calc-service', 'calc-level', 'calc-location'].forEach(id => $(id)?.addEventListener('input', calc));
    calc();

    $('toggle-receipt')?.addEventListener('click', e => {
        const div = $('receipt-breakdown');
        div.classList.toggle('hidden');
        e.target.innerText = div.classList.contains('hidden') ? 'View live formula ⌄' : 'Hide live formula ⌃';
    });

    $('checkout-btn')?.addEventListener('click', async function() {
        const contact = $('client-contact-input')?.value.trim();
        const clientLocation = $('client-location-input')?.value.trim();
        if (!contact || !clientLocation) return alert("Please enter your contact info and general location!");

        this.innerText = "Loading Secure Checkout...";
        this.disabled = true;
        
        const srv = $('calc-service');
        const lvl = $('calc-level');
        const tut = $('calc-tutor');
        const qty = $('calc-qty').value;
        const total = parseFloat($('grand-total').innerText);

        let finalTutorPay = "TBC"; 
        if (tut.value && tut.value.toLowerCase() !== "any tutor") {
            const selectedTutorObj = db.tutors.find(t => getTutorDisplayName(t) === tut.value);
            if (selectedTutorObj && selectedTutorObj.rate) {
                const tRate = parseFloat(selectedTutorObj.rate);
                const totalHours = 2 * parseInt(weeks) * parseInt(qty); 
                finalTutorPay = (tRate * totalHours).toFixed(2);
            }
        }

        try {
            const r = await fetch(CONFIG.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: "create_checkout",
                    details: `${srv.options[srv.selectedIndex].text} at ${lvl.options[lvl.selectedIndex].text}, ${qty} Sub(s) for ${weeks} wks (Pref: ${tut.value})`,
                    totalPrice: total,
                    tutorPay: finalTutorPay,
                    clientName: $('client-name-input')?.value.trim() || 'Client',
                    clientContact: contact,
                    clientLocation: clientLocation
                })
            });
            const d = await r.json();
            if (d.url) window.location.href = d.url;
            else throw new Error(JSON.stringify(d.error || d));
        } catch (err) {
            alert("Checkout Error: " + err.message);
            this.innerText = "Lock in & Pay";
            this.disabled = false;
        }
    });
}

function setupStaffPortal() {
    const loginBtn = $('staff-login-btn');
    const portal = $('staff-portal');
    const authBtn = $('tutor-auth-btn');
    
    if (!loginBtn || !portal) return;

    const renderJobs = () => {
        const nameInput = ($('tutor-name-input')?.value || '').trim().toLowerCase();
        const pinInput = ($('tutor-pin-input')?.value || '').trim();
        const container = 'jobs-container';
        
        const nameParts = nameInput.split(/\s+/);
        if (nameParts.length < 2 || nameParts[1] === "") return setHtml(container, '<p class="error-text">Verification Fault: Enter first and last name.</p>');

        const tutorRecord = db.tutors?.find(t => (t.combinedfullname || '').trim().toLowerCase() === nameInput);
        if (!tutorRecord) return setHtml(container, '<p class="error-text">Access Denied: Name not found on roster.</p>');

        const correctPin = String(tutorRecord.pin || '').trim();
        if (!correctPin || pinInput !== correctPin) return setHtml(container, '<p class="error-text">Access Denied: Invalid authentication pin.</p>');

        const html = activeJobsList.filter(j => {
            if (!j.status || String(j.status).trim().toLowerCase() !== 'available') return false;
            const det = String(j.details || '').toLowerCase();
            return !(det.includes("(pref:") && !det.includes(`(pref: ${nameParts[0]})`) && !det.includes("(pref: any)"));
        }).map(j => `
            <div id="job-${j.id}" class="job-card">
                <h3 class="gold-text">Job #${j.id}</h3>
                <p><strong>Allocations:</strong> ${j.details}</p>
                <p><strong>Location:</strong> ${j.location}</p>
                <p><strong>Transfer Rate:</strong> £${j.pay}</p>
                <button type="button" data-job-id="${j.id}" class="tutor-booking-btn claim-job-btn">Accept & Lock Allocation</button>
            </div>`).join('');
            
        setHtml(container, html || '<p class="loader-text">Clear Ledger: No assignments pending.</p>');
    };

    loginBtn.onclick = async () => {
        portal.classList.toggle('hidden');
        if (!portal.classList.contains('hidden')) {
            loginBtn.style.color = 'var(--gold)';
            if (!activeJobsList.length) {
                setHtml('jobs-container', "Connecting to secure network stream...");
                try {
                    activeJobsList = await (await fetch(`${CONFIG.API_URL}?get=jobs`)).json();
                    setHtml('jobs-container', "Pipeline initialized. Input credentials above.");
                } catch(err) { setHtml('jobs-container', '<p class="error-text">Database stream failure.</p>'); }
            }
            portal.scrollIntoView({ behavior: 'smooth' });
        } else loginBtn.style.color = '#555';
    };

    if(authBtn) authBtn.onclick = renderJobs;
}

async function claimJob(id, btn) {
    btn.innerText = "Securing..."; 
    btn.disabled = true;
    try {
        const res = await (await fetch(CONFIG.API_URL, { 
            method: 'POST', body: JSON.stringify({ action: "claim_job", jobId: id, tutorName: $('tutor-name-input').value.trim() }) 
        })).json();
        
        if (res.success) {
            setHtml(`job-${id}`, `
                <div class="job-success">
                    <h3 style="margin-top:0;">🎉 Confirmed!</h3>
                    <p>Client: ${res.clientName}<br>Contact: ${res.clientContact}<br>Location: ${res.clientLocation || 'TBC'}</p>
                </div>`);
        } else throw new Error(res.message || "Already claimed."); 
    } catch(err) { 
        alert("Claim Blocked: " + err.message); 
        btn.innerText = "Accept & Lock Allocation"; 
        btn.disabled = false; 
    }
}

// --- SECURE PROFILE EDITOR LOGIC ---

$('tutor-auth-btn')?.addEventListener('click', () => {
    const inputName = $('tutor-name-input').value.trim().toLowerCase();
    const inputPin = $('tutor-pin-input').value.trim();
    
    const loggedInTutor = db.tutors.find(t => t.combinedfullname === inputName && t.pin === inputPin);

    if (loggedInTutor) {
        $('tutor-profile-editor').classList.remove('hidden');
        
        $('edit-photo').value = loggedInTutor['photo'] || '';
        $('edit-video').value = loggedInTutor['video link'] || '';
        $('edit-basedin').value = loggedInTutor['based in'] || '';
        $('edit-distance').value = loggedInTutor['distance'] || '';
        
        $('edit-adj1').value = loggedInTutor['adjective 1'] || '';
        $('edit-adj2').value = loggedInTutor['adjective 2'] || '';
        $('edit-adj3').value = loggedInTutor['adjective 3'] || '';
        $('edit-pitch').value = loggedInTutor['pitch'] || ''; 
        
        $('edit-sub1').value = loggedInTutor['subject 1 taught'] || '';
        $('edit-sub1-lvl').value = loggedInTutor['subject 1 level'] || '';
        $('edit-sub2').value = loggedInTutor['subject 2 taught'] || '';
        $('edit-sub2-lvl').value = loggedInTutor['subject 2 level'] || '';

        $('edit-q1-s').value = loggedInTutor['qual subject 1'] || '';
        $('edit-q1-l').value = loggedInTutor['qual 1 level'] || '';
        $('edit-q1-g').value = loggedInTutor['qual 1 grade'] || '';
        $('edit-q2-s').value = loggedInTutor['qual 2 subject'] || '';
        $('edit-q2-l').value = loggedInTutor['qual 2 level'] || '';
        $('edit-q2-g').value = loggedInTutor['qual 2 grade'] || '';
        $('edit-q3-s').value = loggedInTutor['qual 3 subject'] || '';
        $('edit-q3-l').value = loggedInTutor['qual 3 level'] || '';
        $('edit-q3-g').value = loggedInTutor['qual 3 grade'] || '';

        $('edit-ext1').value = loggedInTutor['extra qual. 1'] || '';
        $('edit-ext2').value = loggedInTutor['extra qual. 2'] || '';
    }
});

$('update-profile-btn')?.addEventListener('click', async function() {
    const btn = this;
    btn.innerText = "Saving changes...";
    btn.disabled = true;
    $('profile-update-status').innerHTML = "";
    
    try {
        const res = await fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "update_profile",
                tutorName: $('tutor-name-input').value.trim(),
                tutorPin: $('tutor-pin-input').value.trim(),
                
                photo: $('edit-photo').value.trim(), video: $('edit-video').value.trim(),
                basedIn: $('edit-basedin').value.trim(), distance: $('edit-distance').value.trim(),
                
                adj1: $('edit-adj1').value.trim(), adj2: $('edit-adj2').value.trim(), adj3: $('edit-adj3').value.trim(),
                pitch: $('edit-pitch').value.trim(),
                
                sub1: $('edit-sub1').value.trim(), sub1lvl: $('edit-sub1-lvl').value.trim(),
                sub2: $('edit-sub2').value.trim(), sub2lvl: $('edit-sub2-lvl').value.trim(),

                q1s: $('edit-q1-s').value.trim(), q1l: $('edit-q1-l').value.trim(), q1g: $('edit-q1-g').value.trim(),
                q2s: $('edit-q2-s').value.trim(), q2l: $('edit-q2-l').value.trim(), q2g: $('edit-q2-g').value.trim(),
                q3s: $('edit-q3-s').value.trim(), q3l: $('edit-q3-l').value.trim(), q3g: $('edit-q3-g').value.trim(),
                
                ext1: $('edit-ext1').value.trim(), ext2: $('edit-ext2').value.trim()
            })
        });
        
        const data = await res.json();
        if (data.success) {
            $('profile-update-status').innerHTML = "<span style='color: var(--success-text);'>Profile updated! Refresh to see changes.</span>";
        } else throw new Error(data.message || "Authentication failed.");
    } catch (err) {
        $('profile-update-status').innerHTML = `<span style='color: var(--error-text);'>Error: ${err.message}</span>`;
    } finally {
        btn.innerText = "Save Profile";
        btn.disabled = false;
    }
});
