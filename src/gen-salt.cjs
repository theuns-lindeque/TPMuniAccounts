const crypto = require('crypto');

function generateSalt(len = 16) {
  return crypto.randomBytes(len).toString('hex');
}

// Note: This is NOT how bcrypt works, but Payload also supports plain crypto hashes if configured,
// however default is bcrypt.
// If I can't use bcrypt easily (dependency issue), I'll try to find a way to let Payload do it.

console.log('Generating salt...');
const salt = generateSalt();
console.log('Salt:', salt);
