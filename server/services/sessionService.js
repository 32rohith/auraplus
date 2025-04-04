const fs = require('fs').promises;
const path = require('path');

// Directory to store sessions
const SESSIONS_DIR = path.join(__dirname, '../data');

class SessionService {
    constructor() {
        // Ensure the data directory exists
        this.initDataDir();
    }

    async initDataDir() {
        try {
            await fs.mkdir(SESSIONS_DIR, { recursive: true });
            console.log('Sessions directory initialized:', SESSIONS_DIR);
        } catch (error) {
            console.error('Error initializing sessions directory:', error);
        }
    }

    async getAllSessions() {
        try {
            console.log('Fetching conversation sessions...');
            
            // Get all session files
            const files = await fs.readdir(SESSIONS_DIR);
            const sessionFiles = files.filter(file => file.endsWith('.json'));
            
            // Read and parse each session file
            const sessionsPromises = sessionFiles.map(async (file) => {
                const filePath = path.join(SESSIONS_DIR, file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                try {
                    const doc = JSON.parse(fileContent);
                    const conversation = JSON.parse(doc.conversation);
                    return {
                        ...doc,
                        conversation,
                        formattedStartTime: new Date(doc.startTime).toLocaleString(),
                        formattedEndTime: new Date(doc.endTime).toLocaleString(),
                        duration: Math.round((new Date(doc.endTime).getTime() - new Date(doc.startTime).getTime()) / 60000)
                    };
                } catch (error) {
                    console.error('Error parsing session file:', file, error);
                    return null;
                }
            });
            
            const sessions = await Promise.all(sessionsPromises);
            return sessions.filter(Boolean); // Remove any null sessions
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    }

    async getSessionById(sessionId) {
        try {
            const filePath = path.join(SESSIONS_DIR, `${sessionId}.json`);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const document = JSON.parse(fileContent);

            // Parse conversation and format dates
            const conversation = JSON.parse(document.conversation);
            return {
                ...document,
                conversation,
                formattedStartTime: new Date(document.startTime).toLocaleString(),
                formattedEndTime: new Date(document.endTime).toLocaleString(),
                duration: Math.round((new Date(document.endTime).getTime() - new Date(document.startTime).getTime()) / 60000)
            };
        } catch (error) {
            console.error('Error fetching session:', error);
            throw error;
        }
    }

    async storeSession(session) {
        try {
            console.log('Storing session:', {
                sessionId: session.sessionId,
                startTime: session.startTime,
                endTime: session.endTime,
                messageCount: session.messageCount
            });

            // Ensure conversation is properly stringified
            const conversationString = JSON.stringify(session.conversation);
            
            const document = {
                sessionId: session.sessionId,
                startTime: session.startTime,
                endTime: session.endTime,
                messageCount: session.messageCount,
                conversation: conversationString
            };
            
            // Write to file
            const filePath = path.join(SESSIONS_DIR, `${session.sessionId}.json`);
            await fs.writeFile(filePath, JSON.stringify(document, null, 2));
            
            // Return parsed data
            return {
                ...document,
                conversation: JSON.parse(document.conversation),
                formattedStartTime: new Date(document.startTime).toLocaleString(),
                formattedEndTime: new Date(document.endTime).toLocaleString(),
                duration: Math.round((new Date(document.endTime).getTime() - new Date(document.startTime).getTime()) / 60000)
            };
        } catch (error) {
            console.error('Error storing session:', error);
            throw error;
        }
    }
}

module.exports = new SessionService(); 