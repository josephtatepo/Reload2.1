import type { Express } from "express";
import { authStorage } from "./storage";
import { db } from "../../db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user;

      // Social auth (Google/Twitter/Apple via Passport) — user is plain DB object
      if (user?.id && !user?.claims) {
        const [admin] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.userId, user.id));
        return res.json({ ...user, adminRole: admin?.role || null });
      }

      // Replit OIDC auth — user has claims object
      if (user?.claims?.sub) {
        const now = Math.floor(Date.now() / 1000);
        if (user.expires_at && now > user.expires_at) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = user.claims.sub;
        const dbUser = await authStorage.getUser(userId);
        if (!dbUser) {
          return res.status(404).json({ message: "User not found" });
        }
        const [admin] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.userId, userId));
        return res.json({ ...dbUser, adminRole: admin?.role || null });
      }

      return res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
