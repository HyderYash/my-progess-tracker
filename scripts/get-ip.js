const os = require('os');

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }

    return 'localhost';
}

const ipAddress = getLocalIPAddress();
console.log('\n🌐 Mobile Access Information:');
console.log('=============================');
console.log(`📱 Your computer's IP address: ${ipAddress}`);
console.log(`🔗 Mobile access URL: http://${ipAddress}:3000`);
console.log('\n📋 Instructions:');
console.log('1. Make sure your phone is on the same WiFi network');
console.log('2. Open the URL above in your phone\'s browser');
console.log('3. Follow the installation guide to add to home screen');
console.log('\n💡 Tips:');
console.log('- Use Chrome on Android for best PWA experience');
console.log('- Use Safari on iPhone for best PWA experience');
console.log('- Make sure your firewall allows connections on port 3000');
console.log('\n'); 