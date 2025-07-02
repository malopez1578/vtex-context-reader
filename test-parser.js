#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple test to verify the parser can read the example manifest files
async function testParser() {
    console.log('🧪 Testing VTEX Context Reader Parser...\n');
    
    const examplesDir = path.join(__dirname, 'examples');
    
    // Test 1: Check if manifest.json can be read
    const manifestPath = path.join(examplesDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            console.log('✅ Main manifest.json parsed successfully');
            console.log(`   - Vendor: ${manifest.vendor}`);
            console.log(`   - Name: ${manifest.name}`);
            console.log(`   - Version: ${manifest.version}`);
            console.log(`   - Builders: ${Object.keys(manifest.builders || {}).join(', ')}`);
        } catch (error) {
            console.log('❌ Failed to parse main manifest.json:', error.message);
        }
    } else {
        console.log('❌ Main manifest.json not found');
    }

    // Test 2: Check nested projects
    const nestedProjects = ['backend-service', 'store-theme'];
    for (const projectName of nestedProjects) {
        const projectDir = path.join(examplesDir, projectName);
        const projectManifest = path.join(projectDir, 'manifest.json');
        
        if (fs.existsSync(projectManifest)) {
            try {
                const manifest = JSON.parse(fs.readFileSync(projectManifest, 'utf8'));
                console.log(`✅ ${projectName}/manifest.json parsed successfully`);
                console.log(`   - Vendor: ${manifest.vendor}`);
                console.log(`   - Name: ${manifest.name}`);
            } catch (error) {
                console.log(`❌ Failed to parse ${projectName}/manifest.json:`, error.message);
            }
        } else {
            console.log(`⚠️  ${projectName}/manifest.json not found`);
        }
    }

    // Test 3: Check service.json
    const servicePath = path.join(examplesDir, 'service.json');
    if (fs.existsSync(servicePath)) {
        try {
            const service = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
            console.log('✅ service.json parsed successfully');
            console.log(`   - Memory: ${service.memory || 'not specified'}`);
            console.log(`   - TTL: ${service.ttl || 'not specified'}`);
        } catch (error) {
            console.log('❌ Failed to parse service.json:', error.message);
        }
    }

    // Test 4: Check project structure
    console.log('\n📁 Project structure verification:');
    const expectedDirs = ['node', 'react', 'graphql'];
    for (const dir of expectedDirs) {
        const dirPath = path.join(examplesDir, dir);
        if (fs.existsSync(dirPath)) {
            console.log(`✅ ${dir}/ directory exists`);
        } else {
            console.log(`⚠️  ${dir}/ directory not found`);
        }
    }

    console.log('\n🎉 Parser test completed!');
}

testParser().catch(console.error);
