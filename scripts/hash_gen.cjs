const crypto = require('crypto');

const password = process.argv[2];
if (!password) {
    console.error('Usage: node hash_gen.cjs <plain_password>');
    process.exit(1);
}

const iterations = 210000;
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');

console.log(`pbkdf2$${iterations}$${salt}$${hash}`);
