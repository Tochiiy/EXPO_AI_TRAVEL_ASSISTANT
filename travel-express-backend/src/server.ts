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
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins, 
    credentials: true
}));

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'success', 
        message: '✈️ Travel Assistant AI Server is live!' 
    });
});


//🔐 AUTHENTICATION ROUTES 

app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, avatar: '' });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/api/itineraries', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const user = await User.findById(req.user.id).select('savedItineraries');
        res.json(user?.savedItineraries || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/itineraries/add', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { destination, dates, aiResponse } = req.body;
        
        // Find user and push the new trip object
        const user = await User.findById(req.user?.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newItinerary = {
            destination,
            dates,
            aiResponse,
            savedAt: new Date()
        };

        user.savedItineraries.push(newItinerary);
        await user.save();
        
        res.json({ message: 'Itinerary saved successfully!', itinerary: newItinerary });
    } catch (error) {
        res.status(500).json({ message: 'Error saving itinerary' });
    }
});

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



app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).populate('savedItineraries');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: (user as any).avatar,
            savedItineraries: user.savedItineraries
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ROUTE TO SAVE AVATAR PERMANENTLY
app.put('/api/auth/avatar', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.avatar = req.body.avatarUrl;
        await user.save();

        res.json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } catch (error) {
        console.error("Avatar Save Error:", error);
        res.status(500).json({ message: 'Error saving avatar' });
    }
});


io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('send_message', async (data) => {
        console.log("📨 Message received from frontend via WebSocket:", data.message);
        
        socket.emit('bot_typing', true);
        
        try {
            const pythonResponse = await fetch('http://127.0.0.1:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: data.message,
                    thread_id: socket.id
                })
            });

           const rawText = await pythonResponse.text();
           console.log(" text received from Python:", rawText);

           if (!pythonResponse.ok) {
                throw new Error(`Python service failed with status ${pythonResponse.status}: ${rawText}`);
            }

            const aiData = JSON.parse(rawText);

            socket.emit('receive_message', { 
                role: 'ai', 
                content: aiData.response || "Warning: No response did not sent retry." 
            });

        } catch (error) {
            console.error("AI Gateway Error:", error);
            socket.emit('receive_message', { 
                role: 'ai', 
                content: "Sorry, the AI agent is currently offline. Please check the Python server." 
            });
        } finally {
            socket.emit('bot_typing', false);
        }
    }); 

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});


const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env file');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`🚀 Real-time Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    });