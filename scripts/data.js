export const store = {
    main: null, teams: null, groups: null, squads: null, stadiums: null, isLoaded: false
};

export async function fetchData() {
    try {
        const files = [
'worldcup.json', 'worldcup.teams.json', 'worldcup.groups.json', 'worldcup.squads.json', 'worldcup.stadiums.json'];
        const results = await Promise.all(files.map(f => fetch(f).then(res => res.json())));
        [store.main, store.teams, store.groups, store.squads, store.stadiums] = results;
        store.isLoaded = true;
        return store;
    } catch (error) {
        console.error('Data error:', error);
        throw error;
    }
}

export function getTeam(name) {
    return store.teams.find(t => t.name === name || t.name_normalised === name) || { flag_icon: '🏳️' };
}

export function getStadium(city) {
    return store.stadiums.stadiums.find(s => s.city === city) || { name: city };
}
