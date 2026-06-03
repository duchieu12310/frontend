import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    ScheduleOutlined,
    FormOutlined, // 🆕 biểu tượng cho mục "Đăng ký công ty"
    FileTextOutlined,
    RiseOutlined,
    CreditCardOutlined,
    BellOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button, Badge, Popover, List } from 'antd';
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { callLogout, callFetchNotificationsLast24h, callMarkNotificationAsRead } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';
import dayjs from 'dayjs';
import '@/styles/admin.module.scss';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);
    const permissions = useAppSelector(state => state.account.user.role?.permissions ?? []);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await callFetchNotificationsLast24h();
                if (res?.data) {
                    setNotifications(res.data);
                }
            } catch (error) {
                // console.error(error);
            }
        };
        fetchNotifications();
    }, []);

    const handleNotificationClick = async (item: any) => {
        if (item.id && item.status === 1) {
            try {
                await callMarkNotificationAsRead(item.id);
                setNotifications(prev => 
                    prev.map(n => n.id === item.id ? { ...n, status: 2 } : n)
                );
            } catch (err) {
                console.error(err);
            }
        }
        if (item.resourceName === "RESUME") {
            navigate("/admin/resume");
        } else if (item.resourceName === "JOB") {
            navigate("/admin/job");
        } else if (item.resourceName === "COMPANY") {
            navigate("/admin/company");
        } else if (item.resourceName === "PERMISSION") {
            navigate("/admin/permission");
        } else if (item.resourceName === "ROLE") {
            navigate("/admin/role");
        }
    };

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;

        if (permissions?.length || ACL_ENABLE === 'false') {

            // Kiểm tra quyền từng module
            const hasPermission = (perm: any) => permissions?.some(
                item => item.apiPath === perm.apiPath && item.method === perm.method
            );

            const viewCompany = hasPermission(ALL_PERMISSIONS.COMPANIES.GET_PAGINATE);
            const viewUser = hasPermission(ALL_PERMISSIONS.USERS.GET_PAGINATE);
            const viewJob = hasPermission(ALL_PERMISSIONS.JOBS.GET_PAGINATE);
            const viewResume = hasPermission(ALL_PERMISSIONS.RESUMES.GET_PAGINATE);
            const viewRole = hasPermission(ALL_PERMISSIONS.ROLES.GET_PAGINATE);
            const viewPermission = hasPermission(ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE);
            const viewFormatCV = hasPermission(ALL_PERMISSIONS.FORMAT_CVS.GET_PAGINATE);
            const viewCVTemplate = hasPermission(ALL_PERMISSIONS.CV_TEMPLATES.GET_PAGINATE);
            const viewEditRequest = hasPermission(ALL_PERMISSIONS.EDIT_REQUESTS.GET_PAGINATE);

            const full: MenuProps['items'] = [
                {
                    label: <Link to='/admin'>Bảng điều khiển</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },
                {
                    label: <Link to='/admin/chat'>Tin nhắn (Chat)</Link>,
                    key: '/admin/chat',
                    icon: <MessageOutlined />
                },
                ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company'>Công ty</Link>,
                    key: '/admin/company',
                    icon: <BankOutlined />,
                }] : []),
                ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company-registration'>Đăng ký công ty</Link>,
                    key: '/admin/company-registration',
                    icon: <FormOutlined />,
                }] : []),

                // 🆕 Thêm menu Nâng cấp gói
                ...(user?.role?.name === 'EMPLOYER' ? [{
                    label: <Link to='/admin/subscription'>Nâng cấp gói</Link>,
                    key: '/admin/subscription',
                    icon: <RiseOutlined />,
                }] : []),

                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>Người dùng</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),

                ...(viewJob || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/job'>Công việc</Link>,
                    key: '/admin/job',
                    icon: <ScheduleOutlined />
                }] : []),

                ...(viewResume || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/resume'>Hồ sơ</Link>,
                    key: '/admin/resume',
                    icon: <ApiOutlined />
                }] : []),

                ...(viewFormatCV || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/cv'>CV tuyển dụng</Link>,
                    key: '/admin/cv',
                    icon: <FileTextOutlined />
                }] : []),

                ...(viewCVTemplate || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/cv-template'>Mẫu CV</Link>,
                    key: '/admin/cv-template',
                    icon: <ApiOutlined />
                }] : []),

                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Phân quyền</Link>,
                    key: '/admin/permission',
                    icon: <ExceptionOutlined />
                }] : []),

                ...(viewRole || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/role'>Vai trò</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),

                ...(viewEditRequest || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/edit-request'>Yêu cầu chỉnh sửa</Link>,
                    key: '/admin/edit-request',
                    icon: <FormOutlined />
                }] : []),

                ...(user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'ADMIN' ? [{
                    label: <Link to='/admin/subscription-package'>Quản lý gói cước</Link>,
                    key: '/admin/subscription-package',
                    icon: <ApiOutlined />, 
                }, {
                    label: <Link to='/admin/subscription-order'>Các gói đã đăng ký</Link>,
                    key: '/admin/subscription-order',
                    icon: <CreditCardOutlined />, 
                }] : [])
            ];

            setMenuItems(full);
        }
    }, [permissions, user]);

    useEffect(() => {
        setActiveMenu(location.pathname);
    }, [location]);

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/');
        }
    }

    const itemsDropdown = [
        { label: <Link to={'/'}>Trang chủ</Link>, key: 'home' },
        {
            label: <label style={{ cursor: 'pointer' }} onClick={handleLogout}>Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }} className="layout-admin">
            {!isMobile ? (
                <Sider
                    theme='light'
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    style={{ borderRight: '1px solid rgba(226, 232, 240, 0.8)' }}
                >
                    <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', fontWeight: 'bold', color: '#14372f', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <RiseOutlined style={{ fontSize: '24px', color: '#14372f' }} />
                        {!collapsed && <span style={{ fontSize: '14px', letterSpacing: '0.5px' }}>JOBENTRY ADMIN</span>}
                    </div>
                    <Menu
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        style={{ borderRight: 0, marginTop: '8px' }}
                    />
                </Sider>
            ) : (
                <Menu
                    selectedKeys={[activeMenu]}
                    items={menuItems}
                    onClick={(e) => setActiveMenu(e.key)}
                    mode="horizontal"
                    style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}
                />
            )}

            <Layout>
                {!isMobile && (
                    <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", borderBottom: "1px solid rgba(226, 232, 240, 0.8)", height: "64px", paddingRight: "24px" }}>
                        <Button
                            type="text"
                            icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                    />
                                </Badge>
                            </Popover>

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer", fontWeight: 600, color: "#334155" }}>
                                    Xin chào {user?.name}
                                    <Avatar style={{ backgroundColor: '#e6f0ec', color: '#14372f', fontWeight: 'bold' }}>
                                        {user?.name?.substring(0, 2)?.toUpperCase()}
                                    </Avatar>
                                </Space>
                            </Dropdown>
                        </div>
                    </div>
                )}
                <Content style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;
