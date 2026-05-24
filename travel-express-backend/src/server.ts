import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/user';
import http from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import { authMiddleware, AuthRequest } from './auth_middleware/auth';

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173', 
  'https://expo-travelai.vercel.app' 
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true }
});

// Middleware
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: '✈️ Travel Assistant AI Server is live!' });
});

// Email Verification Route
app.get('/api/test-email-config', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        await transporter.verify();
        res.json({ status: "Success", message: "Nodemailer is configured correctly and can reach Gmail!" });
    } catch (error) {
        console.error("Nodemailer Verify Error:", error);
        res.status(500).json({ status: "Failed", error: error });
    }
});

// AUTH ROUTES
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) { res.status(400).json({ message: 'User already exists' }); return; }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({ name, email, password: hashedPassword, avatar: '' });
        await user.save();

        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ message: 'Invalid credentials' }); return;
        }
        const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).populate('savedItineraries');
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }
        res.json({ id: user._id, name: user.name, email: user.email, avatar: (user as any).avatar, savedItineraries: user.savedItineraries });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.put('/api/auth/avatar', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }
        user.avatar = req.body.avatarUrl;
        await user.save();
        res.json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (error) { res.status(500).json({ message: 'Error saving avatar' }); }
});

// FORGOT/RESET PASSWORD ROUTES
app.post('/api/auth/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) { res.status(404).json({ message: 'User not found' }); return; }

        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const resetUrl = `https://expo-travelai.vercel.app/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER, to: user.email, subject: 'Password Reset',
            html: `<p>Click here to reset:</p><a href="${resetUrl}">${resetUrl}</a>`
        });
        res.json({ message: 'Password reset link sent!' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/reset-password/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET as string);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
        res.json({ message: 'Password reset successfully!' });
    } catch (error) { res.status(400).json({ message: 'Invalid or expired token' }); }
});

// ITINERARY ROUTES
app.get('/api/itineraries', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select('savedItineraries');
        res.json(user?.savedItineraries || []);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/itineraries/add', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const newItinerary = { ...req.body, savedAt: new Date() };
        user.savedItineraries.push(newItinerary);
        await user.save();
        res.json({ message: 'Itinerary saved successfully!', itinerary: newItinerary });
    } catch (error) { res.status(500).json({ message: 'Error saving itinerary' }); }
});

// AI GATEWAY (Socket.IO)
io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);
    socket.on('send_message', async (data) => {
        socket.emit('bot_typing', true);
        try {
            // THE FIX: Hard fallback if process.env fails to load
            const pythonUrl = process.env.PYTHON_AI_URL || 'https://expo-ai-travel-assistant-1.onrender.com';
            
            const pythonResponse = await fetch(`${pythonUrl}/api/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_SECRET_KEY}` 
                },
                body: JSON.stringify({ message: data.message, thread_id: socket.id })
            });
            
            if (!pythonResponse.ok) {
                const errText = await pythonResponse.text();
                throw new Error(`AI Service returned ${pythonResponse.status}: ${errText}`);
            }
            
            const aiData = await pythonResponse.json();
            socket.emit('receive_message', { role: 'ai', content: aiData.response });
            
        } catch (error: any) {
            console.error("AI Gateway Error:", error);
            socket.emit('receive_message', { 
                role: 'ai', 
                content: `🚨 ERROR REVEALED: ${error.message || error.toString()}` 
            });
        } finally {
            socket.emit('bot_typing', false);
        }
    });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    });