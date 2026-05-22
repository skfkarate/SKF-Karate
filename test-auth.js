require('dotenv').config({ path: '.env.local' });
const { authorizeStaffCredentials } = require('./.next/server/app/api/auth/[...nextauth]/route.js') || {};

console.log('Testing auth...', process.env.ADMIN_USERNAME);
