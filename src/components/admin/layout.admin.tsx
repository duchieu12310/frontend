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
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);
    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

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
            const viewCompanyRegistration = hasPermission(ALL_PERMISSIONS.COMPANY_REGISTRATIONS.GET_PAGINATE);

            const full: MenuProps['items'] = [
                {
                    label: <Link to='/admin'>Bảng điều khiển</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                },
                ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company'>Công ty</Link>,
                    key: '/admin/company',
                    icon: <BankOutlined />,
                }] : []),

                ...(viewCompanyRegistration || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/register-company'>Đăng ký công ty</Link>,
                    key: '/admin/register-company',
                    icon: <FormOutlined />
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
                    icon: <AliwangwangOutlined />
                }] : []),

                ...(viewPermission || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/permission'>Phân quyền</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),

                {
                    label: <Link to='/admin/role'>Vai trò</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                },
            ];

            setMenuItems(full);
        }
    }, [permissions]);

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
                >
                    <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                        <BugOutlined /> QUẢN TRỊ
                    </div>
                    <Menu
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                    />
                </Sider>
            ) : (
                <Menu
                    selectedKeys={[activeMenu]}
                    items={menuItems}
                    onClick={(e) => setActiveMenu(e.key)}
                    mode="horizontal"
                />
            )}

            <Layout>
                {!isMobile && (
                    <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", marginRight: 20 }}>
                        <Button
                            type="text"
                            icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />

                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: "pointer" }}>
                                Xin chào {user?.name}
                                <Avatar>{user?.name?.substring(0, 2)?.toUpperCase()}</Avatar>
                            </Space>
                        </Dropdown>
                    </div>
                )}
                <Content style={{ padding: '15px' }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;
