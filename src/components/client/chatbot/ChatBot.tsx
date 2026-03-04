import { useState, useRef, useEffect } from 'react';
import { FloatButton, Card, Tag, Typography, Button, Empty, Avatar, Spin } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import styles from './chatbot.module.scss';
import { callChatBotSearch } from '@/config/api';
import { useNavigate } from 'react-router-dom';
import { convertSlug } from '@/config/utils';

const { Text, Title } = Typography;

interface IJobResult {
    jobId: number;
    score: number;
    name: string;
    company: string;
    location: string;
    salary: string;
    skills: string;
    level: string;
    description: string;
    startDate: string;
    endDate: string;
}

interface IMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    data?: IJobResult[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<IMessage[]>([
        {
            id: 'welcome',
            text: 'Xin chào! Tôi là trợ lý ảo JobHunter. Tôi có thể giúp gì cho bạn? Hãy chọn một câu hỏi mẫu hoặc nhập câu hỏi của bạn:',
            sender: 'bot'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const suggestions = [
        "Tìm việc Java Spring Boot tại Hà Nội",
        "Tuyển dụng ReactJS ",
        "Công việc Tester",
        "Việc làm Python tại TP.HCM"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (msgText?: string) => {
        const textToSend = msgText || input.trim();
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
            const res = await callChatBotSearch(textToSend);
            if (res && res.data) {
                const jobs = res.data as unknown as IJobResult[];

                if (jobs.length > 0) {
                    const botMessage: IMessage = {
                        id: (Date.now() + 1).toString(),
                        text: `Tôi tìm thấy ${jobs.length} công việc phù hợp với yêu cầu của bạn:`,
                        sender: 'bot',
                        data: jobs
                    };
                    setMessages(prev => [...prev, botMessage]);
                } else {
                    const botMessage: IMessage = {
                        id: (Date.now() + 1).toString(),
                        text: "Rất tiếc, tôi không tìm thấy công việc nào phù hợp với yêu cầu của bạn. Bạn hãy thử từ khóa khác nhé!",
                        sender: 'bot'
                    };
                    setMessages(prev => [...prev, botMessage]);
                }
            } else {
                throw new Error("No data");
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: IMessage = {
                id: (Date.now() + 1).toString(),
                text: "Có lỗi xảy ra khi kết nối tới server. Vui lòng thử lại sau.",
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

    const handleViewJob = (job: IJobResult) => {
        const slug = convertSlug(job.name);
        navigate(`/job/${slug}?id=${job.jobId}`);
    };

    return (
        <div className={styles['chatbot-container']}>
            <FloatButton
                icon={<RobotOutlined />}
                type="primary"
                style={{ right: 20, bottom: 20 }}
                onClick={() => setIsOpen(!isOpen)}
                tooltip="Chat với JobHunter AI"
                badge={{ dot: !isOpen && messages.length > 1 }}
            />

            {isOpen && (
                <div className={styles['chat-window']}>
                    <div className={styles['chat-header']}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RobotOutlined style={{ fontSize: 18 }} />
                            <span style={{ fontWeight: 600 }}>JobHunter AI</span>
                        </div>
                        <CloseOutlined
                            className={styles['close-btn']}
                            onClick={() => setIsOpen(false)}
                        />
                    </div>

                    <div className={styles['chat-messages']}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles['message-wrapper']} ${styles[msg.sender]}`}>
                                {msg.sender === 'bot' && <Avatar icon={<RobotOutlined />} size="small" className={styles['avatar']} />}
                                <div className={styles['message-content']}>
                                    <div className={styles['bubble']}>
                                        {msg.text}
                                    </div>

                                    {/* Show suggestions only for the first bot message (welcome message) */}
                                    {msg.id === 'welcome' && (
                                        <div className={styles['suggestions']}>
                                            {suggestions.map((suggestion, index) => (
                                                <Tag
                                                    key={index}
                                                    color="blue"
                                                    className={styles['suggestion-tag']}
                                                    onClick={() => handleSendMessage(suggestion)}
                                                >
                                                    {suggestion}
                                                </Tag>
                                            ))}
                                        </div>
                                    )}

                                    {msg.data && msg.data.length > 0 && (
                                        <div className={styles['job-results']}>
                                            {msg.data.map((job) => (
                                                <Card
                                                    key={job.jobId}
                                                    size="small"
                                                    className={styles['job-card']}
                                                    hoverable
                                                    onClick={() => handleViewJob(job)}
                                                >
                                                    <div className={styles['job-card-header']}>
                                                        <Text strong ellipsis>{job.name}</Text>
                                                        {job.score && <Tag color="blue">{(job.score * 100).toFixed(0)}% Match</Tag>}
                                                    </div>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>{job.company}</Text>
                                                    <div style={{ marginTop: 4 }}>
                                                        <Tag color="geekblue">{job.location}</Tag>
                                                        <Tag color="green">{job.salary}</Tag>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {msg.sender === 'user' && <Avatar icon={<UserOutlined />} size="small" className={styles['avatar']} />}
                            </div>
                        ))}

                        {isLoading && (
                            <div className={`${styles['message-wrapper']} ${styles['bot']}`}>
                                <Avatar icon={<RobotOutlined />} size="small" className={styles['avatar']} />
                                <div className={styles['message-content']}>
                                    <div className={styles['bubble']}>
                                        <Spin size="small" /> Đang tìm kiếm...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles['chat-input']}>
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                        />
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<SendOutlined />}
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;
