import dotenv from 'dotenv';
dotenv.config();

console.log('\n=== Email Configuration Check ===\n');

const checks = {
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASS': process.env.EMAIL_PASS,
  'MONGO_URI': process.env.MONGO_URI ? 'Configured' : 'Not Set',
  'JWT_SECRET': process.env.JWT_SECRET ? 'Configured' : 'Not Set',
  'CLIENT_URL': process.env.CLIENT_URL,
  'NODE_ENV': process.env.NODE_ENV || 'development'
};

for (const [key, value] of Object.entries(checks)) {
  if (key === 'EMAIL_PASS') {
    console.log(`${key}: ${value ? '****' + value.slice(-4) : '❌ Not Set'}`);
  } else if (key === 'MONGO_URI' || key === 'JWT_SECRET') {
    console.log(`${key}: ${value}`);
  } else {
    console.log(`${key}: ${value || '❌ Not Set'}`);
  }
}

console.log('\n=== Configuration Status ===\n');

const allConfigured = process.env.EMAIL_USER && 
                      process.env.EMAIL_PASS && 
                      process.env.MONGO_URI && 
                      process.env.JWT_SECRET;

if (allConfigured) {
  console.log('✅ All required environment variables are configured!');
} else {
  console.log('❌ Some environment variables are missing. Please check your .env file.');
}

console.log('\n');
