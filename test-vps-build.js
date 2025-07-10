#!/usr/bin/env node

/**
 * Test script for VPS build verification
 * Run with: node test-vps-build.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing VPS Build Configuration...\n');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ dist folder not found. Run "npm run build:vps" first.');
  process.exit(1);
}

console.log('✅ dist folder found');

// Check for video files
const videoPath = path.join(distPath, 'videos');
if (!fs.existsSync(videoPath)) {
  console.log('❌ videos folder not found in dist/');
  process.exit(1);
}

console.log('✅ videos folder found');

// Check specific video files
const videoFiles = ['bowa-v1.mp4', 'bowa-v2.mp4'];
let allVideosFound = true;

videoFiles.forEach(filename => {
  const filePath = path.join(videoPath, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ ${filename} found (${fileSizeMB} MB)`);
  } else {
    console.log(`❌ ${filename} not found`);
    allVideosFound = false;
  }
});

// Check index.html for correct video paths
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  if (indexContent.includes('/videos/bowa-v1.mp4') && indexContent.includes('/videos/bowa-v2.mp4')) {
    console.log('✅ Video paths correctly set in index.html');
  } else if (indexContent.includes('/bowa/videos/')) {
    console.log('⚠️  Warning: Found GitHub Pages paths (/bowa/videos/) in index.html');
    console.log('   Make sure you built with: npm run build:vps');
  } else {
    console.log('❓ Could not verify video paths in index.html');
  }
} else {
  console.log('❌ index.html not found');
  allVideosFound = false;
}

// Final result
if (allVideosFound) {
  console.log('\n🎉 VPS build verification passed!');
  console.log('📋 Next steps:');
  console.log('   1. Test locally: npm run preview:vps');
  console.log('   2. Deploy to VPS: git push (triggers deployment)');
  console.log('   3. Check videos load at: https://yourdomain.com');
} else {
  console.log('\n❌ VPS build verification failed!');
  console.log('💡 Try:');
  console.log('   1. Run: npm run build:vps');
  console.log('   2. Run this test again: node test-vps-build.js');
}

console.log(''); 