import React, { useEffect, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Spin, message, Popover } from 'antd';
import { 
    SendOutlined, 
    SearchOutlined, 
    MessageOutlined, 
    UserOutlined,
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
import { callFetchChatRooms, callFetchChatMessages, callFetchResume, callCreateChatRoom, callUploadSingleFile, callFetchJob } from '@/config/api';
import { NativeStompClient, getWsUrl } from '@/pages/chat/websocket';
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

const AdminChatPage: React.FC = () => {
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

        // Hide all rooms belonging to this candidate
        const candidateRoomIds = rooms
            .filter(r => r.candidate?.id === roomToHide.candidate?.id)
            .map(r => r.id);

        const updated = Array.from(new Set([...hiddenRoomIds, ...candidateRoomIds]));
        setHiddenRoomIds(updated);
        localStorage.setItem('jobhunter_hidden_rooms', JSON.stringify(updated));

        if (selectedRoom && selectedRoom.candidate?.id === roomToHide.candidate?.id) {
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

    const [companyJobs, setCompanyJobs] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [applicants, setApplicants] = useState<IUser[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const stompClientRef = useRef<NativeStompClient | null>(null);

    const fetchCompanyJobs = async () => {
        if (!user.company?.id) return;
        setLoadingJobs(true);
        try {
            const res = await callFetchJob(`filter=company.id:${user.company.id}&size=50`);
            if (res && res.data && res.data.result) {
                setCompanyJobs(res.data.result);
            }
        } catch (error) {
            console.error("fetchCompanyJobs error:", error);
        } finally {
            setLoadingJobs(false);
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

    const handleSendJob = (job: any) => {
        if (!stompClientRef.current || !selectedRoom) return;
        const jobName = job.name || "Không xác định";
        const salary = job.salary !== undefined && job.salary !== null ? job.salary : "Cạnh tranh";
        const location = job.location || "Nhiều địa điểm";

        const payload = `[JOB]${job.id}|${jobName}|${salary}|${location}`;
        stompClientRef.current.send(`/chat/send/${selectedRoom.id}`, {
            content: payload,
            senderEmail: user.email
        });
        message.success("Đã chia sẻ cơ hội việc làm.");
    };

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

    // Fetch unique applicants who applied to jobs of the employer's company
    const fetchApplicants = async () => {
        setLoadingApplicants(true);
        try {
            const res = await callFetchResume("page=1&size=100");
            if (res && res.data && res.data.result) {
                // Extract unique candidate users who applied
                const uniqueCandidatesMap = new Map<number, IUser>();
                res.data.result.forEach((resume) => {
                    if (resume.user) {
                        uniqueCandidatesMap.set(resume.user.id, resume.user);
                    }
                });
                setApplicants(Array.from(uniqueCandidatesMap.values()));
            }
        } catch (error) {
            console.error("fetchApplicants error: ", error);
        } finally {
            setLoadingApplicants(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchApplicants();
    }, []);

    const handleCreateRoom = async (candidateId: number) => {
        try {
            const companyId = user.company?.id || null;
            const res = await callCreateChatRoom(companyId, candidateId);
            if (res && res.data) {
                const newRoom = res.data;
                const updatedHidden = hiddenRoomIds.filter(id => id !== newRoom.id);
                setHiddenRoomIds(updatedHidden);
                localStorage.setItem('jobhunter_hidden_rooms', JSON.stringify(updatedHidden));
                
                await fetchRooms();
                setSelectedRoom(newRoom);
                message.success('Đã bắt đầu cuộc hội thoại với ứng viên.');
            }
        } catch (e) {
            message.error('Không thể khởi tạo trò chuyện với ứng viên.');
        }
    };

    // Fetch messages when room is selected
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

        // Connect/Reconnect WebSocket for selected room
        if (stompClientRef.current) {
            stompClientRef.current.disconnect();
        }

        const client = new NativeStompClient(getWsUrl());
        stompClientRef.current = client;

        client.connect(() => {
            client.subscribe(`/chat/receive/${selectedRoom.id}`, (newMsg: IMessage) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });

                // Update last message in local rooms list
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

    // Scroll to bottom
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
    const seenCandidateIds = new Set<number>();
    
    // Sort rooms to ensure the one with the newest activity/message comes first
    const sortedRooms = [...rooms].sort((a, b) => {
        const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    for (const r of sortedRooms) {
        if (r.candidate) {
            if (!seenCandidateIds.has(r.candidate.id)) {
                seenCandidateIds.add(r.candidate.id);
                uniqueRooms.push(r);
            }
        } else {
            uniqueRooms.push(r);
        }
    }

    const activeRooms = uniqueRooms.filter(r => !hiddenRoomIds.includes(r.id));

    const filteredRooms = activeRooms.filter((r) => {
        const roomLabel = r.candidate ? r.candidate.name : 'Ứng viên ẩn danh';
        return roomLabel.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredApplicants = applicants.filter((app) => {
        const hasActiveRoom = rooms.some((r) => r.candidate?.id === app.id && !hiddenRoomIds.includes(r.id));
        if (hasActiveRoom) return false;
        
        if (searchQuery.trim()) {
            return app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   app.email.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <div style={{ padding: '0px', height: 'calc(100vh - 100px)', display: 'flex', backgroundColor: '#f8fafc' }}>
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
            <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#fff' }}>
                <Layout style={{ backgroundColor: '#fff', height: '100%' }}>
                    {/* LEFT PANEL: Rooms List */}
                    <Sider width={320} theme="light" style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>Ứng viên nhắn tin</div>
                            <Input
                                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                                placeholder="Tìm kiếm ứng viên..."
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
                            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, height: 'calc(100% - 90px)' }}>
                                {/* Active chat list */}
                                {filteredRooms.length > 0 && (
                                    <>
                                        <div style={{ padding: '12px 16px 6px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Ứng viên đang chat
                                        </div>
                                        <List
                                            dataSource={filteredRooms}
                                            renderItem={(item) => {
                                                const isSelected = selectedRoom?.id === item.id;
                                                const roomTitle = item.candidate ? item.candidate.name : 'Ứng viên ẩn danh';
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
                                                                    icon={<UserOutlined />}
                                                                    style={{
                                                                        backgroundColor: '#14372f',
                                                                        color: '#fff',
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
                                                            onClick={(e) => { e.stopPropagation(); handleHideRoom(item.id); }}
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

                                {/* Applied candidates suggestion */}
                                {filteredApplicants.length > 0 && (
                                    <div style={{ marginTop: filteredRooms.length > 0 ? '12px' : '0' }}>
                                        <div style={{ padding: '12px 16px 6px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {searchQuery ? 'Tìm thấy ứng viên mới' : 'Ứng viên đã ứng tuyển'}
                                        </div>
                                        <List
                                            dataSource={filteredApplicants}
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
                                                                icon={<UserOutlined />}
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
                                                                Bắt đầu chat &rarr;
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                )}

                                {filteredRooms.length === 0 && filteredApplicants.length === 0 && (
                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                                        Không tìm thấy cuộc trò chuyện hay ứng viên nào.
                                    </div>
                                )}
                            </div>
                        )}
                    </Sider>

                    {/* RIGHT PANEL: Messages stream */}
                    <Content style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fafbfb' }}>
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
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: '#14372f',
                                            color: '#fff'
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>
                                            {selectedRoom.candidate ? selectedRoom.candidate.name : 'Ứng viên ẩn danh'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                            Email: {selectedRoom.candidate ? selectedRoom.candidate.email : ''}
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
                                                                icon={<UserOutlined />}
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
                                                        loading={loadingJobs}
                                                        dataSource={companyJobs}
                                                        renderItem={(item) => (
                                                            <div
                                                                style={{ 
                                                                    cursor: 'pointer', 
                                                                    padding: '8px 12px',
                                                                    borderRadius: '6px',
                                                                    transition: 'background 0.2s',
                                                                    borderBottom: '1px solid #f1f5f9'
                                                                }}
                                                                onClick={() => handleSendJob(item)}
                                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                            >
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <ScheduleOutlined style={{ color: '#eab308', fontSize: '16px' }} />
                                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                        <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                            {item.name}
                                                                        </div>
                                                                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                                            Lương: {item.salary} | {item.location}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        locale={{ emptyText: 'Công ty chưa đăng tuyển công việc nào.' }}
                                                    />
                                                </div>
                                            }
                                            title={<div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>Chọn công việc để gửi</div>}
                                            trigger="click"
                                            placement="topRight"
                                            onOpenChange={(visible) => {
                                                if (visible) fetchCompanyJobs();
                                            }}
                                        >
                                            <Button 
                                                icon={<ScheduleOutlined />} 
                                                style={{
                                                    borderColor: '#eab308',
                                                    color: '#eab308',
                                                    borderRadius: '8px',
                                                    height: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}
                                            >
                                                Gửi công việc
                                            </Button>
                                        </Popover>
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Nhập phản hồi..."
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
                                            Trả lời
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
                                        Cổng kết nối JobHunter Chat (Nhà tuyển dụng)
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', maxWidth: '85%', lineHeight: '1.5' }}>
                                        Trò chuyện trực tiếp với các ứng viên đã nộp đơn tuyển dụng vào công ty của bạn để hỗ trợ thông tin và xếp lịch phỏng vấn nhanh chóng.
                                    </p>
                                </div>

                                {/* Applicants Grid Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                                        Ứng viên đã nộp đơn ứng tuyển
                                    </h3>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                        Tìm thấy {applicants.length} ứng viên
                                    </span>
                                </div>

                                {/* Applicants Grid */}
                                {loadingApplicants ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                        <Spin />
                                    </div>
                                ) : applicants.length === 0 ? (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '30px 20px', 
                                        backgroundColor: '#fff', 
                                        borderRadius: '10px',
                                        border: '1px dashed #cbd5e1'
                                    }}>
                                        <MessageOutlined style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '8px' }} />
                                        <div style={{ color: '#64748b', fontSize: '13px' }}>Chưa có ứng viên nào nộp đơn ứng tuyển.</div>
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                        gap: '12px',
                                        paddingBottom: '20px'
                                    }}>
                                        {applicants.map((cand) => {
                                            const hasActiveRoom = rooms.some(r => r.candidate?.id === cand.id);
                                            return (
                                                <div 
                                                    key={cand.id}
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
                                                            const room = rooms.find(r => r.candidate?.id === cand.id);
                                                            if (room) setSelectedRoom(room);
                                                        } else {
                                                            handleCreateRoom(cand.id);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                                        <Avatar 
                                                            icon={<UserOutlined />}
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
                                                            {cand.name}
                                                        </div>
                                                        <div style={{ 
                                                            fontSize: '11px', 
                                                            color: '#64748b',
                                                            textAlign: 'center',
                                                            width: '100%',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {cand.email}
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

export default AdminChatPage;
