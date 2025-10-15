import { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { callFetchCompanyRegistration } from "@/config/api";
import type { ColumnsType } from "antd/es/table";

const CompanyRegistrationList = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await callFetchCompanyRegistration("page=1&limit=50");
            if (res && res.data && res.data.result) {
                setData(res.data.result);
            } else {
                setData([]);
                message.warning("Không có dữ liệu đăng ký công ty!");
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách đăng ký công ty!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: ColumnsType<any> = [
        {
            title: "Mã đăng ký",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Tên công ty",
            dataIndex: "companyName",
            key: "companyName",
        },
        {
            title: "Email liên hệ",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "default";
                if (status === "APPROVED") color = "green";
                else if (status === "REJECTED") color = "red";
                else color = "blue";
                return <Tag color={color}>{status || "PENDING"}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        type="link"
                        onClick={() =>
                            navigate(`/admin/company-registrations/${record.id}`)
                        }
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h2>Danh sách đăng ký công ty</h2>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default CompanyRegistrationList;
