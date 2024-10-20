// Import the Google Generative AI library
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define your prompt
const prompt = "Write a story about a magic backpack.";

async function generateContent() {
    try {
        // Generate content based on the prompt
        const result = await model.generateContent(prompt);
        
        // Log the generated story
        console.log(result.response.text());
    } catch (error) {
        console.error('Error generating content:', error);
    }
}

// Call the function to generate content
generateContent();
