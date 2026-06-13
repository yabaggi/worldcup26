export const store = {
    main: null, teams: null, groups: null, squads: null, stadiums: null, summaries: null, isLoaded: false
};

export async function fetchData() {
    try {
        const files = [
            'worldcup.json', 
            'worldcup.teams.json', 
            'worldcup.groups.json', 
            'worldcup.squads.json', 
            'worldcup.stadiums.json',
            'worldcup.summaries.json'
        ];
        const results = await Promise.all(files.map(f => fetch(f).then(res => res.json())));
        [store.main, store.teams, store.groups, store.squads, store.stadiums, store.summaries] = results;
        
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

export function getMatchSummary(date, team1, team2) {
    return store.summaries.matches.find(s => s.date === date && s.team1 === team1 && s.team2 === team2)?.summary;
}

export function getTeam(name) {
    return store.teams.find(t => t.name === name || t.name_normalised === name) || { flag_icon: '🏳️' };
}

export function getStadium(city) {
    return store.stadiums.stadiums.find(s => s.city === city) || { name: city };
}
