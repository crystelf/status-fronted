const fs = require('fs');
const path = require('path');

/**
 * Load configuration from config.json if it exists
 */
function loadConfig() {
  const configPath = path.join(process.cwd(), 'config.json');
  let apiUrl = 'http://localhost:7788'; // Default API URL

  if (fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      if (config.apiUrl) {
        apiUrl = config.apiUrl;
      }
    } catch (error) {
      console.warn('Failed to load config.json, using defaults:', error.message);
    }
  }

  return { apiUrl };
}

const config = loadConfig();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || config.apiUrl,
  },
}

module.exports = nextConfig
