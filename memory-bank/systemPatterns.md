# System Patterns: Voice Yann

## Architecture Overview
Voice Yann uses a client-server architecture with the following components:

1. **Frontend UI Component** (React/Next.js)
   - Handles user interactions
   - Manages recording state
   - Displays transcription results
   - Provides visual feedback during recording

2. **Audio Capture System** (Browser MediaRecorder API)
   - Requests microphone access
   - Captures audio streams
   - Converts to appropriate format
   - Handles recording start/stop events

3. **API Layer** (Next.js API Routes)
   - Receives audio data from frontend
   - Communicates with Google Cloud Speech-to-Text
   - Returns transcription results to frontend

4. **Speech Recognition Service** (Google Cloud Speech-to-Text)
   - Processes audio data
   - Performs speech recognition
   - Returns text transcriptions

## Data Flow

```
User Speech → Microphone → MediaRecorder → Audio Blob → API Route → 
Google Cloud Speech-to-Text API → Transcription → UI Display
```

## Key Design Patterns

### Frontend Patterns
1. **React Hooks Pattern**
   - useState for managing recording and transcription state
   - useRef for maintaining references to the MediaRecorder and audio chunks
   - useEffect for cleanup operations when component unmounts

2. **Event-Driven Architecture**
   - MediaRecorder events ('dataavailable', 'stop') drive the application flow
   - UI responds to state changes (isRecording, isLoading)

### API Patterns
1. **RESTful Endpoints**
   - POST /api/speech for handling audio conversion requests
   - Clean separation between client and server responsibilities

2. **Form Data Transfer**
   - Uses FormData for efficient binary data transfer

## Error Handling
1. **Graceful Degradation**
   - Fallbacks for unsupported browsers
   - Clear error messages for permission issues
   - Loading states during processing

2. **User Feedback**
   - Visual indicators for recording state
   - Loading indicators during transcription
   - Clear error messages when issues occur

## Security Considerations
1. **API Credential Protection**
   - Google Cloud credentials stored securely
   - .env.local for local environment variables
   - Credentials excluded from version control

2. **User Privacy**
   - Audio data processed in memory, not stored permanently
   - Clear indication when microphone is active 