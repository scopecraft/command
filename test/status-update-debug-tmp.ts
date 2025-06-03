#!/usr/bin/env bun

import { getStatusName, getStatusLabel } from '../src/core/metadata/schema-service.js';
import { normalizeStatus } from '../src/mcp/transformers.js';

async function testStatusTransformation() {
  console.log('Testing status transformation...');
  
  try {
    console.log('getStatusName("done"):', getStatusName("done"));
    console.log('getStatusLabel("done"):', getStatusLabel("done"));
    console.log('normalizeStatus("done"):', normalizeStatus("done"));
    
    console.log('getStatusName("Done"):', getStatusName("Done"));
    console.log('getStatusLabel("todo"):', getStatusLabel("todo"));
    console.log('normalizeStatus("todo"):', normalizeStatus("todo"));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testStatusTransformation();