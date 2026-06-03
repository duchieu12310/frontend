import { useState, useRef, useEffect } from 'react';
import { FloatButton, Avatar, Spin, Button, Typography } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import styles from './chatbot.module.scss';
import { callGptChat } from '@/config/api';

const { Text } = Typography;

interface IMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

const GptChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>(() => {
        const saved = localStorage.getItem('gpt_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // ignore
            }
        }
        return [
            {
                id: 'welcome',
                text: 'Xin chào! Tôi là trợ lý ảo JobHunter GPT. Tôi có thể tư vấn, tìm kiếm việc làm bằng ngôn ngữ tự nhiên từ danh sách công việc thực tế trong hệ thống. Hãy hỏi tôi bất cứ điều gì:',
                sender: 'bot'
            }
        ];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Close this window when Qdrant chatbot is opened
    useEffect(() => {
        const handleOpenQdrant = () => setIsOpen(false);
        window.addEventListener('open-qdrant-chatbot', handleOpenQdrant);
        return () => window.removeEventListener('open-qdrant-chatbot', handleOpenQdrant);
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Save messages to localStorage
    useEffect(() => {
        localStorage.setItem('gpt_chat_history', JSON.stringify(messages));
    }, [messages]);

    const toggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            window.dispatchEvent(new CustomEvent('open-gpt-chatbot'));
        }
    };

    const handleSendMessage = async () => {
        const textToSend = input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: IMessage = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare history for OpenAI chat completions
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));

            const res = await callGptChat(textToSend, history);
            if (res && res.data && res.data.reply) {
                const botMessage: IMessage = {
                    id: (Date.now() + 1).toString(),
                    text: res.data.reply,
                    sender: 'bot'
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error("No reply data");
            }
        } catch (error) {
            console.error("GPT Chatbot error:", error);
            const errorMessage: IMessage = {
                id: (Date.now() + 1).toString(),
                text: "Có lỗi xảy ra khi kết nối tới trợ lý ảo. Vui lòng thử lại sau.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleClearHistory = () => {
        localStorage.removeItem('gpt_chat_history');
        setMessages([
            {
                id: 'welcome',
                text: 'Xin chào! Tôi là trợ lý ảo JobHunter GPT. Tôi có thể tư vấn, tìm kiếm việc làm bằng ngôn ngữ tự nhiên từ danh sách công việc thực tế trong hệ thống. Hãy hỏi tôi bất cứ điều gì:',
                sender: 'bot'
            }
        ]);
    };

    return (
        <div className={styles['chatbot-container']} style={{ bottom: 85 }}>
            <FloatButton
                icon={<RobotOutlined style={{ color: '#52c41a' }} />}
                type="default"
                style={{ right: 20 }}
                onClick={toggleOpen}
                tooltip="Tư vấn AI (GPT)"
                badge={{ dot: !isOpen && messages.length > 1 }}
            />

            {isOpen && (
                <div className={styles['chat-window']} style={{ bottom: 155 }}>
                    <div className={styles['chat-header']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RobotOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                            <span style={{ fontWeight: 600 }}>JobHunter GPT</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Button 
                                type="text" 
                                danger 
                                size="small" 
                                onClick={handleClearHistory}
                                style={{ fontSize: 12, padding: '0 4px' }}
                            >
                                Xóa lịch sử
                            </Button>
                            <CloseOutlined
                                className={styles['close-btn']}
                                onClick={() => setIsOpen(false)}
                            />
                        </div>
                    </div>

                    <div className={styles['chat-messages']}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles['message-wrapper']} ${styles[msg.sender]}`}>
                                {msg.sender === 'bot' && (
                                    <Avatar 
                                        icon={<RobotOutlined />} 
                                        size="small" 
                                        style={{ backgroundColor: '#52c41a' }} 
                                        className={styles['avatar']} 
                                    />
                                )}
                                <div className={styles['message-content']}>
                                    <div className={styles['bubble']} style={{ whiteSpace: 'pre-line' }}>
                                        {msg.text}
                                    </div>
                                </div>
                                {msg.sender === 'user' && <Avatar icon={<UserOutlined />} size="small" className={styles['avatar']} />}
                            </div>
                        ))}

                        {isLoading && (
                            <div className={`${styles['message-wrapper']} ${styles['bot']}`}>
                                <Avatar 
                                    icon={<RobotOutlined />} 
                                    size="small" 
                                    style={{ backgroundColor: '#52c41a' }} 
                                    className={styles['avatar']} 
                                />
                                <div className={styles['message-content']}>
                                    <div className={styles['bubble']}>
                                        <Spin size="small" /> Đang phản hồi...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles['chat-input']}>
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi tự nhiên..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GptChatBot;
