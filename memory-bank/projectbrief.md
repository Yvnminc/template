# Project Brief: Voice Yann (Speech-to-Text Application)

## Purpose and Goals
Voice Yann is a real-time voice transcription application built to demonstrate the capabilities of Google Cloud's Speech-to-Text API. The primary purpose is to create a simple, user-friendly interface that allows users to record their voice and see the transcription in real-time.

## Core Requirements
1. **Voice Recording**: Ability to start and stop voice recording via a simple UI
2. **Real-time Transcription**: Convert speech to text in real-time using Google Cloud Speech-to-Text API
3. **Text Display**: Show the transcribed text on the interface
4. **Minimal UI**: Clean, simple UI focused on core functionality rather than complex features

## Key Features (MVP)
- Record button to start voice capture
- Stop/Pause button to end recording
- Text area to display transcription results
- Clear button to reset transcription

## Non-Goals
- User authentication and accounts
- Saving or exporting transcriptions
- Complex text formatting or editing features
- Multi-language support (English-only for now)
- Advanced audio processing or noise filtering

## Technical Requirements
- Next.js for frontend and API routes
- Google Cloud Speech-to-Text API integration
- Browser's MediaRecorder API for audio capture
- TailwindCSS for styling

## Project Timeline
This is a demonstration project with no specific timeline. The focus is on building a functional prototype that showcases the core functionality of the Google Cloud Speech-to-Text API.

## Success Criteria
- Application successfully captures audio input
- Speech is accurately transcribed to text
- UI provides clear feedback during recording process
- Application runs stably in modern browsers 