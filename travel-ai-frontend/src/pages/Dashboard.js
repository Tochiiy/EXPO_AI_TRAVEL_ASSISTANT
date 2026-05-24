import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../services/socket';
import { saveItinerary } from '../services/itineraryService';
import ReactMarkdown from 'react-markdown';
export default function Dashboard() {
    const auth = useContext(AuthContext);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    // Generate today's date formatted nicely
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const getWelcomeMessage = (name) => {
        return `👋 **Welcome, ${name}!**\n\nI am your personal AI travel agent. Where are we heading next?\n\n**Here are a few things you can ask me to do:**\n* ✈️ Find round-trip flights to London next weekend\n* 🏨 Search for luxury hotels in Paris for 3 nights\n* 🗺️ Create a complete 5-day itinerary for Brazil`;
    };
    const [messages, setMessages] = useState(() => {
        try {
            const savedChat = localStorage.getItem('travel_app_chat');
            if (savedChat) {
                const parsed = JSON.parse(savedChat);
                if (Array.isArray(parsed) && parsed.length > 0)
                    return parsed;
            }
        }
        catch (error) {
            console.error("Error parsing chat history:", error);
        }
        return [{ role: 'ai', content: getWelcomeMessage(auth?.user?.name || 'Explorer') }];
    });
    useEffect(() => {
        if (auth?.user?.name && messages.length === 1 && messages[0].content.includes('Explorer')) {
            const updatedMessage = [{ role: 'ai', content: getWelcomeMessage(auth.user.name) }];
            setMessages(updatedMessage);
            localStorage.setItem('travel_app_chat', JSON.stringify(updatedMessage));
        }
    }, [auth?.user?.name]);
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('travel_app_chat', JSON.stringify(messages));
        }
    }, [messages]);
    const handleManualSave = async () => {
        const lastAiMessage = [...messages].reverse().find(m => m.role === 'ai');
        if (!lastAiMessage || lastAiMessage.content.includes("Welcome back")) {
            return alert("Please ask the AI to generate an itinerary for you first!");
        }
        const destinationName = window.prompt("Enter a name for this trip (e.g., florida Summer 2026):", "My Next Adventure");
        if (!destinationName || !auth?.token)
            return;
        try {
            await saveItinerary(auth.token, { destination: destinationName, dates: "Dates in Itinerary", aiResponse: lastAiMessage.content });
            if (auth.refreshUser)
                await auth.refreshUser();
            alert("✅ Trip saved successfully! Check the 'My Trips' page.");
        }
        catch (err) {
            alert("❌ Failed to save trip to database.");
        }
    };
    useEffect(() => {
        socket.on('receive_message', (data) => setMessages((prev) => [...prev, data]));
        socket.on('bot_typing', (status) => setIsTyping(status));
        return () => { socket.off('receive_message'); socket.off('bot_typing'); };
    }, []);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);
    const handleSendMessage = () => {
        if (!input.trim())
            return;
        setMessages((prev) => [...prev, { role: 'user', content: input }]);
        socket.emit('send_message', { message: input });
        setInput('');
    };
    const handleClearChat = () => {
        const defaultMessage = [{ role: 'ai', content: getWelcomeMessage(auth?.user?.name || 'Explorer') }];
        setMessages(defaultMessage);
        localStorage.setItem('travel_app_chat', JSON.stringify(defaultMessage));
    };
    return (_jsx("div", { style: {
            display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)',
            marginTop: '65px', width: '100%', backgroundColor: '#f9fafb'
        }, children: _jsxs("main", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [_jsx("div", { style: { flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: _jsxs("div", { style: { maxWidth: '768px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '10px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }, children: [_jsxs("h2", { style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }, children: ["Hello, ", auth?.user?.name || 'Explorer', " \uD83D\uDC4B"] }), _jsx("p", { style: { margin: 0, color: '#6b7280', fontSize: '1rem', fontWeight: '500' }, children: today })] }), messages.map((msg, idx) => (_jsx("div", { style: { display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }, children: _jsx("div", { style: {
                                        maxWidth: '85%', padding: '12px 18px', borderRadius: '12px',
                                        backgroundColor: msg.role === 'user' ? '#000000' : '#ffffff',
                                        color: msg.role === 'user' ? '#ffffff' : '#111827',
                                        border: '1px solid #e5e7eb', lineHeight: '1.6', fontSize: '0.95rem',
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                    }, children: _jsx(ReactMarkdown, { components: {
                                            a: ({ node, ...props }) => _jsx("a", { ...props, target: "_blank", rel: "noopener noreferrer", style: { color: msg.role === 'user' ? '#93c5fd' : '#2563eb', fontWeight: '600', textDecoration: 'none', borderBottom: '1px solid currentColor' } }),
                                            h1: ({ node, ...props }) => _jsx("h1", { ...props, style: { fontSize: '1.15rem', fontWeight: '700', marginTop: '12px', marginBottom: '6px' } }),
                                            h2: ({ node, ...props }) => _jsx("h2", { ...props, style: { fontSize: '1.1rem', fontWeight: '700', marginTop: '12px', marginBottom: '6px' } }),
                                            h3: ({ node, ...props }) => _jsx("h3", { ...props, style: { fontSize: '1rem', fontWeight: '700', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', color: msg.role === 'user' ? '#e5e7eb' : '#4b5563' } }),
                                            p: ({ node, ...props }) => _jsx("p", { ...props, style: { margin: '0 0 10px 0', lineHeight: '1.5' } }),
                                            ul: ({ node, ...props }) => _jsx("ul", { ...props, style: { margin: '0 0 12px 0', paddingLeft: '20px' } }),
                                            ol: ({ node, ...props }) => _jsx("ol", { ...props, style: { margin: '0 0 12px 0', paddingLeft: '20px' } }),
                                            li: ({ node, ...props }) => _jsx("li", { ...props, style: { marginBottom: '4px' } }),
                                            strong: ({ node, ...props }) => _jsx("strong", { ...props, style: { fontWeight: '700', color: msg.role === 'user' ? '#ffffff' : '#111827' } })
                                        }, children: msg.content }) }) }, idx))), _jsx("div", { ref: messagesEndRef })] }) }), _jsx("div", { style: { padding: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }, children: _jsxs("div", { style: { maxWidth: '768px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }, children: [_jsxs("div", { style: { flex: 1, border: '1px solid #d1d5db', borderRadius: '24px', padding: '4px 12px', display: 'flex', alignItems: 'center' }, children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSendMessage(), style: { flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px' }, placeholder: "Ask about flights..." }), _jsx("button", { onClick: handleSendMessage, style: { background: '#000', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: "\u2191" })] }), _jsx("button", { onClick: handleManualSave, title: "Save Trip", style: { background: '#10b981', color: '#fff', border: 'none', borderRadius: '50%', width: '42px', height: '42px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: "\uD83D\uDCBE" }), _jsx("button", { onClick: handleClearChat, title: "Clear Chat", style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '50%', width: '42px', height: '42px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: "\u274C" })] }) })] }) }));
}
