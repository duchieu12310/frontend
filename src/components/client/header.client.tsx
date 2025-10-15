import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import './Header.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import {
    FireOutlined,
    LogoutOutlined,
    ContactsOutlined,
    RiseOutlined,
    CodeOutlined
} from '@ant-design/icons';
import { Modal, message } from 'antd';

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [current, setCurrent] = useState('home');
    const [openManageAccount, setOpenManageAccount] = useState(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location]);

    // ✅ Callback khi nhấn "REGISTER COMPANY"
    const handleRegisterCompanyClick = () => {
        if (!isAuthenticated) {
            Modal.warning({
                title: 'Bạn chưa đăng nhập hệ thống',
                content: (
                    <div>
                        Vui lòng đăng nhập để có thể <b>"Đăng ký công ty"</b> bạn nhé.
                    </div>
                ),
                okText: 'Đăng nhập nhanh',
                cancelText: 'Hủy',
                onOk: () => {
                    // Khi nhấn "Đăng nhập nhanh" mới chuyển đến trang đăng nhập
                    navigate(`/login?callback=/register-company`);
                },
            });
        } else {
            // Nếu đã đăng nhập → vào thẳng trang đăng ký công ty
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

                    <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
                        <ul className="navbar-nav mb-2 mb-lg-0 fw-semibold">
                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/' ? 'active' : ''}`} to="/">
                                    <CodeOutlined className="me-1" /> HOME
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/job' ? 'active' : ''}`} to="/job">
                                    <FireOutlined className="me-1" /> JOBS
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${current === '/company' ? 'active' : ''}`} to="/company">
                                    <RiseOutlined className="me-1" /> COMPANY
                                </Link>
                            </li>

                            {/* ✅ Gọi callback khi nhấn REGISTER COMPANY */}
                            <li className="nav-item">
                                <span
                                    className={`nav-link ${current === '/register-company' ? 'active' : ''}`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={handleRegisterCompanyClick}
                                >
                                    <ContactsOutlined className="me-1" /> REGISTER COMPANY
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="d-none d-lg-flex align-items-center">
                        {isAuthenticated ? (
                            <div className="dropdown">
                                <button
                                    className="btn btn-light dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {user?.name}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => setOpenManageAccount(true)}
                                        >
                                            <ContactsOutlined className="me-2" />
                                            Quản lý tài khoản
                                        </button>
                                    </li>
                                    {user.role?.permissions?.length > 0 && (
                                        <li>
                                            <Link to="/admin" className="dropdown-item">
                                                <FireOutlined className="me-2" />
                                                Trang Quản Trị
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
                                Đăng Nhập
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Offcanvas cho Mobile */}
            <div
                className="offcanvas offcanvas-end text-bg-success"
                tabIndex={-1}
                id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel"
            >
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title fw-bold" id="offcanvasNavbarLabel">
                        <RiseOutlined className="me-2" /> JobEntry
                    </h5>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="navbar-nav justify-content-end flex-grow-1 pe-3 fw-semibold">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/">
                                <CodeOutlined className="me-2" /> HOME
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/job">
                                <FireOutlined className="me-2" /> JOBS
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/company">
                                <RiseOutlined className="me-2" /> COMPANY
                            </Link>
                        </li>
                        <li className="nav-item">
                            <button
                                className="nav-link text-white btn btn-link"
                                onClick={handleRegisterCompanyClick}
                            >
                                <ContactsOutlined className="me-2" /> REGISTER COMPANY
                            </button>
                        </li>

                        <hr />
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <button
                                        className="nav-link text-white btn btn-link"
                                        onClick={() => setOpenManageAccount(true)}
                                    >
                                        <ContactsOutlined className="me-2" /> Quản lý tài khoản
                                    </button>
                                </li>
                                {user.role?.permissions?.length > 0 && (
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/admin">
                                            <FireOutlined className="me-2" /> Trang Quản Trị
                                        </Link>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <button
                                        className="nav-link text-white btn btn-link"
                                        onClick={handleLogout}
                                    >
                                        <LogoutOutlined className="me-2" /> Đăng xuất
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link to="/login" className="btn btn-light fw-semibold w-100 mt-2">
                                    Đăng Nhập
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
