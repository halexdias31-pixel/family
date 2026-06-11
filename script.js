/*************************************************
 * 1. CENTRAL CONFIGURATION
 *************************************************/
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbxzEqryOdmFGUWp_vUmTw3qr5VzIxZ33nFlgmsLFuOobpo9oU8b7FiGPUnLuV6XcjXH/exec',
    LINKS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRs8Ru1DTBOYThOFKyrk3Ys15ixhQ3KfrSyKQzmcpHnBV0_oDODVk7ljrVwOCdp34IhlWRJxllQcwxd/pub?gid=69062415&single=true&output=csv',
    TERM_ENDS: ['2026-07-22', '2026-12-18', '2027-04-02'],
    SOCIAL_LINK: 'https://instagram.com' // Set your actual link here
};

/*************************************************
 * 2. GLOBAL STATE & HELPERS
 *************************************************/
let db = { tutors: [], dropdowns: { subjects: [], days: [], times: [] }, pricing: { baseRate: 2, multipliers: {} }, gallery: [] };
let activeJobsList = [];

const $ = id => document.getElementById(id);
const setHtml = (id, html) => $(id) && ($(id).innerHTML = html);

/*************************************************
 * 3. INITIALIZATION
 *************************************************/
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch Link Library
    try {
        const csv = await (await fetch(CONFIG.LINKS_CSV_URL)).text();
        setHtml('link-library', csv.trim().split('\n').map(row => {
            const [t, u] = row.split(',');
            return t && u ? `<a class="book" href="${u.trim()}" target="_blank"><span>${t.trim()}</span></a>` : '';
        }).join(''));
    } catch (e) { console.error("Link library error", e); }

    // Fetch Database
    try {
        const data = await (await fetch(CONFIG.API_URL)).json();
        if (data.error) throw data.error;
        db = data;
        
        buildDropdowns();
        buildGallery();
        setupRoster();
        setupCalculator();
        setupStaffPortal();
    } catch (e) { console.error("Database error", e); }
});

/*************************************************
 * 4. GLOBAL EVENT DELEGATION (AI-PROOF)
 *************************************************/
document.addEventListener('click', async (e) => {
    // Handle Video Modal Opening
    if (e.target.closest('.tutor-video-btn')) {
        const btn = e.target.closest('.tutor-video-btn');
        openVideoModal(btn.dataset.url, btn.dataset.name);
    }
    // Handle Native Image Sharing
    else if (e.target.closest('.social-share-btn')) {
        const btn = e.target.closest('.social-share-btn');
        const url = btn.dataset.shareUrl;
        try {
            if (navigator.share) await navigator.share({ title: '@family. Gallery', url: url });
            else { await navigator.clipboard.writeText(url); alert("Image link copied to clipboard!"); }
        } catch(err) { console.log('Share canceled or failed'); }
    }
    // Handle Closing Modals
    else if (e.target.closest('.close-modal-btn')) {
        const modal = document.getElementById('vMod');
        if (modal) modal.remove();
    }
    // Handle Claiming Jobs
    else if (e.target.closest('.claim-job-btn')) {
        const btn = e.target.closest('.claim-job-btn');
        claimJob(btn.dataset.jobId, btn);
    }
});

/*************************************************
 * 5. CORE FUNCTIONS
 *************************************************/
