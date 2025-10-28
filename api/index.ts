import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { initializeFirebase } from "../server/firebase";
import { FirebaseStorage } from "../server/storage";
import { KickletSyncService } from "../server/kicklet-sync";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Initialize Firebase
initializeFirebase();

// Register API routes
registerRoutes(app);

// Start Kicklet background sync
const storage = new FirebaseStorage();
const kickletSync = new KickletSyncService(storage);
kickletSync.start();

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
