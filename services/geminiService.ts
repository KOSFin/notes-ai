import { GenerateContentResponse, Chat } from "@google/genai";

export async function getAIResponse(chat: Chat, prompt: string): Promise<string> {
    try {
        const result = await chat.sendMessage({ message: prompt });
        const response: GenerateContentResponse = result;

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        return jsonStr;
    } catch (error) {
        console.error("Error in getAIResponse:", error);
        return JSON.stringify({
            commands: [{
                command: "PLAIN_RESPONSE",
                payload: {
                    text: "I'm sorry, but I'm having trouble connecting to my brain right now. Please check the console for errors or try again later."
                }
            }]
        });
    }
}
