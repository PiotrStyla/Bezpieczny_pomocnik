/**
 * 🧪 TEST ENHANCED SECURITY SYSTEM
 * Temporary test script to verify AES-256 encryption works
 */

// Wait for Enhanced Security to load
setTimeout(async () => {
    console.log('🧪 Testing Enhanced Security System...');
    
    if (!window.EnhancedSecurityZK) {
        console.error('❌ Enhanced Security not loaded!');
        return;
    }
    
    try {
        // Test 1: Basic encryption/decryption
        console.log('🔒 Test 1: Basic encryption/decryption');
        const testData = {
            childAge: 7,
            parentMessage: 'Cześć kotku, jesteś bezpieczny!',
            timestamp: Date.now()
        };
        
        const saved = await window.EnhancedSecurityZK.saveSecureZK('test_data', testData);
        console.log('Save result:', saved);
        
        const loaded = await window.EnhancedSecurityZK.loadSecureZK('test_data');
        console.log('Load result:', loaded);
        
        if (JSON.stringify(testData) === JSON.stringify(loaded)) {
            console.log('✅ Test 1 PASSED: Data encryption/decryption works');
        } else {
            console.log('❌ Test 1 FAILED: Data mismatch');
        }
        
        // Test 2: Storage info
        console.log('🔒 Test 2: Storage information');
        const info = await window.EnhancedSecurityZK.getStorageInfo();
        console.log('📊 Storage info:', info);
        
        // Test 3: Compatibility wrappers
        console.log('🔒 Test 3: Compatibility wrappers');
        const compatSaved = await window.saveToMinaZK('compat_test', { message: 'Compatibility test' });
        const compatLoaded = await window.loadFromMinaZK('compat_test');
        console.log('Compatibility test:', { saved: compatSaved, loaded: compatLoaded });
        
        // Test 4: Cleanup
        console.log('🔒 Test 4: Cleanup');
        await window.EnhancedSecurityZK.deleteSecureZK('test_data');
        await window.EnhancedSecurityZK.deleteSecureZK('compat_test');
        
        console.log('🎉 ALL TESTS COMPLETED');
        console.log('📊 Final storage info:');
        console.log(await window.EnhancedSecurityZK.getStorageInfo());
        
    } catch (error) {
        console.error('❌ Enhanced Security test failed:', error);
    }
}, 3000);

console.log('🧪 Enhanced Security test script loaded');
console.log('⏰ Tests will run in 3 seconds...');
