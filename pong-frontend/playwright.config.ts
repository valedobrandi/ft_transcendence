export default {
	workers: 8,
	use: {
		baseURL: 'http://localhost:5173', // or whatever your static server port is
        headless: true
	},
    testDir: './playwright/tests',
    outputDir: './playwright/test-results',
};
