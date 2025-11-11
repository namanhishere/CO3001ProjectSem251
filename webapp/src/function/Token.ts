import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


export class SessionTokenManager {
    private static instance: SessionTokenManager | null = null;
    private tokens: Map<string, string> = new Map();

    private constructor() {}

    static getInstance(): SessionTokenManager {
        if (!SessionTokenManager.instance) {
            SessionTokenManager.instance = new SessionTokenManager();
        }
        return SessionTokenManager.instance;
    }


    generateToken(userId: string, content: object): string {
        let randomString = process.env.NODE_ENV !== "production" ? "" : Math.random().toString(36).substring(15);
        const token = jwt.sign({ userId, content, randomString }, process.env.JWT_SECRET || "default_secret");
        this.tokens.set(token, userId);
        return token;
    }
    verifyToken(token: string): { userId: string; content: object } | null {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
            if (this.tokens.has(token)) {
                return { userId: decoded.userId, content: decoded.content };
            } else {
                return null;
            }   
        } catch (err) {
            return null;
        }
    }
    deleteToken(token: string): void {
        this.tokens.delete(token);
    }
    
}