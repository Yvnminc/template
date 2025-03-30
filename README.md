# Voice Yann - Voice Transcription App

A real-time voice transcription application built with Next.js and Google Cloud Speech-to-Text API.

## Features

- Real-time speech-to-text transcription
- Simple, intuitive user interface
- Record and pause functionality
- Transcription display in real-time

## Technology Stack

- **Frontend**: React with Next.js 14, TailwindCSS
- **API**: Google Cloud Speech-to-Text
- **Styling**: TailwindCSS for responsive design

## Getting Started

### Prerequisites

- Node.js and npm installed
- A Google Cloud account with Speech-to-Text API enabled
- Google Cloud Service Account with appropriate permissions

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/voice-yann.git
   cd voice-yann
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Google Cloud credentials:
   ```
   npm run setup
   ```
   This will:
   - Create a template credentials file if it doesn't exist
   - Set up the .env.local file with the correct path
   - Provide instructions on getting actual Google Cloud credentials

4. Replace the template credentials with your actual Google Cloud credentials:
   - Create a Google Cloud project (if you don't have one): https://console.cloud.google.com/projectcreate
   - Enable the Speech-to-Text API: https://console.cloud.google.com/apis/library/speech.googleapis.com
   - Create a Service Account: https://console.cloud.google.com/apis/credentials
   - Download the JSON key file and replace the template file with your downloaded file

5. Run the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`

### Troubleshooting Credentials

If you're seeing "Mock transcription" messages, it means your Google Cloud credentials are not properly configured. Check the following:

1. Make sure the credentials file exists at the path specified in .env.local
2. Verify the credentials file is valid JSON and contains all required fields
3. Ensure the service account has the Speech-to-Text API access enabled
4. Check that the Speech-to-Text API is enabled in your Google Cloud project

For development/testing, you can continue to use the mock transcription mode without setting up Google Cloud credentials. The app will automatically fall back to mock responses if credentials are not available.

### Development Mode

When running in development mode without valid Google Cloud credentials, the application will use a mock transcription service. This allows you to test the UI and workflow without setting up actual Google Cloud credentials.

## Usage

1. Click the "Record" button to start recording your voice
2. Speak clearly into your microphone
3. The transcription will appear in real-time as you speak
4. Click the "Stop" button when you're done
5. Use the "Clear" button to reset the transcription

## Notes

- The application requires microphone access, so be sure to grant permission when prompted
- For best results, speak clearly and minimize background noise
- In development mode without credentials, you'll see mock transcriptions
- For production use, proper Google Cloud credentials must be configured

## License

This project is licensed under the MIT License - see the LICENSE file for details.