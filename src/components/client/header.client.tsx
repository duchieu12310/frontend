import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import { callFetchNotificationsLast24h } from '@/config/api'; // API lấy notifications
import './Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
    FireOutlined,
    LogoutOutlined,
    ContactsOutlined,
    RiseOutlined,
    CodeOutlined,
    BellOutlined
} from '@ant-design/icons';
import { Modal } from 'antd';
import { INotification } from '@/types/backend'; // bổ sung interface Notification

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);

    const [current, setCurrent] = useState('home');
    const [openManageAccount, setOpenManageAccount] = useState(false);

    // Thông báo
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [visibleNotifications, setVisibleNotifications] = useState<INotification[]>([]);
    const [showCount, setShowCount] = useState(5);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (isAuthenticated) {
                try {
                    const res = await callFetchNotificationsLast24h();
                    if (res.statusCode === 200 && res.data) {
                        let myNotifications = res.data;
                        const isAdmin = user?.role?.permissions?.length > 0;

                        if (!isAdmin) {
                            const userEmail = user?.email;
                            myNotifications = myNotifications.filter(
                                noti => noti.createdBy === userEmail || noti.updatedBy === userEmail
                            );
                        }

                        setNotifications(myNotifications);
                        setVisibleNotifications(myNotifications.slice(0, showCount));
                    }
                } catch (error) {
                    console.error('Lấy notifications lỗi:', error);
                }
            } else {
                setNotifications([]);
                setVisibleNotifications([]);
            }
        };
        fetchNotifications();
    }, [isAuthenticated, user, showCount]);

    const handleLoadMore = () => {
        setShowCount(prev => prev + 10);
        setVisibleNotifications(notifications.slice(0, showCount + 10));
    };

    const handleRegisterCompanyClick = () => {
        if (!isAuthenticated) {
            Modal.warning({
                title: 'Bạn chưa đăng nhập hệ thống',
                content: (
                    <div>
                        Vui lòng đăng nhập để <b>Đăng ký công ty</b>.
                    </div>
                ),
                okText: 'Đăng nhập nhanh',
                onOk: () => navigate(`/login?callback=/register-company`),
            });
        } else {
            navigate('/register-company');
        }
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            navigate('/');
        }
    };

    return (
        <>
            {/* NAVBAR */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm fixed-top">
                <div className="container-fluid px-4">
                    <span
                        className="navbar-brand fw-bold fs-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <RiseOutlined className="me-2" />
                        Job<span className="text-warning">Entry</span>
                    </span>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasNavbar"
                        aria-controls="offcanvasNavbar"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Desktop menu */}
                    <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
                        <ul className="navbar-nav mb-2 mb-lg-0 fw-semibold">
                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/' ? 'active' : ''}`} to="/">
                                    <CodeOutlined className="me-1" /> TRANG CHỦ
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/job' ? 'active' : ''}`} to="/job">
                                    <FireOutlined className="me-1" /> VIỆC LÀM
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/company' ? 'active' : ''}`} to="/company">
                                    <RiseOutlined className="me-1" /> CÔNG TY
                                </Link>
                            </li>

                            {(!user?.role || user.role?.permissions?.length === 0) && (
                                <li className="nav-item">
                                    <span
                                        className={`nav-link ${current === '/register-company' ? 'active' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={handleRegisterCompanyClick}
                                    >
                                        <ContactsOutlined className="me-1" /> ĐĂNG KÝ CÔNG TY
                                    </span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Desktop login/account */}
                    <div className="d-none d-lg-flex align-items-center">
                        {isAuthenticated && (
                            <div className="dropdown me-3">
                                <button className="btn btn-light position-relative" type="button" data-bs-toggle="dropdown">
                                    <BellOutlined style={{ fontSize: 18 }} />
                                    {notifications.length > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {visibleNotifications.length === 0 && <li className="dropdown-item text-center">Không có thông báo</li>}

                                    {visibleNotifications.map((noti, index) => (
                                        <li key={index} className="dropdown-item border-bottom py-2">
                                            <div className="fw-semibold">{noti.message}</div>
                                            <small className="text-muted">{noti.updatedAt || noti.createdAt}</small>
                                        </li>
                                    ))}

                                    {visibleNotifications.length < notifications.length && (
                                        <li className="text-center mt-2">
                                            <button className="btn btn-link p-0" onClick={handleLoadMore}>
                                                Xem thêm
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {isAuthenticated ? (
                            <div className="dropdown">
                                <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    {user?.name}
                                </button>

                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={() => setOpenManageAccount(true)}>
                                            <ContactsOutlined className="me-2" />
                                            Quản lý tài khoản
                                        </button>
                                    </li>

                                    {user.role?.permissions?.length > 0 && (
                                        <li>
                                            <Link to="/admin" className="dropdown-item">
                                                <FireOutlined className="me-2" />
                                                Trang quản trị
                                            </Link>
                                        </li>
                                    )}

                                    <li><hr className="dropdown-divider" /></li>

                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <LogoutOutlined className="me-2" />
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-light fw-semibold px-4">
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBILE */}
            <div className="offcanvas offcanvas-end text-bg-success" tabIndex={-1} id="offcanvasNavbar">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title fw-bold">
                        <RiseOutlined className="me-2" /> JobEntry
                    </h5>
                    <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
                </div>

                <div className="offcanvas-body">
                    <ul className="navbar-nav fw-semibold">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/">
                                <CodeOutlined className="me-2" /> TRANG CHỦ
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/job">
                                <FireOutlined className="me-2" /> VIỆC LÀM
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/company">
                                <RiseOutlined className="me-2" /> CÔNG TY
                            </Link>
                        </li>

                        {(!user?.role || user.role?.permissions?.length === 0) && (
                            <li className="nav-item">
                                <button className="nav-link text-white btn btn-link" onClick={handleRegisterCompanyClick}>
                                    <ContactsOutlined className="me-2" /> ĐĂNG KÝ CÔNG TY
                                </button>
                            </li>
                        )}

                        <hr />

                        {isAuthenticated ? (
                            <>
                                <li className="nav-item mb-2">
                                    <span className="text-white fw-bold">🔔 {notifications.length} thông báo</span>
                                </li>

                                <li className="nav-item">
                                    <button className="nav-link text-white btn btn-link" onClick={() => setOpenManageAccount(true)}>
                                        <ContactsOutlined className="me-2" />
                                        Quản lý tài khoản
                                    </button>
                                </li>

                                {user.role?.permissions?.length > 0 && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/admin">
                                            <FireOutlined className="me-2" /> Trang quản trị
                                        </Link>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
                                        <LogoutOutlined className="me-2" /> Đăng xuất
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link to="/login" className="btn btn-light fw-semibold w-100 mt-2">
                                    Đăng nhập
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <ManageAccount open={openManageAccount} onClose={setOpenManageAccount} />
        </>
    );
};

export default Header;
