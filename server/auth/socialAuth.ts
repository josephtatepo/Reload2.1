import type { Express, RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as TwitterStrategy } from "passport-twitter";
import AppleStrategy from "@nicokaiser/passport-apple";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db";
import { storage } from "../storage";

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
      authProvider?: string | null;
      authProviderId?: string | null;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
      createdAt?: Date | null;
      updatedAt?: Date | null;
    }
  }
}

const PgSession = connectPgSimple(session);

function getAppOrigin() {
  if (process.env.APP_ORIGIN) return process.env.APP_ORIGIN;
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  // REPLIT_DOMAINS is just a hostname (no protocol), add https://
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}`;
  return "https://afrokaviar.com";
}

export async function setupSocialAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  
  app.set("trust proxy", 1);

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err, false);
    }
  });

  const callbackBaseUrl = "https://afrokaviar.com";

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${callbackBaseUrl}/api/auth/google/callback`,
          proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            let user = email ? await storage.getUserByEmail(email) : null;
            
            if (!user) {
              user = await storage.upsertUser({
                email: email || undefined,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                profileImageUrl: profile.photos?.[0]?.value,
                authProvider: "google",
                authProviderId: profile.id,
              });
            }
            
            done(null, user || false);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL: `${callbackBaseUrl}/api/auth/twitter/callback`,
          includeEmail: true,
        },
        async (token, tokenSecret, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            let user = email ? await storage.getUserByEmail(email) : null;
            
            if (!user) {
              const nameParts = (profile.displayName || "").split(" ");
              user = await storage.upsertUser({
                email: email || undefined,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" ") || undefined,
                profileImageUrl: profile.photos?.[0]?.value?.replace("_normal", ""),
                authProvider: "twitter",
                authProviderId: profile.id,
              });
            }
            
            done(null, user || false);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }

  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          callbackURL: `${callbackBaseUrl}/api/auth/apple/callback`,
          scope: ["name", "email"],
        },
        async (accessToken: string, refreshToken: string, idToken: any, profile: any, done: any) => {
          try {
            const email = profile.email;
            let user = email ? await storage.getUserByEmail(email) : null;
            
            if (!user) {
              user = await storage.upsertUser({
                email: email || undefined,
                firstName: profile.name?.firstName,
                lastName: profile.name?.lastName,
                authProvider: "apple",
                authProviderId: profile.id,
              });
            }
            
            done(null, user || false);
          } catch (err) {
            done(err as Error);
          }
        }
      )
    );
  }
}

export function registerSocialAuthRoutes(app: Express) {
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/explore");
    }
  );

  app.get("/api/auth/twitter", passport.authenticate("twitter"));
  
  app.get(
    "/api/auth/twitter/callback",
    passport.authenticate("twitter", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/explore");
    }
  );

  app.get("/api/auth/apple", passport.authenticate("apple"));
  
  app.post(
    "/api/auth/apple/callback",
    passport.authenticate("apple", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/explore");
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
