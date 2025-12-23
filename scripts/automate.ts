#!/usr/bin/env node

/**
 * Main automation script that runs the complete workflow:
 * 1. Check for pending uploads
 * 2. Convert JPG → SVG → DST
 * 3. Notify clients when ready
 * 
 * Run with: npm run automate
 * Or: npx ts-node scripts/automate.ts
 */

import { runWatcher } from './watcher';
import { processPendingUploads } from './convert-dst';
import { notifyReadyClients } from './notify-clients';

function runAutomation() {
  console.log('🚀 Starting automation workflow...\n');
  console.log('=' .repeat(50));
  
  // Step 1: Check for pending uploads
  console.log('\n📋 Step 1: Checking for pending uploads');
  const pending = runWatcher();
  
  if (pending.length === 0) {
    console.log('No pending uploads. Checking for ready files to notify...\n');
    notifyReadyClients();
    return;
  }
  
  // Step 2: Process pending uploads
  console.log('\n🔄 Step 2: Processing pending uploads');
  processPendingUploads();
  
  // Step 3: Notify clients
  console.log('\n📧 Step 3: Notifying clients');
  notifyReadyClients();
  
  console.log('=' .repeat(50));
  console.log('✅ Automation workflow complete!\n');
}

// Run automation
runAutomation();
