const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async function(event, context) {
  try {
    // Only accept POST requests
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    const body = JSON.parse(event.body);
    const { prompt, model = "gemini-1.5-flash" } = body;
    
    if (!prompt) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Prompt is required" }) 
      };
    }
    
    console.log("Checking for API key...");
    
    // Try to get API key from multiple possible sources
    let apiKey = process.env.GOOGLE_GENAI_API_KEY;
    
    // For debugging - log whether we found the key (but don't log the actual key)
    console.log("API key present:", !!apiKey);
    
    // If key not found in standard env var, try Netlify specific env vars
    if (!apiKey) {
      console.log("No API key found in standard env var, checking alternatives...");
      apiKey = process.env.VITE_GOOGLE_GENAI_API_KEY;
      console.log("VITE_ prefixed API key present:", !!apiKey);
    }
    
    if (!apiKey) {
      return { 
        statusCode: 500, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "API key not configured", 
          envVars: Object.keys(process.env).filter(key => !key.includes('KEY')),
          // Don't log full env object as it might contain sensitive data
        }) 
      };
    }
    
    console.log("Initializing Gemini API with model:", model);
    
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });
    
    console.log("Generating content...");
    
    // Generate content
    const result = await genModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("Content generated successfully, length:", text.length);
    
    // Return the result
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    
    // Better error logging for debugging
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
    
    return { 
      statusCode: 500, 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        error: "Error calling Gemini API",
        details: errorDetails
      }) 
    };
  }
};