function buildDropdowns() {
    let sHtml = '', lHtml = '', locHtml = '';
    
    Object.entries(db.pricing?.multipliers || {}).forEach(([k, item]) => {
        const val = typeof item === 'object' ? (item.multiplier ?? 1) : parseFloat(item);
        const desc = item.description ? ` (${item.description.trim()})` : '';
        let label = k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + desc;
        
        const opt = `<option value="${val}">${label}</option>`;
        if (k.match(/club|tuition|service|walking/i)) sHtml += opt;
        else if (k.match(/level|gcse|sats|11\+/i)) lHtml += `<option value="${val}">${label.replace(/Gcse\/sats/i, 'GCSE/SATs')}</option>`;
        else if (k.match(/online|travel|person/i)) locHtml += `<option value="${val}">${label.replace(/In person/i, 'In-Person')}</option>`;
    });

    setHtml('calc-service', sHtml); setHtml('calc-level', lHtml); setHtml('calc-location', locHtml);
    setHtml('tutorSubjectSelect', `<option value="">All Subjects</option>` + db.dropdowns.subjects.map(s => `<option value="${s.toLowerCase()}">${s}</option>`).join(''));
    setHtml('calc-day', db.dropdowns.days.map(d => `<option value="${d}">${d}</option>`).join(''));
    setHtml('calc-time', db.dropdowns.times.map(t => `<option value="${t}">${t}</option>`).join(''));
    setHtml('calc-tutor', `<option value="Any">Any Tutor</option>` + db.tutors.filter(t=>t.name).map(t => `<option value="${t.name}">${t.name}</option>`).join(''));
}

function buildGallery() {
    if (!db.gallery?.length) return setHtml('gallery', '<p style="color:#ccc;">No showcases active.</p>');

    const timeTags = ["Just now", "4 hours ago", "Yesterday", "3 days ago", "1 week ago", "2 weeks ago"];
    const posts = [...db.gallery].reverse();

    setHtml('gallery', `<div class="social-carousel">` + posts.map((post, i) => {
        // Handle both old ID-only format, and new {id, name} format from Apps Script
        const id = typeof post === 'object' ? post.id : post;
        let rawName = typeof post === 'object' && post.name ? post.name : '';
        
        // Remove file extensions (.jpg, .png, etc.) from the display name
        const cleanName = rawName.replace(/\.[^/.]+$/, "");

        return `
        <div class="social-post">
            <div class="social-header">
                <div class="social-avatar">@</div>
                <div class="social-meta">
                    <span class="social-username">
                        @family.
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1da1f2" style="vertical-align: -2px; margin-left: 2px;">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </span>
                    <span class="social-date">${timeTags[i] || (i + 1) + " weeks ago"}</span>
                </div>
                <button data-share-url="https://drive.google.com/file/d/${id}/view" class="social-share-btn" title="Share this image">⎘</button>
            </div>
            <img class="social-img" src="https://drive.google.com/thumbnail?id=${id}&sz=w1200" alt="Gallery Post" loading="lazy">
            
            ${cleanName ? `
            <div class="social-footer">
                <div class="social-caption"><strong>@family.</strong> ${cleanName}</div>
            </div>` : ''}
            
        </div>`;
    }).join('') + `</div>`);
        
    setTimeout(() => { const el = document.querySelector('.social-carousel'); if(el) el.scrollLeft = el.scrollWidth; }, 100);
}

