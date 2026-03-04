import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import { callFetchNotificationsLast24h } from '@/config/api';
import styles from './header.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
    FireOutlined,
    LogoutOutlined,
    ContactsOutlined,
    RiseOutlined,
    CodeOutlined,
    BellOutlined,
    GlobalOutlined,
    DownOutlined,
    ShoppingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Modal, Dropdown, MenuProps, Avatar } from 'antd';
import { INotification } from '@/types/backend';
import { useTranslation } from 'react-i18next';

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
                                    <Link className={styles['nav-link']} to="/job">
                                        {t('header.jobs')} <DownOutlined style={{ fontSize: '10px' }} />
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={styles['nav-link']} to="/company">
                                        {t('header.companies')} <DownOutlined style={{ fontSize: '10px' }} />
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <a className={styles['nav-link']} href="#">
                                        Cẩm nang nghề nghiệp
                                    </a>
                                </li>
                            </ul>

                            {/* 3. RIGHT SECTION */}
                            <div className={styles['right-section']}>
                                {/* Location Selector */}


                                {/* User Auth Section */}
                                {isAuthenticated ? (
                                    <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight" arrow>
                                        <div className={styles['user-section']}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>{user?.name?.charAt(0).toUpperCase()}</Avatar>
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
                                                ? "Đăng ký công ty" // Hiển thị nếu role rỗng hoặc chưa login
                                                : (user?.role?.id === "1" ? "Nhà Tuyển Dụng" : "Quản trị viên")
                                            }
                                        </span>
                                    </div>
                                </Link>

                                {/* Flag / Language */}
                                <Dropdown menu={{ items: languageItems }} placement="bottomRight">
                                    <GlobalOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#fff' }} />
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
