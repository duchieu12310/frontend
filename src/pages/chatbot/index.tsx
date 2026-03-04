import { useState, useRef, useEffect } from 'react';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { callChatBotSearch } from '@/config/api';
import styles from './chatbot.module.scss';
import { Spin, Card, Tag, Typography, Avatar, Button } from 'antd';
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
    timestamp: number;
    data?: IJobResult[];
}

const ChatBotPage = () => {
    const [messages, setMessages] = useState<IMessage[]>([
        {
            id: 'welcome',
            text: 'Xin chào! Tôi là trợ lý AI chuyên nghiệp của JobHunter. Tôi có thể giúp bạn tìm kiếm việc làm, thông tin công ty và giải đáp thắc mắc về hệ thống. Hãy chọn một câu hỏi mẫu hoặc nhập câu hỏi của bạn:',
            sender: 'bot',
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const suggestions = [
        "Tìm việc Java Spring Boot tại Hà Nội",
        "Tuyển dụng ReactJS lương trên 15 triệu",
        "Công việc Tester không yêu cầu kinh nghiệm",
        "Việc làm Python tại TP.HCM",
        "Tìm việc BA lương cao",
        "Tuyển dụng DevOps tại Đà Nẵng"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (msgText?: string) => {
        const textToSend = msgText || input.trim();
        if (!textToSend || isLoading) return;

        const userMessage: IMessage = {
            id: Date.now().toString(),
            text: textToSend,
            sender: 'user',
            timestamp: Date.now()
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
                        timestamp: Date.now(),
                        data: jobs
                    };
                    setMessages(prev => [...prev, botMessage]);
                } else {
                    const botMessage: IMessage = {
                        id: (Date.now() + 1).toString(),
                        text: "Rất tiếc, tôi không tìm thấy công việc nào phù hợp với yêu cầu của bạn. Bạn hãy thử từ khóa khác nhé!",
                        sender: 'bot',
                        timestamp: Date.now()
                    };
                    setMessages(prev => [...prev, botMessage]);
                }
            } else {
                const errorMessage: IMessage = {
                    id: (Date.now() + 1).toString(),
                    text: "Hệ thống đang bận, vui lòng thử lại sau.",
                    sender: 'bot',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error(error);
            const errorMessage: IMessage = {
                id: (Date.now() + 1).toString(),
                text: "Đã xảy ra lỗi kết nối.",
                sender: 'bot',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewJob = (job: IJobResult) => {
        const slug = convertSlug(job.name);
        navigate(`/job/${slug}?id=${job.jobId}`);
    };

    return (
        <div className={styles['chat-page-container']}>
            <div className={styles['chat-box']}>
                <div className={styles['chat-header']}>
                    <h2><RobotOutlined /> JobHunter AI Assistant</h2>
                    <p>Hỏi đáp thông minh về việc làm và công ty</p>
                </div>

                <div className={styles['chat-messages']}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`${styles['message-wrapper']} ${styles[msg.sender]}`}>
                            {msg.sender === 'bot' && <Avatar icon={<RobotOutlined />} size="large" className={styles['avatar']} />}

                            <div className={styles['message-content']}>
                                <div className={styles['bubble']}>
                                    {msg.text}
                                </div>

                                {msg.id === messages[0].id && msg.sender === 'bot' && (
                                    <div className={styles['suggestions']}>
                                        {suggestions.map((suggestion, index) => (
                                            <Tag
                                                key={index}
                                                color="geekblue"
                                                className={styles['suggestion-tag']}
                                                onClick={() => handleSendMessage(suggestion)}
                                            >
                                                {suggestion}
                                            </Tag>
                                        ))}
                                    </div>
                                )}

                                {msg.data && msg.data.length > 0 && (
                                    <div className={styles['job-results-grid']}>
                                        {msg.data.map((job) => (
                                            <Card
                                                key={job.jobId}
                                                size="small"
                                                className={styles['job-card']}
                                                hoverable
                                                onClick={() => handleViewJob(job)}
                                            >
                                                <div className={styles['job-card-header']}>
                                                    <Text strong ellipsis style={{ fontSize: 16 }}>{job.name}</Text>
                                                    {job.score && <Tag color="blue">{(job.score * 100).toFixed(0)}% Match</Tag>}
                                                </div>
                                                <Text type="secondary" style={{ display: 'block' }}>{job.company}</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Tag color="geekblue">{job.location}</Tag>
                                                    <Tag color="green">{job.salary}</Tag>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {msg.sender === 'user' && <Avatar icon={<UserOutlined />} size="large" className={styles['avatar']} />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className={`${styles['message-wrapper']} ${styles['bot']}`}>
                            <Avatar icon={<RobotOutlined />} size="large" className={styles['avatar']} />
                            <div className={styles['message-content']}>
                                <div className={styles['bubble']}>
                                    <Spin size="small" /> Đang tìm kiếm...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className={styles['chat-input-area']}>
                    <input
                        type="text"
                        placeholder="Nhập câu hỏi của bạn tại đây... (Ví dụ: Python developer, TP.HCM, lương > 20tr)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button onClick={() => handleSendMessage()} disabled={!input.trim() || isLoading}>
                        <SendOutlined />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBotPage;
