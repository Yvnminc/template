# Technical Context: Voice Yann

## Technology Stack

### Frontend
- **React**: UI library for building component-based interfaces
- **Next.js**: React framework for server-side rendering and API routes
- **TailwindCSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for UI elements
- **Web Audio API**: Browser API for audio processing
- **MediaRecorder API**: Browser API for capturing media streams

### Backend / API
- **Next.js API Routes**: Serverless functions for handling API requests
- **Google Cloud Speech-to-Text**: Cloud service for speech recognition
- **@google-cloud/speech**: Official Node.js client library for Google Cloud Speech-to-Text

## Development Environment
- **TypeScript**: Typed JavaScript for improved developer experience
- **ESLint**: Code linting for TypeScript/React
- **npm**: Package manager for JavaScript
- **Git**: Version control system

## Integration Points

### Google Cloud Speech-to-Text API
- **Authentication**: Uses service account credentials
- **Request Format**: Accepts audio content in base64 format
- **Configuration Options**: 
  - LINEAR16 encoding (16-bit PCM)
  - 16kHz sample rate
  - US English language
  - Automatic punctuation

### Web Audio & MediaRecorder
- **Permissions**: Requires user permission to access microphone
- **Format**: Captures audio in WAV format
- **Chunking**: Processes audio in 1-second chunks for real-time experience

## Deployment Considerations
- **Environment Variables**: Requires GOOGLE_APPLICATION_CREDENTIALS to be set
- **API Keys**: Google Cloud service account key must be accessible to the application
- **CORS**: No cross-origin concerns as API and frontend are served from same origin

## Technical Constraints and Limitations
- **Browser Support**: Requires browsers that support MediaRecorder API
  - Chrome 49+
  - Firefox 29+
  - Edge 79+
  - Safari 14.1+
- **API Quota**: Limited by Google Cloud Speech-to-Text quota (free tier: 60 minutes/month)
- **Audio Length**: Best suited for shorter audio clips (under 1 minute)
- **Network Dependency**: Requires stable internet connection for API calls

## Performance Considerations
- **API Latency**: Google Speech-to-Text typically responds within 1-2 seconds
- **Audio Size**: Larger audio files may take longer to process
- **Real-time Processing**: Chunking audio helps balance real-time needs with accuracy 