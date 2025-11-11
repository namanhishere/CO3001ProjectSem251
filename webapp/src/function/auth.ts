import jwt, { type JwtPayload, type Secret } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import type { Request, Response, NextFunction, RequestHandler } from "express";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? (() => {
    throw new Error("❌ JWT_SECRET is not set in .env file");
})();

/* -------------------- PASSWORD HELPERS -------------------- */

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/* -------------------- JWT HELPERS -------------------- */

export function generateToken(payload: string | JwtPayload, expiresIn: string = "1h"): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions  );
}

export function verifyToken(token: string): JwtPayload | string {
    return jwt.verify(token, JWT_SECRET) as JwtPayload | string;
}

export function decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
}

/* Optional: Generate Refresh Token (long-lived) */
export function generateRefreshToken(payload: string | JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}


export const authMiddlewareWeb: RequestHandler = (req, res, next) => {
    const token = req.cookies?.authToken;

    // console.log("Auth Token:", req.cookies);

    if (!token) {
        return res.redirect("/auth/login");
    }

    try {
        const decoded = verifyToken(token);
        (req as any).user = decoded;
        console.log("Decoded User:", decoded);
        next();
    } catch {
        return res.redirect("/auth/login");
    }
};

export const authMiddlewareAPI: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1]; // now guaranteed string

    try {
        const decoded = verifyToken((token as string));
        (req as any).user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};