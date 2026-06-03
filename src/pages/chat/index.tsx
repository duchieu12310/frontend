import React, { useEffect, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Spin, message, Badge, Popover } from 'antd';
import { 
    SendOutlined, 
    SearchOutlined, 
    MessageOutlined, 
    BankOutlined, 
    CustomerServiceOutlined,
    PaperClipOutlined, 
    FilePdfOutlined, 
    FileWordOutlined, 
    FileImageOutlined, 
    FileOutlined, 
    DownloadOutlined, 
    ProfileOutlined, 
    ScheduleOutlined,
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';
import { callFetchChatRooms, callFetchChatMessages, callCreateChatRoom, callFetchCompanyPublic, callUploadSingleFile, callFetchResumeByUser } from '@/config/api';
import { NativeStompClient, getWsUrl } from './websocket';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;

interface IUser {
    id: number;
    name: string;
    email: string;
}

interface ICompany {
    id: number;
    name: string;
    logo?: string;
}

interface IChatRoom {
    id: number;
    name: string;
    candidate: IUser;
    company?: ICompany;
    lastMessage?: IMessage;
}

interface IMessage {
    id: number;
    content: string;
    sender: IUser;
    createdAt?: string;
}

const renderMessageContent = (content: string, isMe: boolean) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

    if (content.startsWith('[FILE]')) {
        const parts = content.substring(6).split('|');
        const fileName = parts[0];
        const originalName = parts[1] || fileName;
        const fileUrl = `${backendUrl}/storage/chat/${fileName}`;

        let fileIcon = <FileOutlined style={{ fontSize: '24px', color: isMe ? '#fff' : '#64748b' }} />;
        const lowerName = originalName.toLowerCase();
        if (lowerName.endsWith('.pdf')) {
            fileIcon = <FilePdfOutlined style={{ fontSize: '24px', color: '#ef4444' }} />;
        } else if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
            fileIcon = <FileWordOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />;
        } else if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
            fileIcon = <FileImageOutlined style={{ fontSize: '24px', color: '#10b981' }} />;
        }

        return (
            <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isMe ? '#0f2923' : '#f1f5f9',
                    border: isMe ? '1px solid #14372f' : '1px solid #e2e8f0',
                    color: isMe ? '#fff' : '#1e293b',
                    textDecoration: 'none',
                    minWidth: '220px',
                    maxWidth: '100%',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
            >
                {fileIcon}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ 
                        fontWeight: 500, 
                        fontSize: '13px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        color: isMe ? '#fff' : '#1e293b'
                    }}>
                        {originalName}
                    </div>
                    <div style={{ fontSize: '11px', color: isMe ? '#a7f3d0' : '#64748b' }}>
                        Tập tin đính kèm
                    </div>
                </div>
                <DownloadOutlined style={{ fontSize: '16px', color: isMe ? '#fff' : '#64748b' }} />
            </a>
        );
    }

    if (content.startsWith('[RESUME]')) {
        const parts = content.substring(8).split('|');
        const resumeId = parts[0];
        const jobName = parts[1];
        const status = parts[2];
        const matchScore = parts[3];
        const fileName = parts[4];
        const cvUrl = `${backendUrl}/storage/resume/${fileName}`;

        let statusColor = '#94a3b8';
        let statusText = status;
        if (status === 'APPROVED') { statusColor = '#10b981'; statusText = 'Đồng ý'; }
        else if (status === 'REJECTED') { statusColor = '#ef4444'; statusText = 'Từ chối'; }
        else if (status === 'PENDING') { statusColor = '#f59e0b'; statusText = 'Đang chờ'; }
        else if (status === 'REVIEWING') { statusColor = '#3b82f6'; statusText = 'Đang duyệt'; }

        return (
            <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isMe ? '#0f2923' : '#f8fafc',
                border: isMe ? '1px solid #1e4f44' : '1px solid #e2e8f0',
                minWidth: '260px',
                maxWidth: '100%',
                color: isMe ? '#fff' : '#1e293b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ProfileOutlined style={{ fontSize: '20px', color: '#10b981' }} />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Hồ sơ ứng tuyển</div>
                </div>
                <div style={{ fontSize: '12px', marginBottom: '6px', fontWeight: 500, color: isMe ? '#fff' : '#1e293b' }}>
                    Công việc: {jobName}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', marginBottom: '10px' }}>
                    <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: statusColor + '20', 
                        color: statusColor,
                        fontWeight: 600
                    }}>
                        {statusText}
                    </span>
                    {matchScore && matchScore !== 'null' && matchScore !== '' && (
                        <span style={{ color: isMe ? '#a7f3d0' : '#059669', fontWeight: 500 }}>
                            Điểm AI: {matchScore}%
                        </span>
                    )}
                </div>
                <a 
                    href={cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    Xem CV ứng tuyển
                </a>
            </div>
        );
    }

    if (content.startsWith('[JOB]')) {
        const parts = content.substring(5).split('|');
        const jobId = parts[0];
        const jobName = parts[1];
        const salary = parts[2];
        const location = parts[3];

        return (
            <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: isMe ? '#0f2923' : '#f8fafc',
                border: isMe ? '1px solid #1e4f44' : '1px solid #e2e8f0',
                minWidth: '240px',
                maxWidth: '100%',
                color: isMe ? '#fff' : '#1e293b',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ScheduleOutlined style={{ fontSize: '20px', color: '#eab308' }} />
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Cơ hội việc làm</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: isMe ? '#fff' : '#1e293b' }}>
                    {jobName}
                </div>
                <div style={{ fontSize: '11px', color: isMe ? '#cbd5e1' : '#64748b', marginBottom: '10px' }}>
                    Lương: {salary} | Địa điểm: {location}
                </div>
                <a 
                    href={`/job/${jobId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '6px',
                        borderRadius: '6px',
                        backgroundColor: '#eab308',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    Xem chi tiết công việc
                </a>
            </div>
        );
    }

    return <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>;
};

const ClientChatPage: React.FC = () => {
    const user = useAppSelector((state) => state.account.user);
    const [rooms, setRooms] = useState<IChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<IChatRoom | null>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [hiddenRoomIds, setHiddenRoomIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('jobhunter_hidden_rooms');
        return saved ? JSON.parse(saved) : [];
    });

    const [hiddenMessageIds, setHiddenMessageIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('jobhunter_hidden_messages');
        return saved ? JSON.parse(saved) : [];
    });

    const handleHideRoom = (roomId: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const roomToHide = rooms.find(r => r.id === roomId);
        if (!roomToHide) return;

        // Hide all duplicate rooms belonging to the same company (or admin room if no company)
        const targetRooms = rooms.filter(r => 
            (roomToHide.company && r.company?.id === roomToHide.company.id) ||
            (!roomToHide.company && !r.company)
        );
        const targetIds = targetRooms.map(r => r.id);

        const updated = Array.from(new Set([...hiddenRoomIds, ...targetIds]));
        setHiddenRoomIds(updated);
        localStorage.setItem('jobhunter_hidden_rooms', JSON.stringify(updated));

        const isSameRecipient = selectedRoom && (
            (selectedRoom.company && roomToHide.company && selectedRoom.company.id === roomToHide.company.id) ||
            (!selectedRoom.company && !roomToHide.company)
        );

        if (isSameRecipient) {
            setSelectedRoom(null);
        }
        message.success('Đã ẩn cuộc trò chuyện.');
    };

    const handleHideMessage = (messageId: number) => {
        const updated = [...hiddenMessageIds, messageId];
        setHiddenMessageIds(updated);
        localStorage.setItem('jobhunter_hidden_messages', JSON.stringify(updated));
        message.success('Đã xóa tin nhắn hiển thị.');
    };

    const [userResumes, setUserResumes] = useState<any[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchUserResumes = async () => {
        setLoadingResumes(true);
        try {
            const res = await callFetchResumeByUser();
            if (res && res.data && res.data.result) {
                setUserResumes(res.data.result);
            }
        } catch (error) {
            console.error("fetchUserResumes error:", error);
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!fileExt || !allowedExtensions.includes(fileExt)) {
            message.error("Định dạng file không hỗ trợ. Chỉ cho phép pdf, jpg, jpeg, png, doc, docx");
            return;
        }

        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error("Dung lượng file tối đa là 10MB!");
            return;
        }

        const hide = message.loading("Đang tải file lên...", 0);
        try {
            const res = await callUploadSingleFile(file, "chat");
            hide();
            if (res && res.data && res.data.fileName) {
                const payload = `[FILE]${res.data.fileName}|${file.name}`;
                if (stompClientRef.current && selectedRoom) {
                    stompClientRef.current.send(`/chat/send/${selectedRoom.id}`, {
                        content: payload,
                        senderEmail: user.email
                    });
                    message.success("Đã gửi file đính kèm.");
                }
            } else {
                message.error("Tải file lên thất bại.");
            }
        } catch (e) {
            hide();
            message.error("Có lỗi xảy ra khi tải file lên.");
            console.error(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleSendResume = (resume: any) => {
        if (!stompClientRef.current || !selectedRoom) return;
        const jobName = resume.job?.name || "Không xác định";
        const status = resume.status || "PENDING";
        const matchScore = resume.matchScore !== undefined && resume.matchScore !== null ? resume.matchScore : "";
        const url = resume.url || "";

        const payload = `[RESUME]${resume.id}|${jobName}|${status}|${matchScore}|${url}`;
        stompClientRef.current.send(`/chat/send/${selectedRoom.id}`, {
            content: payload,
            senderEmail: user.email
        });
        message.success("Đã chia sẻ hồ sơ ứng tuyển.");
    };

    const [publicCompanies, setPublicCompanies] = useState<ICompany[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    
    const stompClientRef = useRef<NativeStompClient | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    // Fetch list of rooms
    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const res = await callFetchChatRooms();
            if (res && res.data) {
                setRooms(res.data);
                // Auto select first non-hidden room if available
                const savedHidden = localStorage.getItem('jobhunter_hidden_rooms');
                const hiddenIds: number[] = savedHidden ? JSON.parse(savedHidden) : [];
                const active = res.data.filter((r: any) => !hiddenIds.includes(r.id));
                if (active.length > 0 && !selectedRoom) {
                    setSelectedRoom(active[0]);
                }
            }
        } catch (error) {
            console.error(error);
            message.error('Không thể tải danh sách cuộc trò chuyện.');
        } finally {
            setLoadingRooms(false);
        }
    };

    // Fetch public companies
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const res = await callFetchCompanyPublic("page=1&size=20");
            if (res && res.data && res.data.result) {
                setPublicCompanies(res.data.result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingCompanies(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchCompanies();
    }, []);

    const handleCreateRoom = async (companyId: number | null) => {
        try {
            const res = await callCreateChatRoom(companyId);
            if (res && res.data) {
                const newRoom = res.data;
                const updatedHidden = hiddenRoomIds.filter(id => id !== newRoom.id);
                setHiddenRoomIds(updatedHidden);
                localStorage.setItem('jobhunter_hidden_rooms', JSON.stringify(updatedHidden));
                
                await fetchRooms();
                setSelectedRoom(newRoom);
                message.success('Đã bắt đầu cuộc hội thoại.');
            }
        } catch (e) {
            message.error('Không thể khởi tạo trò chuyện.');
        }
    };

    // Fetch messages when a room is selected
    useEffect(() => {
        if (!selectedRoom) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await callFetchChatMessages(selectedRoom.id);
                if (res && res.data) {
                    setMessages(res.data);
                }
            } catch (error) {
                console.error(error);
                message.error('Không thể tải tin nhắn.');
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        // Connect/Reconnect WebSocket for the selected room
        if (stompClientRef.current) {
            stompClientRef.current.disconnect();
        }

        const client = new NativeStompClient(getWsUrl());
        stompClientRef.current = client;

        client.connect(() => {
            // Subscribe to channel
            client.subscribe(`/chat/receive/${selectedRoom.id}`, (newMsg: IMessage) => {
                setMessages((prev) => {
                    // Prevent duplicates
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                
                // Update last message in the local rooms list
                setRooms((prevRooms) =>
                    prevRooms.map((r) =>
                        r.id === selectedRoom.id ? { ...r, lastMessage: newMsg } : r
                    )
                );
            });
        });

        return () => {
            client.disconnect();
        };
    }, [selectedRoom]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || !selectedRoom || !stompClientRef.current) return;

        const payload = {
            content: inputValue.trim(),
            senderEmail: user.email,
        };

        stompClientRef.current.send(`/chat/send/${selectedRoom.id}`, payload);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const uniqueRooms: IChatRoom[] = [];
    const seenCompanyIds = new Set<number>();
    
    // Sort rooms to ensure the one with the newest activity/message comes first
    const sortedRooms = [...rooms].sort((a, b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    for (const r of sortedRooms) {
        if (r.company) {
            if (!seenCompanyIds.has(r.company.id)) {
                seenCompanyIds.add(r.company.id);
                uniqueRooms.push(r);
            }
        } else {
            uniqueRooms.push(r);
        }
    }

    const activeRooms = uniqueRooms.filter(r => !hiddenRoomIds.includes(r.id));

    const filteredRooms = activeRooms.filter((r) => {
        const roomName = r.company ? r.company.name : 'Hỗ trợ trực tuyến';
        return roomName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredPublicCompanies = publicCompanies.filter((c) => {
        const hasActiveRoom = rooms.some((r) => r.company?.id === c.id && !hiddenRoomIds.includes(r.id));
        if (hasActiveRoom) return false;
        if (searchQuery.trim()) {
            return c.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const hasActiveAdminRoom = rooms.some((r) => !r.company && !hiddenRoomIds.includes(r.id));
    const showAdminSuggestion = !hasActiveAdminRoom && 
        (!searchQuery.trim() || 
         'hỗ trợ trực tuyến'.includes(searchQuery.toLowerCase()) || 
         'admin'.includes(searchQuery.toLowerCase()) || 
         'support'.includes(searchQuery.toLowerCase()));

    return (
        <div style={{ padding: '24px 0', minHeight: 'calc(100vh - 120px)', backgroundColor: '#f8fafc' }}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <div className="container" style={{ maxWidth: 1200, margin: '0 auto', height: '650px', display: 'flex', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
                <Layout style={{ backgroundColor: '#fff', height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>
                    {/* LEFT PANEL: Rooms List */}
                    <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>Cuộc trò chuyện</div>
                            <Input
                                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="Tìm kiếm công ty..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>
                        {loadingRooms ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, height: '80%' }}>
                                <Spin size="medium" />
                            </div>
                        ) : (
                            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                                {/* Active Rooms */}
                                {filteredRooms.length > 0 && (
                                    <>
                                        <div style={{ padding: '12px 16px 6px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Hội thoại của bạn
                                        </div>
                                        <List
                                            dataSource={filteredRooms}
                                            renderItem={(item) => {
                                                const isSelected = selectedRoom?.id === item.id;
                                                const roomTitle = item.company ? item.company.name : 'Hỗ trợ trực tuyến';
                                                return (
                                                    <List.Item
                                                        onClick={() => setSelectedRoom(item)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            backgroundColor: isSelected ? '#e6f0ec' : 'transparent',
                                                            borderLeft: isSelected ? '4px solid #14372f' : '4px solid transparent',
                                                            transition: 'all 0.2s',
                                                            borderBottom: '1px solid #f8fafc',
                                                            position: 'relative'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                                            const btn = e.currentTarget.querySelector('.room-hide-btn') as HTMLElement;
                                                            if (btn) btn.style.opacity = '1';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                                            const btn = e.currentTarget.querySelector('.room-hide-btn') as HTMLElement;
                                                            if (btn) btn.style.opacity = '0';
                                                        }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <Avatar
                                                                    src={item.company?.logo}
                                                                    icon={item.company ? <BankOutlined /> : <CustomerServiceOutlined />}
                                                                    style={{
                                                                        backgroundColor: item.company ? '#e6f0ec' : '#14372f',
                                                                        color: item.company ? '#14372f' : '#fff',
                                                                    }}
                                                                />
                                                            }
                                                            title={
                                                                <div style={{ fontWeight: isSelected ? 600 : 500, color: '#1e293b', fontSize: '14px' }}>
                                                                    {roomTitle}
                                                                </div>
                                                            }
                                                            description={
                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    color: '#64748b',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    maxWidth: '200px'
                                                                }}>
                                                                    {item.lastMessage ? item.lastMessage.content : 'Chưa có tin nhắn'}
                                                                </div>
                                                            }
                                                        />
                                                        <div 
                                                            className="room-hide-btn"
                                                            onClick={(e) => { e.stopPropagation(); handleHideRoom(item.id, e); }}
                                                            style={{
                                                                position: 'absolute',
                                                                right: '12px',
                                                                top: '50%',
                                                                transform: 'translateY(-50%)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.2s',
                                                                color: '#ef4444',
                                                                cursor: 'pointer',
                                                                padding: '4px',
                                                                fontSize: '16px'
                                                            }}
                                                            title="Ẩn cuộc trò chuyện"
                                                        >
                                                            <DeleteOutlined />
                                                        </div>
                                                    </List.Item>
                                                );
                                            }}
                                        />
                                    </>
                                )}

                                {/* Admin Suggestion */}
                                {showAdminSuggestion && (
                                    <div style={{ marginTop: filteredRooms.length > 0 ? '12px' : '0' }}>
                                        <div style={{ padding: '12px 16px 6px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Kênh Hỗ trợ
                                        </div>
                                        <div
                                            onClick={() => handleCreateRoom(null)}
                                            style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderBottom: '1px solid #f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Avatar
                                                icon={<CustomerServiceOutlined />}
                                                style={{
                                                    backgroundColor: '#14372f',
                                                    color: '#fff',
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>
                                                    Hỗ trợ trực tuyến (Admin)
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>
                                                    Bắt đầu chat hỗ trợ &rarr;
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Public Companies */}
                                {filteredPublicCompanies.length > 0 && (
                                    <div style={{ marginTop: (filteredRooms.length > 0 || showAdminSuggestion) ? '12px' : '0' }}>
                                        <div style={{ padding: '12px 16px 6px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {searchQuery ? 'Tìm thấy công ty mới' : 'Gợi ý nhà tuyển dụng'}
                                        </div>
                                        <List
                                            dataSource={filteredPublicCompanies}
                                            renderItem={(item) => (
                                                <List.Item
                                                    onClick={() => handleCreateRoom(item.id)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        borderBottom: '1px solid #f8fafc',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                    }}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                src={item.logo}
                                                                icon={<BankOutlined />}
                                                                style={{
                                                                    backgroundColor: '#e6f0ec',
                                                                    color: '#14372f',
                                                                }}
                                                            />
                                                        }
                                                        title={
                                                            <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>
                                                                {item.name}
                                                            </div>
                                                        }
                                                        description={
                                                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>
                                                                Bắt đầu chat ngay &rarr;
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )}

                                {filteredRooms.length === 0 && !showAdminSuggestion && filteredPublicCompanies.length === 0 && (
                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                                        Không tìm thấy cuộc trò chuyện hay công ty nào.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: Messages stream */}
                    <Content style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#fafbfb' }}>
                        {selectedRoom ? (
                            <>
                                {/* Chat Header */}
                                <div style={{
                                    padding: '14px 20px',
                                    borderBottom: '1px solid #f1f5f9',
                                    backgroundColor: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Avatar
                                        src={selectedRoom.company?.logo}
                                        icon={selectedRoom.company ? <BankOutlined /> : <CustomerServiceOutlined />}
                                        style={{
                                            backgroundColor: selectedRoom.company ? '#e6f0ec' : '#14372f',
                                            color: selectedRoom.company ? '#14372f' : '#fff'
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>
                                            {selectedRoom.company ? selectedRoom.company.name : 'Hỗ trợ trực tuyến'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                                            Đang hoạt động
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Stream */}
                                <div 
                                    ref={messagesContainerRef} 
                                    className="custom-scrollbar" 
                                    style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {loadingMessages ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Spin />
                                        </div>
                                    ) : (
                                        <>
                                             {messages.filter(m => !hiddenMessageIds.includes(m.id)).map((msg) => {
                                                const isMe = msg.sender.email === user.email;
                                                return (
                                                    <div
                                                        key={msg.id}
                                                        className="msg-item-container"
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: isMe ? 'flex-end' : 'flex-start',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            width: '100%'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            const btn = e.currentTarget.querySelector('.msg-delete-btn') as HTMLElement;
                                                            if (btn) btn.style.opacity = '1';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            const btn = e.currentTarget.querySelector('.msg-delete-btn') as HTMLElement;
                                                            if (btn) btn.style.opacity = '0';
                                                        }}
                                                    >
                                                        {!isMe && (
                                                            <Avatar
                                                                size="small"
                                                                src={selectedRoom.company?.logo}
                                                                icon={selectedRoom.company ? <BankOutlined /> : <CustomerServiceOutlined />}
                                                                style={{ backgroundColor: '#e6f0ec', color: '#14372f', alignSelf: 'flex-start' }}
                                                            />
                                                        )}
                                                        {isMe && (
                                                            <div 
                                                                className="msg-delete-btn"
                                                                onClick={() => handleHideMessage(msg.id)}
                                                                style={{
                                                                    opacity: 0,
                                                                    transition: 'opacity 0.2s',
                                                                    color: '#ef4444',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    marginRight: '8px',
                                                                    fontSize: '14px'
                                                                }}
                                                                title="Thu hồi tin nhắn"
                                                            >
                                                                <DeleteOutlined />
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                            {msg.content.startsWith('[FILE]') || msg.content.startsWith('[RESUME]') || msg.content.startsWith('[JOB]') ? (
                                                                renderMessageContent(msg.content, isMe)
                                                            ) : (
                                                                <div style={{
                                                                    padding: '10px 14px',
                                                                    borderRadius: '12px',
                                                                    borderTopRightRadius: isMe ? '2px' : '12px',
                                                                    borderTopLeftRadius: isMe ? '12px' : '2px',
                                                                    backgroundColor: isMe ? '#14372f' : '#fff',
                                                                    color: isMe ? '#fff' : '#1e293b',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                                                    border: isMe ? 'none' : '1px solid #f1f5f9',
                                                                    fontSize: '14px',
                                                                    wordBreak: 'break-word',
                                                                }}>
                                                                    {msg.content}
                                                                </div>
                                                            )}
                                                            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
                                                                {msg.createdAt ? dayjs(msg.createdAt).format('HH:mm') : ''}
                                                            </span>
                                                        </div>
                                                        {!isMe && (
                                                            <div 
                                                                className="msg-delete-btn"
                                                                onClick={() => handleHideMessage(msg.id)}
                                                                style={{
                                                                    opacity: 0,
                                                                    transition: 'opacity 0.2s',
                                                                    color: '#ef4444',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    marginLeft: '8px',
                                                                    fontSize: '14px'
                                                                }}
                                                                title="Xóa tin nhắn hiển thị"
                                                            >
                                                                <DeleteOutlined />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>

                                {/* Chat Input Area */}
                                <div style={{ padding: '16px 20px', backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            style={{ display: 'none' }} 
                                            onChange={handleFileChange} 
                                        />
                                        <Button
                                            icon={<PaperClipOutlined />}
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                borderColor: '#14372f',
                                                color: '#14372f',
                                                borderRadius: '8px',
                                                height: '40px',
                                                width: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                            title="Đính kèm tệp tin"
                                        />
                                        <Popover
                                            content={
                                                <div className="custom-scrollbar" style={{ width: '280px', maxHeight: '300px', overflowY: 'auto' }}>
                                                    <List
                                                        loading={loadingResumes}
                                                        dataSource={userResumes}
                                                        renderItem={(item) => (
                                                            <div
                                                                style={{ 
                                                                    cursor: 'pointer', 
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    transition: 'background 0.2s',
                                                                    borderBottom: '1px solid #f1f5f9'
                                                                }}
                                                                onClick={() => handleSendResume(item)}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <ProfileOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                        <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {item.job?.name || "CV đã ứng tuyển"}
                                                                        </div>
                                                                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                                            Trạng thái: {item.status}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        locale={{ emptyText: 'Bạn chưa ứng tuyển công việc nào.' }}
                                                    />
                                                </div>
                                            }
                                            title={<div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>Chọn hồ sơ ứng tuyển để gửi</div>}
                                            trigger="click"
                                            placement="topRight"
                                            onOpenChange={(visible) => {
                                                if (visible) fetchUserResumes();
                                            }}
                                        >
                                            <Button 
                                                icon={<ProfileOutlined />} 
                                                style={{
                                                    borderColor: '#10b981',
                                                    color: '#10b981',
                                                    borderRadius: '8px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                Gửi CV ứng tuyển
                                            </Button>
                                        </Popover>
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập tin nhắn..."
                                            style={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', height: '40px' }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            style={{
                                                backgroundColor: '#14372f',
                                                borderColor: '#14372f',
                                                borderRadius: '8px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '0 20px',
                                                flexShrink: 0
                                            }}
                                        >
                                            Gửi
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                height: '100%', 
                                padding: '24px 20px', 
                                overflowY: 'auto',
                                backgroundColor: '#f8fafc' 
                            }}>
                                {/* Welcome Banner */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #14372f 0%, #1e4f44 100%)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    color: '#fff',
                                    marginBottom: '20px',
                                    boxShadow: '0 4px 12px rgba(20, 55, 47, 0.1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                                        Cổng kết nối JobHunter Chat
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '85%', lineHeight: '1.5' }}>
                                        Trò chuyện trực tiếp với nhà tuyển dụng để cập nhật thông tin ứng tuyển nhanh chóng hoặc liên hệ hỗ trợ kỹ thuật từ quản trị viên.
                                    </p>
                                </div>

                                {/* Quick Support Card */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    padding: '14px 16px',
                                    border: '1px solid #e2e8f0',
                                    marginBottom: '20px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e6f0ec',
                                            color: '#14372f',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px'
                                        }}>
                                            <CustomerServiceOutlined />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>Hỗ trợ kỹ thuật trực tuyến</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Giải đáp các thắc mắc về tài khoản và CV</div>
                                        </div>
                                    </div>
                                    <Button 
                                        type="primary"
                                        style={{ 
                                            backgroundColor: '#14372f', 
                                            borderColor: '#14372f',
                                            borderRadius: '6px',
                                            fontWeight: 500,
                                            fontSize: '13px'
                                        }}
                                        onClick={() => handleCreateRoom(null)}
                                    >
                                        Bắt đầu Chat
                                    </Button>
                                </div>

                                {/* Companies Grid Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                                        Nhà tuyển dụng nổi bật
                                    </h3>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                        Tìm thấy {publicCompanies.length} công ty
                                    </span>
                                </div>

                                {/* Companies Grid */}
                                {loadingCompanies ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                        <Spin />
                                    </div>
                                ) : publicCompanies.length === 0 ? (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '30px 20px', 
                                        backgroundColor: '#fff', 
                                        borderRadius: '10px',
                                        border: '1px dashed #cbd5e1'
                                    }}>
                                        <BankOutlined style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '8px' }} />
                                        <div style={{ color: '#64748b', fontSize: '13px' }}>Không tìm thấy công ty tuyển dụng nào.</div>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                        gap: '12px',
                                        paddingBottom: '20px'
                                    }}>
                                        {publicCompanies.map((comp) => {
                                            const hasActiveRoom = rooms.some(r => r.company?.id === comp.id);
                                            return (
                                                <div 
                                                    key={comp.id}
                                                    style={{
                                                        backgroundColor: '#fff',
                                                        borderRadius: '10px',
                                                        padding: '14px',
                                                        border: '1px solid #e2e8f0',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        height: '160px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                                                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.04)';
                                                        e.currentTarget.style.borderColor = '#14372f';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                    }}
                                                    onClick={() => {
                                                        if (hasActiveRoom) {
                                                            const room = rooms.find(r => r.company?.id === comp.id);
                                                            if (room) setSelectedRoom(room);
                                                        } else {
                                                            handleCreateRoom(comp.id);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                                        <Avatar 
                                                            src={comp.logo} 
                                                            icon={<BankOutlined />}
                                                            size={44}
                                                            style={{ 
                                                                backgroundColor: '#e6f0ec', 
                                                                color: '#14372f',
                                                                marginBottom: '8px',
                                                                border: '1px solid #f1f5f9'
                                                            }}
                                                        />
                                                        <div style={{ 
                                                            fontWeight: 600, 
                                                            color: '#1e293b', 
                                                            fontSize: '13px',
                                                            textAlign: 'center',
                                                            width: '100%',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {comp.name}
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        type="default" 
                                                        size="small"
                                                        style={{ 
                                                            width: '100%',
                                                            borderRadius: '6px',
                                                            color: '#14372f',
                                                            borderColor: '#14372f',
                                                            fontSize: '11px',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {hasActiveRoom ? 'Tiếp tục Chat' : 'Nhắn tin ngay'}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </Content>
                </Layout>
            </div>
        </div>
    );
};

export default ClientChatPage;
