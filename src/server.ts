import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';

// Polyfills for SSR and certain Node libraries (like mongodb driver)
import { URL, URLSearchParams } from 'node:url';
if (typeof global !== 'undefined') {
  (global as any).URL = (global as any).URL || URL;
  (global as any).URLSearchParams = (global as any).URLSearchParams || URLSearchParams;
}
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('node:util');
  (global as any).TextEncoder = TextEncoder;
  (global as any).TextDecoder = TextDecoder;
}

import express from 'express';
import { join } from 'node:path';
// import mongoose from 'mongoose'; // Removed to prevent SSR crash
import jwt from 'jsonwebtoken';
import cors from 'cors';
import passport, { issueJWT, jwtMiddleware } from './server/auth';
import http from 'node:http';
import { Server as IOServer } from 'socket.io';
// Models will be loaded dynamically
// import MessageModel from './server/models/Message';
// import UserModel from './server/models/User';
// import ReceiptModel from './server/models/Receipt';
// import PDFDocument from 'pdfkit'; // Removed to prevent SSR crash

import { db } from './server/db-provider';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// MongoDB connection helper
let isMongoConnected = false;
async function connectToMongo() {
  const mongoUri = process.env['MONGODB_URI'];
  if (!mongoUri || mongoUri.includes('127.0.0.1')) {
    console.log('No online MongoDB URI found or using local. Site will run in Safe Mode (JSON).');
    return;
  }

  try {
    const { default: mongoose } = await import('mongoose');
    await mongoose.connect(mongoUri);
    isMongoConnected = true;
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.error('MongoDB connection error. Site will run in Safe Mode (JSON).', err.message);
  }
}

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// [DEBUG] Check User Existence in Vercel
app.get('/api/debug-check/:email', async (req, res) => {
  try {
    const email = req.params.email;
    let user: any = null;
    let dbName = 'Unknown';

    if (isMongoConnected) {
      const { default: mongoose } = await import('mongoose');
      const { default: UserModel } = await import('./server/models/User');
      user = await UserModel.findOne({ email }).select('+password');
      dbName = mongoose.connection.name;
    } else {
      user = await db.findOne('users', { email });
      dbName = 'Local JSON (Safe Mode)';
    }

    res.json({
      status: user ? 'found' : 'not_found',
      emailChecked: email,
      dbName: dbName,
      isMongoConnected: isMongoConnected,
      hasPassword: !!user?.password,
      passwordHashPreview: user?.password ? user.password.substring(0, 10) + '...' : 'none',
      envMongoUri: process.env['MONGODB_URI'] ? 'Present (Hidden)' : 'Missing'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// [DEBUG] Mock Login for verification purposes
app.get('/auth/mock', async (req, res) => {
  if (process.env['NODE_ENV'] === 'production') {
    return res.status(403).send('Forbidden');
  }

  // Use a hardcoded mock user or the first user found in DB (if any)
  let user: any = null;
  if (isMongoConnected) {
    try {
      const { default: UserModel } = await import('./server/models/User');
      user = await UserModel.findOne({ role: 'admin' }).lean();
    } catch (e) { }
  }

  if (!user) {
    user = await db.findOne('users', { role: 'admin' });
  }

  if (!user) {
    user = await db.create('users', { email: 'admin@mock.com', name: 'Mock Admin', role: 'admin' });
  }

  const token = issueJWT(user);
  const redirectTo = process.env['FRONTEND_URL'] || '/admin';
  res.redirect(`${redirectTo}?token=${token}`);
  return;
});

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = issueJWT((req as any).user);
    const redirectTo = process.env['FRONTEND_URL'] || '/admin';
    res.redirect(`${redirectTo}?token=${token}`);
  },
);

// Email/Password Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  try {
    let user: any = null;

    // Check MongoDB first
    if (isMongoConnected) {
      const { default: UserModel } = await import('./server/models/User');
      user = await UserModel.findOne({ email });
    }

    // Fallback to local DB
    if (!user) {
      user = await db.findOne('users', { email });
    }

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const { verifyPassword } = await import('./server/auth');
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = issueJWT(user);
    res.json({ token, user: { email: user.email, name: user.name, role: user.role } });

  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email/Password Register
app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  try {
    let existingUser: any = null;

    if (isMongoConnected) {
      const { default: UserModel } = await import('./server/models/User');
      existingUser = await UserModel.findOne({ email });
    }

    if (!existingUser) {
      existingUser = await db.findOne('users', { email });
    }

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const { hashPassword } = await import('./server/auth');
    const hashedPassword = await hashPassword(password);

    let newUser: any = null;

    if (isMongoConnected) {
      const { default: UserModel } = await import('./server/models/User');
      newUser = await UserModel.create({ email, password: hashedPassword, name, role: 'user' });
    }

    if (!newUser) {
      // Fallback or Safe Mode
      newUser = await db.create('users', { email, password: hashedPassword, name, role: 'user' });
    }

    const token = issueJWT(newUser);
    res.json({ token, user: { email: newUser.email, name: newUser.name, role: newUser.role } });

  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected API endpoints for admin
app.get('/api/admin/me', jwtMiddleware, async (req, res) => {
  const id = (req as any).user.sub;
  let user: any = null;
  if (isMongoConnected) {
    try {
      const { default: UserModel } = await import('./server/models/User');
      user = await UserModel.findById(id).lean();
    } catch (e) { }
  }
  if (!user) user = await db.findById('users', id);
  res.json(user);
});

app.get('/api/admin/messages', jwtMiddleware, async (req, res) => {
  const id = (req as any).user.sub;
  let messages: any[] = [];
  if (isMongoConnected) {
    try {
      const { default: MessageModel } = await import('./server/models/Message');
      messages = await MessageModel.find({ $or: [{ from: id }, { to: id }] }).sort({ createdAt: 1 }).lean();
    } catch (e) { }
  }
  if (!messages.length) messages = await db.find('messages'); // Filter logic simplified for mock
  res.json(messages);
});

app.post('/api/admin/messages', jwtMiddleware, async (req, res) => {
  const id = (req as any).user.sub;
  const { to, text } = req.body;
  let message: any = null;
  if (isMongoConnected) {
    try {
      const { default: MessageModel } = await import('./server/models/Message');
      message = await MessageModel.create({ from: id, to, text });
    } catch (e) { }
  }
  if (!message) message = await db.create('messages', { from: id, to, text });
  res.json(message);
});

app.get('/api/admin/receipts', jwtMiddleware, async (req, res) => {
  let receipts: any[] = [];
  if (isMongoConnected) {
    try {
      const { default: ReceiptModel } = await import('./server/models/Receipt');
      receipts = await ReceiptModel.find().sort({ createdAt: -1 }).lean();
    } catch (e) { }
  }
  if (!receipts.length) receipts = await db.find('receipts');
  res.json(receipts);
});

app.post('/api/admin/receipts', jwtMiddleware, async (req, res) => {
  const { client, items } = req.body;
  const total = (items || []).reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0);
  let receipt: any = null;
  if (isMongoConnected) {
    try {
      const { default: ReceiptModel } = await import('./server/models/Receipt');
      receipt = await ReceiptModel.create({ client, items, total });
    } catch (e) { }
  }
  if (!receipt) receipt = await db.create('receipts', { client, items, total });
  res.json(receipt);
});

app.get('/api/admin/receipts/:id/pdf', jwtMiddleware, async (req, res): Promise<void> => {
  try {
    const id = (req.params as any).id;
    let receipt: any = null;

    if (isMongoConnected) {
      try {
        const { default: ReceiptModel } = await import('./server/models/Receipt');
        receipt = await ReceiptModel.findById(id).populate('client').lean();
      } catch (e) { }
    }

    if (!receipt) receipt = await db.findById('receipts', id);

    if (!receipt) {
      res.status(404).json({ error: 'Receipt not found' });
      return;
    }

    const { default: PDFDocument } = await import('pdfkit');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${id}.pdf"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.fontSize(20).text('Recibo', { align: 'center' });
    doc.moveDown();

    const client = receipt.client as any;
    doc.fontSize(12).text(`Cliente: ${client?.name || client?.email || 'N/A'}`);
    doc.text(`Fecha: ${new Date(receipt.createdAt as string).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Items:');
    doc.moveDown(0.5);
    (receipt.items || []).forEach((it: any, idx: number) => {
      doc.fontSize(12).text(`${idx + 1}. ${it.description} — ${it.quantity} x ${it.price} = ${((it.quantity || 0) * (it.price || 0)).toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${Number(receipt.total).toFixed(2)}`);

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('PDF error', err);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

/**
 * Handle all other requests by rendering the Angular application.
 */
/**
 * Handle all other requests by rendering the Angular application.
 */
app.get(/^(?!\/api|\/auth).*$/, (req, res, next) => {
  console.log('[SSR] Handling request:', req.url);
  angularApp
    .handle(req)
    .then((response) => {
      if (response) {
        writeResponseToNodeResponse(response, res);
      } else {
        console.log('[SSR] No response for:', req.url);
        next();
      }
    })
    .catch((err) => {
      console.error('[SSR] Error rendering:', err);
      next(err);
    });
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  // create HTTP server and attach Socket.IO
  const server = http.createServer(app);
  const io = new IOServer(server, { cors: { origin: process.env['FRONTEND_URL'] || '*' } });

  const JWT_SECRET = process.env['JWT_SECRET'] || 'dev_jwt_secret';
  io.use((socket: any, next: any) => {
    const token = (socket.handshake as any).auth?.token || (socket.handshake as any).query?.token;
    if (!token) return next(new Error('Auth error'));
    try {
      const payload = jwt.verify(token as string, JWT_SECRET) as any;
      (socket as any).data.user = payload;
      return next();
    } catch (err) {
      return next(new Error('Auth error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).data.user.sub;
    socket.join(userId);

    socket.on('private_message', async (msg: any) => {
      try {
        let saved: any = null;
        if (isMongoConnected) {
          const { default: MessageModel } = await import('./server/models/Message');
          saved = await MessageModel.create({ from: userId, to: msg.to, text: msg.text });
        }
        if (!saved) {
          saved = await db.create('messages', { from: userId, to: msg.to, text: msg.text });
        }
        io.to(msg.to).emit('private_message', saved);
        io.to(userId).emit('private_message', saved);
      } catch (err) {
        console.error('Error saving message', err);
      }
    });
  });

  server.listen(port, async () => {
    await connectToMongo();
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
