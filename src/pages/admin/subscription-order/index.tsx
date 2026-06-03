import { useState, useEffect } from 'react';
import { Table, Tag, notification, Card } from 'antd';
import dayjs from 'dayjs';
import { callFetchAllPaidOrders } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';

const SubscriptionOrderPage = () => {
    const user = useAppSelector(state => state.account.user);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    if (user?.role?.name !== 'SUPER_ADMIN' && user?.role?.name !== 'ADMIN') {
        return <div style={{ padding: '24px' }}>Bạn không có quyền truy cập trang này.</div>;
    }

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await callFetchAllPaidOrders();
            if (res && res.data) {
                setOrders(res.data);
            }
        } catch (error) {
            notification.error({
                message: "Lỗi tải dữ liệu",
                description: "Không thể lấy danh sách đơn hàng đã thanh toán."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const columns = [
        {
            title: "Mã giao dịch",
            dataIndex: "paymentCode",
            key: "paymentCode",
        },
        {
            title: "Công ty",
            key: "company",
            render: (_: any, record: any) => {
                return record.company ? (
                    <span style={{ fontWeight: 500 }}>{record.company.name}</span>
                ) : (
                    <Tag color="orange">Không xác định</Tag>
                );
            }
        },
        {
            title: "Tên Gói / Mua lẻ",
            key: "packageName",
            render: (_: any, record: any) => {
                return record.subscriptionPackage ? (
                    <Tag color="blue" style={{ fontSize: '13px', padding: '4px 8px' }}>
                        {record.subscriptionPackage.name}
                    </Tag>
                ) : (
                    <Tag color="purple" style={{ fontSize: '13px', padding: '4px 8px' }}>
                        Mua lẻ giới hạn
                    </Tag>
                );
            }
        },
        {
            title: "Tuyển dụng",
            key: "jobLimit",
            render: (_: any, record: any) => {
                const val = record.subscriptionPackage 
                    ? record.subscriptionPackage.jobLimit 
                    : record.jobLimit;
                return val > 0 ? `+${val} bài đăng` : "0";
            }
        },
        {
            title: "Hạn hiển thị",
            key: "jobDurationLimit",
            render: (_: any, record: any) => {
                const val = record.subscriptionPackage 
                    ? record.subscriptionPackage.jobDurationLimit 
                    : record.jobDurationLimit;
                return val > 0 ? `+${val} ngày` : "0";
            }
        },
        {
            title: "Số tiền thanh toán",
            dataIndex: "amount",
            key: "amount",
            render: (amount: number) => {
                return (
                    <span style={{ fontWeight: 600, color: "#2e7d32" }}>
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)}
                    </span>
                );
            }
        },
        {
            title: "Ngày thanh toán",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => date ? dayjs(date).format("DD-MM-YYYY HH:mm:ss") : ""
        },
        {
            title: "Trạng thái",
            key: "status",
            render: () => <Tag color="success">Đã thanh toán</Tag>
        }
    ];

    return (
        <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03),0 1px 6px -1px rgba(0,0,0,0.02),0 2px 4px 0 rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Các Gói Đã Đăng Ký & Doanh Thu</h2>
            </div>

            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                bordered
            />
        </Card>
    );
};

export default SubscriptionOrderPage;
