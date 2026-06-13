import { fetchData } from './data.js';
import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchData();
        initRouter();
    } catch (e) {
        document.getElementById('app').innerHTML =
            'Failed to load data.';
    }
});
