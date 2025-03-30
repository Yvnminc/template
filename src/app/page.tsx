'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, Info, ArrowBigUp, StopCircle } from 'lucide-react';

interface StatusInfo {
  usingMockTranscription: boolean;
  status: string;
  environment?: string;
  authError?: string;
  credentialsFile?: string;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [apiStatus, setApiStatus] = useState<StatusInfo | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [prevSessionId, setPrevSessionId] = useState('');

  // Check if we're in development mode with mock transcriptions
  const checkApiStatus = async () => {
    try {
      const response = await fetch('/api/speech');
      const data = await response.json();
      setApiStatus(data);
      
      if (data.usingMockTranscription) {
        setError('Your application is currently using mock transcription because Google Cloud Speech-to-Text API is not properly configured.');
      }
    } catch (err) {
      console.error('Failed to check API status:', err);
    }
  };
  
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Add status check
  useEffect(() => {
    // Check the API status endpoint
    fetch('/api/speech')
      .then(response => response.json())
      .then(data => {
        console.log('API Status:', data);
        setApiStatus(data);
      })
      .catch(error => {
        console.error('Error fetching API status:', error);
      });
  }, []);

  const startRecording = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError(`Failed to start recording: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Recording error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) {
      return;
    }
    
    try {
      setIsLoading(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Wait for the ondataavailable to fire
      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => resolve();
        } else {
          resolve();
        }
      });
      
      // Close the media stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Create a blob from the audio data and send to the server
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTranscription(data.transcription);
        
        // Check if it's an error message from our API
        if (data.error || (data.transcription && data.transcription.startsWith('Error during transcription:'))) {
          setError(`Transcription error: ${data.error || data.transcription.replace('Error during transcription:', '')}`);
        } else if (data.transcription && data.transcription.startsWith('Mock transcription:')) {
          setError('Your application is currently using mock transcription because Google Cloud Speech-to-Text API is not properly configured.');
        } else {
          setError(null); // Clear any previous errors if successful
        }
      } else {
        throw new Error(data.error || 'Failed to process audio');
      }
    } catch (err) {
      setError(`Transcription failed: ${err instanceof Error ? err.message : String(err)}`);
      console.error('Transcription error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCredentialHelp = () => {
    if (!apiStatus?.authError) {
      return null;
    }
    
    return (
      <div className="mt-2 text-sm border-l-4 border-amber-300 pl-2">
        <p className="font-medium">How to fix:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Make sure you have a valid <code>google-credentials.json</code> file in your project root</li>
          <li>Set the <code>GOOGLE_APPLICATION_CREDENTIALS</code> environment variable correctly</li>
          <li>Restart the development server</li>
        </ol>
      </div>
    );
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Voice Transcription App</h1>
      
      <div className="w-full max-w-3xl mb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
              
              {getCredentialHelp()}
              
              <div className="mt-2 flex items-center">
                <button 
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="text-xs flex items-center text-red-700 underline"
                >
                  <Info className="h-3 w-3 mr-1" />
                  {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                </button>
              </div>
              
              {showDebugInfo && apiStatus && (
                <div className="mt-2 text-xs font-mono p-2 bg-gray-100 text-gray-700 rounded overflow-auto max-h-40">
                  <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* API Status Banner */}
        {apiStatus && (
          <div className={`mb-4 p-4 border rounded-lg ${apiStatus.usingMockTranscription ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Speech-to-Text Status</p>
                <p>
                  {apiStatus.usingMockTranscription 
                    ? `Using mock transcription: ${apiStatus.authError || 'Unknown error'}`
                    : 'Connected to Google Cloud Speech-to-Text API'}
                </p>
                {apiStatus.credentialsFile && (
                  <p className="text-xs mt-1">
                    Credentials file: {apiStatus.credentialsFile}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 min-h-[200px] max-h-[400px] overflow-auto">
          {transcription ? (
            <p className="whitespace-pre-wrap">{transcription}</p>
          ) : (
            <p className="text-gray-400 italic">Your transcription will appear here...</p>
          )}
        </div>

        <div className="flex gap-4 mt-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Mic className="h-5 w-5" />}
              Record
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
            >
              <MicOff className="h-5 w-5" />
              Stop
            </button>
          )}
          
          <input
            type="text"
            placeholder="Session ID (optional)"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
        </div>
        
        {prevSessionId && (
          <div className="mt-2 text-sm text-gray-500">
            Last session ID: {prevSessionId}
          </div>
        )}
      </div>
      
      <div className="w-full max-w-3xl text-center text-sm text-gray-500">
        <p>
          Click the Record button and speak. Your speech will be transcribed in real-time.
          Press Stop when you're finished.
        </p>
      </div>
    </main>
  );
}
