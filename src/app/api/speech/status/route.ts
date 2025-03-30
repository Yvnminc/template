import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET() {
  try {
    // Get the path to the credentials file
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    
    // Check file existence
    let fileExists = false;
    let fileSize = 0;
    let fileIsJson = false;
    let fileContentPreview = '';
    
    if (credentialsPath) {
      try {
        if (fs.existsSync(credentialsPath)) {
          fileExists = true;
          
          // Get some info about the file
          const stats = fs.statSync(credentialsPath);
          fileSize = stats.size;
          
          // Check if it's valid JSON
          try {
            const content = fs.readFileSync(credentialsPath, 'utf8');
            
            // Limit preview to first few characters (avoid exposing sensitive data)
            fileContentPreview = content.substring(0, 20) + '...';
            
            // Try to parse as JSON
            JSON.parse(content);
            fileIsJson = true;
          } catch (parseError) {
            console.error('Error parsing credentials file:', parseError);
          }
        }
      } catch (error) {
        console.error('Error checking credentials file:', error);
      }
    }
    
    // Check if we're running in development mode without credentials
    const usingMockTranscription = 
      !fileExists || !fileIsJson || fileSize === 0;
    
    return NextResponse.json({ 
      status: 'ok',
      usingMockTranscription,
      environment: process.env.NODE_ENV,
      credentials: {
        path: credentialsPath,
        exists: fileExists,
        size: fileSize,
        isValidJson: fileIsJson,
        preview: fileContentPreview.length > 0 ? `${fileContentPreview}` : null
      },
      debug: {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      status: 'error',
      usingMockTranscription: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 