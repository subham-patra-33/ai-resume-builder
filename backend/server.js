// Entry point: start the Express app and connect to the database
require('dotenv').config();
const path = require('path');
const { connectDB } = require('./src/config/db');

const app = require(path.join(__dirname, 'src', 'app'));

const PORT = process.env.PORT || 4000;

async function start() {
	// Build the frontend before launching the backend in production mode
	if (process.env.NODE_ENV !== 'development') {
		console.log('📦 Building frontend before starting backend...');
		const { execSync } = require('child_process');
		execSync('npm run build:frontend', { cwd: __dirname, stdio: 'inherit' });
	}

	// Connect to MongoDB using centralized connection module
	await connectDB();

	app.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}

start();
