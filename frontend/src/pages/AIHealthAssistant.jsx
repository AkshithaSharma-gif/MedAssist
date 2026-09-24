import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, Loader2, User, AlertCircle, Info } from "lucide-react";
import api from "../services/api";

function AIHealthAssistant() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setError("");

        setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), type: "user", content: userMessage, timestamp: new Date() },
        ]);

        setLoading(true);

        try {
            const response = await api.post("/ai/chat", { message: userMessage });

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "-ai",
                    type: "ai",
                    content: response.data.message,
                    timestamp: new Date()
                },
            ]);
        } catch (err) {
            console.error("AI Assistant Error:", err);
            // Don't show raw stack traces
            let errMsg = "Unable to get AI response. Please try again later.";

            if (err.response?.status === 401) errMsg = "Session expired. Please log in again.";
            else if (err.response?.status === 403) errMsg = "You do not have permission to use the AI assistant.";
            else if (err.response?.status === 503 || err.response?.status === 429) errMsg = "AI service is temporarily unavailable.";
            else if (err.message === "Network Error") errMsg = "Unable to connect to server. Please check your connection.";
            else if (err.response?.data?.message) errMsg = err.response.data.message;

            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] flex-col rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:h-[calc(100vh-100px)]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Bot size={22} />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-800">AI Health Assistant</h2>
                    <p className="text-xs text-gray-500">Powered by medical-grade AI</p>
                </div>
            </div>

            {/* Disclaimers & Errors */}
            <div className="bg-blue-50/50 p-3 px-5 border-b border-blue-100">
                <div className="flex items-start gap-2 text-xs text-blue-700">
                    <Info size={16} className="shrink-0 mt-0.5 opacity-80" />
                    <p>
                        Get general health information and explanations. This assistant does <strong>not</strong> replace a healthcare professional. Always consult a real doctor for medical advice.
                    </p>
                </div>
            </div>

            {error && (
                <div className="m-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-800">How can I help you today?</h3>
                        <p className="max-w-sm text-sm text-gray-500">
                            You can ask about symptoms, medical terminology, general health practices, or how to prepare for an appointment.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            <button onClick={() => setInput("What is the difference between a symptom and a diagnosis?")} className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                Symptom vs Diagnosis?
                            </button>
                            <button onClick={() => setInput("What should I bring to my first consultation?")} className="rounded-full bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                Preparing for consultation
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 sm:gap-4 ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                            >
                                <div className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-lg ${msg.type === "user" ? "bg-gray-100 text-gray-500" : "bg-blue-600 text-white"}`}>
                                    {msg.type === "user" ? <User size={18} /> : <Bot size={18} />}
                                </div>

                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.type === "user" ? "bg-gray-100 text-gray-800 rounded-tr-none" : "bg-blue-50 text-gray-800 rounded-tl-none ring-1 ring-blue-100/50"}`}>
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-4 flex-row">
                                <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Bot size={18} />
                                </div>
                                <div className="rounded-2xl rounded-tl-none bg-blue-50 px-5 py-4 text-sm ring-1 ring-blue-100/50">
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="font-medium opacity-80">Typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4">
                <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a medical question..."
                        className="max-h-32 min-h-[52px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-4 pr-12 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100/50"
                        rows="1"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
                    </button>
                </form>
                <p className="mt-2 text-center text-[10px] text-gray-400">
                    Press Enter to send, Shift + Enter for new line. AI can make mistakes.
                </p>
            </div>
        </div>
    );
}

export default AIHealthAssistant;
