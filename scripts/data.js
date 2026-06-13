export const store = {
    main: null, teams: null, groups: null, squads: null, stadiums: null, summaries: null, i18n: null,
    lang: 'en', isLoaded: false
};

export async function fetchData() {
    try {
        const files = [
            'worldcup.json', 
            'worldcup.teams.json', 
            'worldcup.groups.json', 
            'worldcup.squads.json', 
            'worldcup.stadiums.json',
            'worldcup.summaries.json',
            'i18n.json'
        ];
        const results = await Promise.all(files.map(f => fetch(f).then(res => res.json())));
        [store.main, store.teams, store.groups, store.squads, store.stadiums, store.summaries, store.i18n] = results;
        
        // Load preference
        store.lang = localStorage.getItem('wc_lang') || 'en';

        // Sort matches by date and time
        store.main.matches.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        store.isLoaded = true;
        return store;
    } catch (error) {
        console.error('Data error:', error);
        throw error;
    }
}

export function t(key) {
    const keys = key.split('.');
    let value = store.i18n[store.lang];
    for (const k of keys) {
        value = value?.[k];
    }
    return value || key;
}

export function td(str) {
    if (store.lang === 'en') return str;
    return store.i18n.data_translations[str] || str;
}

export function setLanguage(lang) {
    store.lang = lang;
    localStorage.setItem('wc_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.location.reload();
}

export function getMatchSummary(date, team1, team2) {
    return store.summaries.matches.find(s => s.date === date && s.team1 === team1 && s.team2 === team2)?.summary;
}

export function getTeam(name) {
    return store.teams.find(t => t.name === name || t.name_normalised === name) || { flag_icon: '🏳️' };
}

export function getStadium(city) {
    return store.stadiums.stadiums.find(s => s.city === city) || { name: city };
}

export function formatLocalTime(dateStr, timeStr) {
    // timeStr format: "13:00 UTC-6"
    const [time, utcOffset] = timeStr.split(' ');
    const offset = utcOffset.replace('UTC', ''); // "-6"
    
    // Construct ISO string: "2026-06-11T13:00:00-06:00"
    // Ensure offset is in ±HH:mm format
    const formattedOffset = offset.includes(':') ? offset : 
        (offset.startsWith('-') || offset.startsWith('+') ? 
            offset.slice(0, 1) + offset.slice(1).padStart(2, '0') + ':00' : 
            '+' + offset.padStart(2, '0') + ':00');

    const isoString = `${dateStr}T${time}:00${formattedOffset}`;
    const date = new Date(isoString);

    if (isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    }).format(date);
}
