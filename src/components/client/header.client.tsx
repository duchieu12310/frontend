import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import { callFetchNotificationsLast24h, callMarkNotificationAsRead } from '@/config/api';
import styles from './header.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
    FireOutlined,
    LogoutOutlined,
    ContactsOutlined,
    RiseOutlined,
    BellOutlined,
    GlobalOutlined,
    DownOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { Modal, Dropdown, MenuProps, Avatar, Badge, Popover, List, Button } from 'antd';
import { INotification } from '@/types/backend';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);

    const [openManageAccount, setOpenManageAccount] = useState(false);
    const [notifications, setNotifications] = useState<INotification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (isAuthenticated) {
                try {
                    const res = await callFetchNotificationsLast24h();
                    if (res?.data) {
                        setNotifications(res.data);
                    }
                } catch (error) {
                    // console.error(error);
                }
            }
        };
        fetchNotifications();
    }, [isAuthenticated]);

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            navigate('/');
        }
    };

    const handleNotificationClick = async (item: any) => {
        if (item.id && item.status === 1) {
            try {
                await callMarkNotificationAsRead(item.id);
                // Cập nhật trạng thái hiển thị
                setNotifications(prev => 
                    prev.map(n => n.id === item.id ? { ...n, status: 2 } : n)
                );
            } catch (err) {
                console.error(err);
            }
        }
        if (item.resourceName === "RESUME") {
            navigate("/applied-jobs");
        } else if (item.resourceName === "JOB") {
            navigate("/job");
        } else if (item.resourceName === "COMPANY") {
            navigate("/company");
        }
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const languageItems: MenuProps['items'] = [
        { key: 'vi', label: <span onClick={() => changeLanguage('vi')}>🇻🇳 Tiếng Việt</span> },
        { key: 'en', label: <span onClick={() => changeLanguage('en')}>🇺🇸 English</span> },
    ];

    const userDropdownItems: MenuProps['items'] = [
        {
            key: 'welcome',
            label: <div style={{ fontWeight: 'bold' }}>{t('header.welcome')}, {user?.name}</div>,
            disabled: true,
        },
        { key: 'cv', label: <Link to="/cv">CV của tôi</Link>, icon: <FileTextOutlined /> },
        { key: 'applied-jobs', label: <Link to="/applied-jobs">{t('header.history')}</Link>, icon: <ClockCircleOutlined /> },
        { key: 'manage', label: 'Quản lý tài khoản', icon: <ContactsOutlined />, onClick: () => setOpenManageAccount(true) },
        ...(user?.role?.permissions?.length ? [{ key: 'admin', label: <Link to="/admin">{t('header.admin')}</Link>, icon: <FireOutlined /> }] : []),
        { type: 'divider' },
        { key: 'logout', label: t('header.logout'), icon: <LogoutOutlined />, onClick: handleLogout, danger: true },
    ];

    return (
        <>
            <div className={styles['header-container']}>
                <div className="container-fluid px-4">
                    <nav className="navbar navbar-expand-lg">
                        {/* 1. LOGO */}
                        <div className={styles.brand} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                            <RiseOutlined className="me-2" style={{ fontSize: '32px' }} />
                            <div style={{ lineHeight: '1.1' }}>
                                <div>JobEntry</div>
                                <div style={{ fontSize: '10px', fontWeight: '400', opacity: 0.8, letterSpacing: '1px' }}>NHANH HƠN. DỄ DÀNG HƠN</div>
                            </div>
                        </div>

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarContent">
                            {/* 2. MENU LEFT */}
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
                                <li className="nav-item">
                                    <Link className={`${styles['nav-link']} ${location.pathname.startsWith('/job') ? styles['active'] : ''}`} to="/job">
                                        {t('header.jobs')} <DownOutlined style={{ fontSize: '10px' }} />
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`${styles['nav-link']} ${location.pathname.startsWith('/company') ? styles['active'] : ''}`} to="/company">
                                        {t('header.companies')} <DownOutlined style={{ fontSize: '10px' }} />
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`${styles['nav-link']} ${location.pathname.startsWith('/blog') ? styles['active'] : ''}`} to="/blog">
                                        Cẩm nang nghề nghiệp
                                    </Link>
                                </li>
                            </ul>

                            {/* 3. RIGHT SECTION */}
                            <div className={styles['right-section']}>
                                {isAuthenticated && (
                                    <Popover
                                        content={
                                            <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
                                                <div style={{ fontWeight: 'bold', paddingBottom: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>Thông báo mới</span>
                                                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>24 giờ qua</span>
                                                </div>
                                                {notifications.length === 0 ? (
                                                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8' }}>Không có thông báo mới</div>
                                                ) : (
                                                    <List
                                                        dataSource={notifications}
                                                        renderItem={(item: any) => (
                                                            <List.Item 
                                                                style={{ 
                                                                    padding: '10px 8px', 
                                                                    cursor: 'pointer', 
                                                                    borderRadius: '4px', 
                                                                    transition: 'background 0.2s',
                                                                    backgroundColor: item.status === 1 ? '#e6f0ec' : 'transparent'
                                                                }}
                                                                onClick={() => handleNotificationClick(item)}
                                                                onMouseEnter={(e) => {
                                                                    if (item.status !== 1) e.currentTarget.style.backgroundColor = '#f1f5f9';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (item.status !== 1) e.currentTarget.style.backgroundColor = 'transparent';
                                                                }}
                                                            >
                                                                <List.Item.Meta
                                                                    title={
                                                                        <span style={{ 
                                                                            fontSize: '13px', 
                                                                            fontWeight: item.status === 1 ? 700 : 500, 
                                                                            color: '#1e293b' 
                                                                        }}>
                                                                            {item.message}
                                                                        </span>
                                                                    }
                                                                    description={
                                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                                            {dayjs(item.updatedAt || item.createdAt).format("DD-MM-YYYY HH:mm")}
                                                                        </div>
                                                                    }
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        }
                                        trigger="click"
                                        placement="bottomRight"
                                    >
                                        <Badge count={notifications.filter(n => n.status === 1).length} size="small" style={{ backgroundColor: '#10b981' }}>
                                            <Button
                                                type="text"
                                                icon={<BellOutlined style={{ fontSize: '20px', color: '#64748b' }} />}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', marginRight: '8px' }}
                                            />
                                        </Badge>
                                    </Popover>
                                )}
                                {isAuthenticated && (
                                    <Button
                                        type="text"
                                        icon={<MessageOutlined style={{ fontSize: '20px', color: '#64748b' }} />}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', marginRight: '8px' }}
                                        onClick={() => navigate('/chat')}
                                    />
                                )}
                                {/* User Auth Section */}
                                {isAuthenticated ? (
                                    <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
                                        <div className={styles['user-section']}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Avatar style={{ backgroundColor: '#e6f0ec', color: '#14372f', fontWeight: 'bold' }}>
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <div className={styles['label']}>Người tìm việc</div>
                                                    <div className={styles['action']}>{user?.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Dropdown>
                                ) : (
                                    <div className={styles['user-section']} onClick={() => navigate('/login')}>
                                        <div className={styles['label']}>Người tìm việc</div>
                                        <div className={styles['action']}>{t('header.register')} / {t('header.login')}</div>
                                    </div>
                                )}

                                <Link
                                    to={(!isAuthenticated || !user?.role?.id) ? "/register-company" : "/admin"}
                                    className={styles['employer-section']}
                                >
                                    <ShoppingOutlined className={styles['icon-bag']} />
                                    <div className={styles['text-group']}>
                                        <span className={styles['sub']}>DÀNH CHO</span>
                                        <span className={styles['main']}>
                                            {(!isAuthenticated || !user?.role?.id)
                                                ? "Đăng ký công ty"
                                                : (user?.role?.id === "1" ? "Nhà Tuyển Dụng" : "Quản trị viên")
                                            }
                                        </span>
                                    </div>
                                </Link>

                                {/* Flag / Language */}
                                <Dropdown menu={{ items: languageItems }} placement="bottomRight">
                                    <GlobalOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                                </Dropdown>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>

            <ManageAccount open={openManageAccount} onClose={setOpenManageAccount} />
        </>
    );
};

export default Header;
