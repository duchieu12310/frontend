import React, { useState, useEffect } from "react";
import { Modal, Table, Tag } from "antd";
import dayjs from "dayjs";
import { callFetchAllPaidOrders } from "@/config/api";

interface IProps {
    open: boolean;
    onClose: () => void;
}

const ModalAllOrders: React.FC<IProps> = ({ open, onClose }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAllOrders = async () => {
            if (open) {
                setLoading(true);
                try {
                    const res = await callFetchAllPaidOrders();
                    if (res && res.data) {
                        setOrders(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching all paid orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAllOrders();
    }, [open]);

    const columns = [
        {
            title: "Mã GD",
            dataIndex: "paymentCode",
            key: "paymentCode",
        },
        {
            title: "Công ty",
            key: "company",
            render: (_: any, record: any) => {
                return record.company ? record.company.name : <Tag color="orange">Không xác định</Tag>;
            }
        },
        {
            title: "Tên Gói / Mua lẻ",
            key: "packageName",
            render: (_: any, record: any) => {
                return record.subscriptionPackage 
                    ? <span style={{ fontWeight: 600, color: "#1677ff" }}>{record.subscriptionPackage.name}</span> 
                    : <Tag color="purple">Mua lẻ giới hạn</Tag>;
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
                    <span style={{ fontWeight: 600, color: "#52c41a" }}>
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
        <Modal
            title={<span style={{ fontSize: 18, fontWeight: 700 }}>Danh sách tất cả các gói đã đăng ký & thanh toán</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            destroyOnClose
        >
            <Table
                loading={loading}
                dataSource={orders}
                rowKey="id"
                pagination={{ pageSize: 8, showSizeChanger: true }}
                columns={columns}
                bordered
                style={{ marginTop: 15 }}
            />
        </Modal>
    );
};

export default ModalAllOrders;
