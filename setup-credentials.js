#!/usr/bin/env node

/**
 * Helper script to validate and set up Google Cloud credentials
 * 
 * This script:
 * 1. Checks if the Google Cloud credentials file exists and is valid
 * 2. Creates a default credentials file if needed
 * 3. Updates the .env.local file with the correct path
 * 
 * Usage: node setup-credentials.js [path/to/credentials.json]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Default paths
const defaultCredentialsPath = path.join(process.cwd(), 'google-credentials.json');
const envFilePath = path.join(process.cwd(), '.env.local');

// Get credentials path from command line argument, or use default
const providedPath = process.argv[2];
const credentialsPath = providedPath || defaultCredentialsPath;

console.log(`${colors.bright}Google Cloud Credentials Setup${colors.reset}\n`);

// Function to check if a file is valid JSON
function isValidJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    return false;
  }
}

// Function to create a sample credentials file
function createSampleCredentials(filePath) {
  console.log(`${colors.yellow}Creating a sample credentials file at: ${filePath}${colors.reset}`);
  
  const sampleCredentials = {
    "type": "service_account",
    "project_id": "your-project-id",
    "private_key_id": "your-private-key-id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n",
    "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
    "client_id": "your-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token", 
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };
  
  fs.writeFileSync(filePath, JSON.stringify(sampleCredentials, null, 2));
  console.log(`${colors.green}✓ Created sample credentials file${colors.reset}`);
  console.log(`${colors.yellow}⚠️ Note: This is a TEMPLATE file. You need to replace the values with your actual Google Cloud credentials.${colors.reset}\n`);
}

// Function to update the .env.local file
function updateEnvFile(credentialsPath) {
  try {
    let envContent = '';
    
    // Check if .env.local exists and read it
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Replace existing GOOGLE_APPLICATION_CREDENTIALS line if it exists
      if (envContent.includes('GOOGLE_APPLICATION_CREDENTIALS=')) {
        envContent = envContent.replace(
          /GOOGLE_APPLICATION_CREDENTIALS=.*/g, 
          `GOOGLE_APPLICATION_CREDENTIALS="${credentialsPath.replace(/\\/g, '\\\\')}"` // Escape backslashes for Windows paths
        );
      } else {
        // Add to the end if it doesn't exist
        envContent += `\nGOOGLE_APPLICATION_CREDENTIALS="${credentialsPath.replace(/\\/g, '\\\\')}"\n`;
      }
    } else {
      // Create new .env.local file
      envContent = `GOOGLE_APPLICATION_CREDENTIALS="${credentialsPath.replace(/\\/g, '\\\\')}"\n`;
    }
    
    // Write to the file
    fs.writeFileSync(envFilePath, envContent);
    console.log(`${colors.green}✓ Updated .env.local with credentials path${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error updating .env.local file: ${error.message}${colors.reset}`);
  }
}

// Main process
console.log(`${colors.cyan}Checking for Google Cloud credentials...${colors.reset}`);

if (isValidJson(credentialsPath)) {
  console.log(`${colors.green}✓ Found valid credentials file at: ${credentialsPath}${colors.reset}`);
  updateEnvFile(credentialsPath);
} else {
  console.log(`${colors.yellow}⚠️ No valid credentials file found at: ${credentialsPath}${colors.reset}`);
  
  if (!providedPath) {
    createSampleCredentials(defaultCredentialsPath);
    updateEnvFile(defaultCredentialsPath);
  } else {
    console.log(`${colors.red}Error: The provided path does not contain a valid JSON file.${colors.reset}`);
    process.exit(1);
  }
}

// Instructions for getting actual credentials
console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
console.log(`${colors.cyan}1. Create a Google Cloud project if you haven't already:${colors.reset}`);
console.log(`   https://console.cloud.google.com/projectcreate`);
console.log(`${colors.cyan}2. Enable the Speech-to-Text API:${colors.reset}`);
console.log(`   https://console.cloud.google.com/apis/library/speech.googleapis.com`);
console.log(`${colors.cyan}3. Create a Service Account and download the credentials:${colors.reset}`);
console.log(`   https://console.cloud.google.com/apis/credentials`);
console.log(`${colors.cyan}4. Replace the sample credentials with your downloaded JSON file.${colors.reset}`);
console.log(`${colors.cyan}5. Restart your Next.js application.${colors.reset}\n`);

console.log(`${colors.bright}For development testing, you can run with mock responses:${colors.reset}`);
console.log(`The app will use mock transcriptions when valid credentials aren't available.\n`); 