function setupRoster() {
    if (!$('revealBtn')) return;
    const render = () => {
        const txt = ($('tutorSearchInput')?.value || '').toLowerCase().trim();
        const subj = ($('tutorSubjectSelect')?.value || '').toLowerCase().trim();

        setHtml('tutorCardsContainer', db.tutors.filter(t => t.name).map(t => {
            const subs = [1,2,3,4,5].map(i => t[`subject ${i} taught`] ? `${t[`subject ${i} taught`]}<sup>${t[`subject ${i} level`]||''}</sup>` : '').filter(Boolean);
            const quals = [1,2,3,4,5].map(i => {
                const s = t[`qual subject ${i}`] || t[`qual ${i} subject`];
                const e = t[`extra qual. ${i}`] || t[`extra qual ${i}`];
                return (s ? `<li>${t[`qual ${i} level`]||''} ${s} (${t[`qual ${i} grade`]||''})</li>` : '') + (e ? `<li>${e}</li>` : '');
            }).join('');
            
            const matchTxt = [t.name, t.pitch, t['based in'], t.location].join(' ').toLowerCase().includes(txt);
            const matchSubj = !subj || subs.join(' ').toLowerCase().includes(subj);
            if (!matchTxt || !matchSubj) return '';

            let vid = t['video link'] || t.video || '';
            vid = vid.includes('drive.google') ? `https://drive.google.com/file/d/${vid.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]}/preview` : vid.replace('watch?v=', 'embed/');
            const photo = t.photo ? `https://drive.google.com/thumbnail?id=${t.photo.match(/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/)?.[1] || t.photo.match(/id=([a-zA-Z0-9_-]+)/)?.[2]}&sz=w800` : '';

            return `
                <div class="tutor-card">
                    <div class="exp-badge">${t['yrs experience ']?.trim() || t['yrs experience'] || '0'} YRS</div>
                    <div class="portrait"><img src="${photo}" alt="${t.name}" loading="lazy"></div>
                    <h3 class="tutor-name">${t.name}</h3>
                    <div class="distance-badge">📍 ${t['based in']||t.location||''} ${t.distance ? '• Travels: '+t.distance+'km' : ''}</div>
                    <div class="subjects">${subs.join(' • ').toUpperCase()}</div>
                    <div class="slaptag">${[1,2,3,4,5].map(i=>t[`adjective ${i}`]).filter(Boolean).join(' • ').toUpperCase()}</div>
                    <div class="pitch">"${t.pitch||''}"</div>
                    <div class="quals"><ul>${quals}</ul></div>
                    ${vid ? `<button data-url="${vid}" data-name="${t.name}" class="tutor-video-btn">▶ Watch Intro Video</button>` : ''}
                </div>`;
        }).join(''));
    };

    $('revealBtn').onclick = () => { $('loggedOutView').style.display='none'; $('loggedInView').style.display='block'; render(); };
    $('tutorSearchInput')?.addEventListener('input', render);
    $('tutorSubjectSelect')?.addEventListener('change', render);
}

