import { store, getTeam, getStadium, getMatchSummary } from './data.js';

const routes = {
    '/': () => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const todayMatches = store.main.matches.filter(m => m.date === today);
        const upcomingMatches = store.main.matches.filter(m => m.date >= today).slice(0, 4);
        
        const displayMatches = todayMatches.length > 0 ? todayMatches : upcomingMatches;
        const title = todayMatches.length > 0 ? "Today's Matches" : "Next Matches";

        return `
            <div class="hero">
                <h2>World Cup 2026</h2>
                <p>48 Teams. 16 Cities. 104 Matches.</p>
            </div>
            <h3>${title}</h3>
            <div class="match-list">
                ${displayMatches.map(renderMatchCard).join('')}
            </div>
        `;
    },
    '/schedule': () => {
        // Group matches by round/date
        const groups = store.main.matches.reduce((acc, m) => {
            const key = m.round;
            if (!acc[key]) acc[key] = [];
            acc[key].push(m);
            return acc;
        }, {});

        return `<h2>Schedule</h2>` + Object.entries(groups).map(([round, matches]) => `
            <div class="round-section">
                <h3 class="round-title">${round}</h3>
                <div class="match-list">${matches.map(renderMatchCard).join('')}</div>
            </div>
        `).join('');
    },
    '/groups': () => {
        return `<h2>Groups & Standings</h2>` + store.groups.groups.map(renderGroupTable).join('');
    },
    '/teams': () => `
        <h2>Teams</h2>
        <div class="team-grid">
            ${store.teams.map(t => `
                <div class="team-card">
                    <span class="flag">${t.flag_icon}</span>
                    <span class="name">${t.name}</span>
                    <span class="code">${t.fifa_code}</span>
                </div>
            `).join('')}
        </div>
    `,
    '/stadiums': () => `
        <h2>Venues</h2>
        <div class="stadium-list">
            ${store.stadiums.stadiums.map(s => `
                <div class="card stadium-card">
                    <h4>${s.name}</h4>
                    <p>📍 ${s.city}, ${s.cc.toUpperCase()}</p>
                    <p>👥 Capacity: ${s.capacity.toLocaleString()}</p>
                </div>
            `).join('')}
        </div>
    `
};

function renderMatchCard(m) {
    const t1 = getTeam(m.team1);
    const t2 = getTeam(m.team2);
    const stadium = getStadium(m.ground);
    const hasScore = !!m.score;
    const score = hasScore ? `${m.score.ft[0]} - ${m.score.ft[1]}` : 'vs';
    const summary = hasScore ? getMatchSummary(m.date, m.team1, m.team2) : null;

    const goals1 = (m.goals1 || []).map(g => `<li>${g.name} (${g.minute}')</li>`).join('');
    const goals2 = (m.goals2 || []).map(g => `<li>${g.name} (${g.minute}')</li>`).join('');

    return `
        <div class="card match-card ${hasScore ? 'finished' : ''}" data-match-id="${m.date}-${m.team1}-${m.team2}">
            <div class="match-meta">
                <span>${m.date} | ${m.time}</span>
                <span>${stadium.name}</span>
            </div>
            <div class="match-teams">
                <div class="team">
                    <span class="flag">${t1.flag_icon}</span>
                    <span class="name">${m.team1}</span>
                </div>
                <div class="score">${score}</div>
                <div class="team">
                    <span class="name">${m.team2}</span>
                    <span class="flag">${t2.flag_icon}</span>
                </div>
            </div>
            ${hasScore ? `
            <div class="match-details" style="display: none;">
                <div class="goals-section">
                    <ul class="goals-list">${goals1}</ul>
                    <ul class="goals-list">${goals2}</ul>
                </div>
                ${summary ? `<div class="match-summary">${summary}</div>` : ''}
            </div>
            ` : ''}
        </div>
    `;
}

function renderGroupTable(group) {
    // Basic Standing calculation logic
    const stats = group.teams.map(teamName => {
        const teamMatches = store.main.matches.filter(m => 
            (m.team1 === teamName || m.team2 === teamName) && m.score
        );
        
        let gp=0, w=0, d=0, l=0, gf=0, ga=0, pts=0;
        
        teamMatches.forEach(m => {
            gp++;
            const isTeam1 = m.team1 === teamName;
            const score = isTeam1 ? m.score.ft : [m.score.ft[1], m.score.ft[0]];
            gf += score[0];
            ga += score[1];
            if (score[0] > score[1]) { w++; pts += 3; }
            else if (score[0] === score[1]) { d++; pts += 1; }
            else { l++; }
        });

        return { name: teamName, flag: getTeam(teamName).flag_icon, gp, w, d, l, gf, ga, gd: gf-ga, pts };
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd);

    return `
        <div class="card group-card">
            <h4>${group.name}</h4>
            <table class="standings">
                <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr></thead>
                <tbody>
                    ${stats.map(s => `
                        <tr>
                            <td class="team-cell">${s.flag} ${s.name}</td>
                            <td>${s.gp}</td><td>${s.w}</td><td>${s.d}</td><td>${s.l}</td>
                            <td>${s.gd > 0 ? '+' : ''}${s.gd}</td>
                            <td><strong>${s.pts}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function initRouter() {
    const handleRoute = () => {
        const hash = window.location.hash.slice(1) || '/';
        const viewFunc = routes[hash] || routes['/'];
        document.getElementById('app').innerHTML = viewFunc();
        window.scrollTo(0, 0);
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.toggle('active', (nav.getAttribute('href').slice(1) || '/') === hash);
        });
    };

    // Event delegation for match card clicks
    document.getElementById('app').addEventListener('click', (e) => {
        const card = e.target.closest('.match-card.finished');
        if (card) {
            const details = card.querySelector('.match-details');
            if (details) {
                const isExpanded = details.style.display === 'block';
                details.style.display = isExpanded ? 'none' : 'block';
                card.classList.toggle('expanded', !isExpanded);
            }
        }
    });

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
