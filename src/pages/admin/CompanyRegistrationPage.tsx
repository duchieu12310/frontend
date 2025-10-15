import { useEffect, useRef, useState } from "react";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import queryString from "query-string";
import DataTable from "@/components/client/data-table";
import { callFetchCompanyRegistration, callApproveCompanyRegistration, callRejectCompanyRegistration } from "@/config/api";
import { ICompanyRegistration } from "@/types/backend";
import { sfLike } from "spring-filter-query-builder";

const CompanyRegistrationPage = () => {
    const [data, setData] = useState<ICompanyRegistration[]>([]);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const tableRef = useRef<ActionType>();
    const navigate = useNavigate();

    // 🟢 Lấy danh sách đăng ký công ty
    const fetchData = async (query: string) => {
        setLoading(true);
        try {
            const res = await callFetchCompanyRegistration(query);
            if (res && res.data) {
                setData(res.data.result);
                setMeta(res.data.meta || { page: 1, pageSize: 10, total: 0 });
            }
        } catch (err) {
            message.error("Không thể tải danh sách đăng ký công ty!");
        } finally {
            setLoading(false);
        }
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    // 🟢 Duyệt công ty
    const handleApprove = async (id: string | number) => {
        try {
            const res = await callApproveCompanyRegistration(id);
            if (res && res.data) {
                message.success("Duyệt công ty thành công!");
                reloadTable();
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res.message });
            }
        } catch {
            message.error("Không thể duyệt công ty!");
        }
    };

    // 🔴 Từ chối công ty
    const handleReject = async (id: string | number) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason) return;
        try {
            const res = await callRejectCompanyRegistration(id, reason);
            if (res && res.data) {
                message.success("Từ chối công ty thành công!");
                reloadTable();
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res.message });
            }
        } catch {
            message.error("Không thể từ chối công ty!");
        }
    };

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        };

        if (params.companyName) q.filter = `${sfLike("companyName", params.companyName)}`;
        if (params.email) {
            q.filter = q.filter
                ? q.filter + " and " + `${sfLike("email", params.email)}`
                : `${sfLike("email", params.email)}`;
        }

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);
        temp += "&sort=createdAt,desc";
        return temp;
    };

    const columns: ProColumns<ICompanyRegistration>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_, __, index) => <>{(index + 1) + (meta.page - 1) * meta.pageSize}</>,
            hideInSearch: true,
        },
        {
            title: "Tên công ty",
            dataIndex: "companyName",
            sorter: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: true,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            sorter: true,
            hideInSearch: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            hideInSearch: true,
            render: (status: string) => {
                let color = "default";
                if (status === "APPROVED") color = "green";
                else if (status === "REJECTED") color = "red";
                else color = "blue";
                return <Tag color={color}>{status || "PENDING"}</Tag>;
            },
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "createdAt",
            hideInSearch: true,
            render: (text) => (text ? dayjs(text).format("DD-MM-YYYY HH:mm") : ""),
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        type="link"
                        onClick={() => navigate(`/admin/company-registrations/${record.id}`)}
                    >
                        Xem chi tiết
                    </Button>
                    {record.status === "PENDING" && (
                        <>
                            <Popconfirm
                                title="Duyệt công ty này?"
                                onConfirm={() => handleApprove(record.id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button icon={<CheckOutlined />} type="primary" />
                            </Popconfirm>
                            <Popconfirm
                                title="Từ chối công ty này?"
                                onConfirm={() => handleReject(record.id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                            >
                                <Button icon={<CloseOutlined />} danger />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <DataTable<ICompanyRegistration>
                actionRef={tableRef}
                headerTitle="Danh sách đăng ký công ty"
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    await fetchData(query);
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]}-{range[1]} trên {total} bản ghi
                        </div>
                    ),
                }}
                rowSelection={false}
                toolBarRender={() => [
                    <Button key="reload" icon={<ReloadOutlined />} onClick={reloadTable}>
                        Làm mới
                    </Button>,
                ]}
            />
        </div>
    );
};

export default CompanyRegistrationPage;
