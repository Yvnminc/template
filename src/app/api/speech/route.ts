import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient, protos } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';

// Initialize the Speech Client with explicit credentials
let speechClient: SpeechClient | null;
let usingMockTranscription = false;
let initializationError: string | null = null;

try {
  // Try to load credentials directly from file
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'google-credentials.json');
  console.log('Attempting to load credentials from:', credentialsPath);
  
  if (fs.existsSync(credentialsPath)) {
    try {
      // Read and parse the credentials file
      const credentialContent = fs.readFileSync(credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialContent);
      
      console.log('Successfully loaded credentials for project:', credentials.project_id);
      
      // Create the client with explicit credentials object
      speechClient = new SpeechClient({
        credentials: credentials,
        projectId: credentials.project_id
      });
      
      console.log('Successfully initialized Speech client with credentials');
    } catch (error) {
      console.error('Error initializing Speech client with credentials file:', error);
      initializationError = `Error initializing with credentials file: ${error instanceof Error ? error.message : String(error)}`;
      speechClient = null;
      usingMockTranscription = true;
    }
  } else {
    console.error('Credentials file not found at:', credentialsPath);
    initializationError = `Credentials file not found at: ${credentialsPath}`;
    speechClient = null;
    usingMockTranscription = true;
  }
} catch (error) {
  console.error('Unhandled error initializing Speech client:', error);
  initializationError = `Unhandled error: ${error instanceof Error ? error.message : String(error)}`;
  usingMockTranscription = true;
  speechClient = null;
}

export async function POST(req: NextRequest) {
  try {
    // Get the audio data from the request
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // For development mode without credentials, return mock response
    if (!speechClient || usingMockTranscription) {
      console.log('Using mock transcription response');
      return NextResponse.json({ 
        transcription: 'This is a mock transcription. Authentication error: ' + 
          (initializationError || 'Google Cloud credentials are not configured or invalid.')
      });
    }

    // Convert the audio file to a buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Configure the request
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
    };

    // Perform the speech recognition
    try {
      console.log('Sending recognition request to Google Cloud...');
      const [response] = await speechClient.recognize(request);
      console.log('Received response from Google Cloud Speech API');
      
      const transcription = response.results
        ?.map((result: protos.google.cloud.speech.v1.ISpeechRecognitionResult) => 
          result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join('\n') || '';

      console.log('Transcription result:', transcription.substring(0, 50) + '...');
      return NextResponse.json({ transcription });
    } catch (recognizeError) {
      console.error('Speech recognition API error:', recognizeError);
      
      // Check if this is an authentication error or a usage error
      if (recognizeError instanceof Error) {
        const errorMessage = recognizeError.message || '';
        
        // Authentication errors typically contain these patterns
        const isAuthError = 
          errorMessage.includes('authentication') || 
          errorMessage.includes('permission') || 
          errorMessage.includes('credentials') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('auth') ||
          (recognizeError as any).code === 16; // UNAUTHENTICATED in gRPC
        
        if (isAuthError) {
          console.log('Authentication error during API call, using mock response');
          usingMockTranscription = true;
          return NextResponse.json({ 
            transcription: 'Mock transcription: Authentication failed: ' + errorMessage
          });
        } else {
          // This is a usage error, not an auth error
          return NextResponse.json({ 
            transcription: 'Error during transcription: ' + errorMessage,
            error: errorMessage
          });
        }
      }
      
      throw recognizeError; // Re-throw to be handled by the outer catch
    }
  } catch (error) {
    console.error('General speech recognition error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process speech', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint to check if we're using mock transcription
export async function GET() {
  return NextResponse.json({
    usingMockTranscription,
    status: 'ok',
    authError: initializationError,
    credentialsFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'google-credentials.json')
  });
}

// For streaming recognition
export async function PUT(req: NextRequest) {
  try {
    // This would be for streaming recognition
    // Not fully implemented in this example as it requires websockets
    return NextResponse.json({ message: 'Streaming not yet implemented' });
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json(
      { error: 'Failed to process streaming speech' },
      { status: 500 }
    );
  }
} 