function openVideoModal(url, name) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="vMod" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:99999;">
            <div style="background:var(--panel);padding:20px;border-radius:12px;width:90%;max-width:600px;position:relative;border:1px solid var(--border);">
                <button class="close-modal-btn" style="position:absolute;top:10px;right:15px;background:none;border:none;color:var(--text);font-size:24px;cursor:pointer;">×</button>
                <h3 style="margin-top:0;color:var(--gold);margin-bottom:15px;">${name}'s Intro</h3>
                <iframe src="${url}" style="width:100%;height:350px;border:none;" allow="autoplay"></iframe>
            </div>
        </div>`);
}

function setupCalculator() {
    if (!$('calc-qty')) return;
    const update = (id, val) => $(id) && ($(id).innerText = val);
    
    const setBadge = (id, val) => {
        if (!$(id)) return;
        const diff = Math.round((val - 1) * 100);
        $(id).innerText = diff !== 0 ? (diff > 0 ? '+' : '') + diff + '%' : '';
        $(id).style.opacity = diff !== 0 ? '1' : '0';
    };

    const termDates = CONFIG.TERM_ENDS.map(d => new Date(d));
    const weeks = Math.max(1, Math.ceil(((termDates.find(d => d >= new Date()) || termDates.at(-1)) - new Date()) / 604800000));
    update('weeks-left-display', weeks); update('form-weeks', weeks); update('form-base-rate', db.pricing.baseRate);

    const calc = () => {
        const [n, s, l, loc] = ['calc-qty', 'calc-service', 'calc-level', 'calc-location'].map(id => parseFloat($(id).value) || 1);
        const disc = Math.max(0.5, 1 - (0.1 * n));
        
        update('grand-total', (db.pricing.baseRate * 2 * weeks * s * l * loc * n * disc).toFixed(2));
        
        setBadge('service-badge', s); setBadge('level-badge', l); setBadge('location-badge', loc); setBadge('discount-badge', disc);
        
        ['service','level','location','qty'].forEach((id, i) => update(`form-${id}`, [s, l, loc, n][i].toFixed(i<3?2:0)));
        update('form-discount', disc.toFixed(2)); update('form-total', $('grand-total').innerText);
    };

    ['calc-qty', 'calc-service', 'calc-level', 'calc-location'].forEach(id => $(id)?.addEventListener('input', calc));
    calc();

    $('toggle-receipt')?.addEventListener('click', e => {
        const div = $('receipt-breakdown');
        const show = div.style.display === 'none';
        div.style.display = show ? 'block' : 'none';
        e.target.innerText = show ? 'Hide live formula ⌃' : 'View live formula ⌄';
    });

    $('checkout-btn')?.addEventListener('click', function() {
        const clientName = $('client-name-input')?.value.trim() || 'Client';
        const clientContact = $('client-contact-input')?.value.trim();
        
        if (!clientContact) return alert("Please enter a phone number or email so the tutor can reach you!");

        this.innerText = "Loading Secure Checkout...";
        
        fetch(CONFIG.API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "create_checkout",
                details: `${$('calc-service').options[$('calc-service').selectedIndex].text} at ${$('calc-level').options[$('calc-level').selectedIndex].text}, ${$('calc-qty').value} Sub(s) for ${weeks} wks (Pref: ${$('calc-tutor').value})`,
                totalPrice: parseFloat($('grand-total').innerText),
                tutorPay: (parseFloat($('grand-total').innerText) * 0.70).toFixed(2),
                clientName: clientName,
                clientContact: clientContact
            })
        }).then(r=>r.json()).then(d => {
            if (d.url) window.location.href = d.url;
            else alert("Stripe Error: " + JSON.stringify(d.error || d));
            this.innerText = "Lock in & Pay";
        }).catch(() => { alert("Network Error"); this.innerText = "Lock in & Pay"; });
    });
}

function setupStaffPortal() {
    if (!$('staff-login-btn')) return;

    const renderJobs = () => {
        const name = ($('tutor-name-input').value || '').trim().toLowerCase();
        if (!name) return setHtml('jobs-container', '<p style="color:#888;">Enter name to unlock listings.</p>');
        
        const html = activeJobsList.filter(j => {
            if (String(j.status).trim().toLowerCase() !== 'available') return false;
            const det = String(j.details).toLowerCase();
            return !(det.includes("(pref:") && !det.includes(`(pref: ${name})`) && !det.includes("(pref: any)"));
        }).map(j => `
            <div id="job-${j.id}" style="border:1px solid var(--gold);padding:15px;margin-bottom:15px;border-radius:8px;background:var(--panel);">
                <h3 style="color:var(--gold);margin-top:0;">Job #${j.id}</h3>
                <p><strong>Details:</strong> ${j.details}</p><p><strong>Pay:</strong> ${j.pay}</p>
                <button type="button" data-job-id="${j.id}" class="tutor-booking-btn claim-job-btn">Accept & Lock Job</button>
            </div>`).join('');
            
        setHtml('jobs-container', html || '<p style="color:#ccc;">No requests currently pending for you.</p>');
    };

    $('staff-login-btn').onclick = async (e) => {
        e.preventDefault();
        const p = $('staff-portal');
        if (p.style.display === 'none') {
            p.style.display = 'block'; e.target.style.color = 'var(--gold)';
            if (!activeJobsList.length) {
                setHtml('jobs-container', "Connecting to database...");
                activeJobsList = await (await fetch(`${CONFIG.API_URL}?get=jobs`)).json();
            }
            renderJobs(); p.scrollIntoView({ behavior: 'smooth' });
        } else { p.style.display = 'none'; e.target.style.color = '#555'; }
    };

    $('tutor-name-input')?.addEventListener('input', renderJobs);
}

async function claimJob(id, btn) {
    btn.innerText = "Securing..."; btn.disabled = true;
    try {
        const res = await (await fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify({ action: "claim_job", jobId: id, tutorName: $('tutor-name-input').value.trim() }) })).json();
        if (res.success) {
            setHtml(`job-${id}`, `<div style="background:#155724;color:#d4edda;border:1px solid #c3e6cb;padding:15px;border-radius:6px;"><h3>🎉 Confirmed!</h3><p>Client: ${res.clientName}<br>Contact: ${res.clientContact}</p></div>`);
        } else { 
            alert("Claim Blocked: " + (res.message || "Already claimed.")); 
            btn.innerText = "Accept & Lock Job"; btn.disabled = false;
        }
    } catch(err) { alert("Communication Error."); btn.innerText = "Accept & Lock Job"; btn.disabled = false; }
}