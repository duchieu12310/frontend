// src/components/admin/company-registration/CompanyRegistrationPage.tsx
import { useRef, useState } from "react";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import {
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import queryString from "query-string";
import DataTable from "@/components/client/data-table";
import {
    callFetchCompanyRegistration,
    callUpdateCompanyRegistrationStatus,
    callDeleteCompanyRegistration,
} from "@/config/api";
import { ICompanyRegistration } from "@/types/backend";
import { sfLike } from "spring-filter-query-builder";
import CompanyRegistrationDrawer from "@/components/admin/company/modal.company-registration";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const CompanyRegistrationPage = () => {
    const [data, setData] = useState<ICompanyRegistration[]>([]);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ICompanyRegistration | null>(null);
    const [buttonState, setButtonState] = useState<{ [key: string]: "APPROVED" | "REJECTED" | null }>({});
    const tableRef = useRef<ActionType>();

    // 🔹 Lấy danh sách đăng ký công ty
    const fetchData = async (query: string) => {
        setLoading(true);
        try {
            const res = await callFetchCompanyRegistration(query);
            if (res && res.data) {
                setData(res.data.result);
                setMeta(res.data.meta || { page: 1, pageSize: 10, total: 0 });
            }
        } catch {
            message.error("Không thể tải danh sách đăng ký công ty!");
        } finally {
            setLoading(false);
        }
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    // ⚙️ Cập nhật trạng thái
    const handleUpdateStatus = async (id: string | number, status: "APPROVED" | "REJECTED", reason?: string) => {
        try {
            const res = await callUpdateCompanyRegistrationStatus(id, status, status === "REJECTED" ? reason : undefined);
            if (res && res.data) {
                message.success(status === "APPROVED" ? "✅ Duyệt công ty thành công!" : "❌ Từ chối công ty thành công!");
                setButtonState((prev) => ({ ...prev, [id]: status }));
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra khi cập nhật!",
                    description: res?.message || "Vui lòng thử lại.",
                });
            }
        } catch {
            message.error("Không thể cập nhật trạng thái!");
        }
    };

    const handleApprove = (id: string | number) => handleUpdateStatus(id, "APPROVED");

    const handleReject = (id: string | number) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason?.trim()) return message.warning("Vui lòng nhập lý do từ chối!");
        handleUpdateStatus(id, "REJECTED", reason.trim());
    };

    const handleDelete = async (id: string | number) => {
        try {
            const res = await callDeleteCompanyRegistration(id);
            if (res && res.data) {
                message.success("🗑️ Xóa đăng ký công ty thành công!");
                reloadTable();
            } else {
                notification.error({
                    message: "Không thể xóa!",
                    description: res?.message || "Vui lòng thử lại.",
                });
            }
        } catch {
            message.error("Đã xảy ra lỗi khi xóa!");
        }
    };

    const handleViewDetail = (record: ICompanyRegistration) => {
        setSelectedRecord(record);
        setOpenDrawer(true);
    };

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = { page: params.current, size: params.pageSize, filter: "" };
        if (params.companyName) q.filter = `${sfLike("companyName", params.companyName)}`;
        if (params.email)
            q.filter = q.filter
                ? `${q.filter} and ${sfLike("email", params.email)}`
                : `${sfLike("email", params.email)}`;
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
            render: (_, __, index) => <>{index + 1 + (meta.page - 1) * meta.pageSize}</>,
            hideInSearch: true,
        },
        {
            title: "Tên công ty",
            dataIndex: "companyName",
            sorter: true,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            hideInSearch: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            hideInSearch: true,
            render: (status: string) => {
                const color = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "blue";
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
            width: 300,
            align: "center",
            render: (_, record) => {
                const currentStatus = buttonState[record.id] || record.status;
                return (
                    <Space>
                        {/* 👁️ Xem chi tiết */}
                        <Access permission={ALL_PERMISSIONS.COMPANY_REGISTRATIONS.GET_BY_ID} hideChildren>
                            <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
                        </Access>

                        {/* ✅ Duyệt công ty */}
                        <Access permission={ALL_PERMISSIONS.COMPANY_REGISTRATIONS.UPDATE_STATUS} hideChildren>
                            {(currentStatus === "PENDING" || currentStatus === "REJECTED") && (
                                <Popconfirm title="Duyệt công ty này?" onConfirm={() => handleApprove(record.id)}>
                                    <Button icon={<CheckOutlined />} type="primary" />
                                </Popconfirm>
                            )}
                        </Access>

                        {/* ❌ Từ chối công ty */}
                        <Access permission={ALL_PERMISSIONS.COMPANY_REGISTRATIONS.REJECT} hideChildren>
                            {(currentStatus === "PENDING" || currentStatus === "APPROVED") && (
                                <Popconfirm title="Từ chối công ty này?" onConfirm={() => handleReject(record.id)}>
                                    <Button icon={<CloseOutlined />} danger />
                                </Popconfirm>
                            )}
                        </Access>

                        {/* 🗑️ Xóa đăng ký */}
                        <Access permission={ALL_PERMISSIONS.COMPANY_REGISTRATIONS.DELETE} hideChildren>
                            <Popconfirm title="Xóa đăng ký này?" onConfirm={() => handleDelete(record.id)}>
                                <Button icon={<DeleteOutlined />} danger type="primary" />
                            </Popconfirm>
                        </Access>
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Access permission={ALL_PERMISSIONS.COMPANY_REGISTRATIONS.GET_PAGINATE}>
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
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        total: meta.total,
                        showTotal: (total, range) => (
                            <div>{range[0]}-{range[1]} trên {total} bản ghi</div>
                        ),
                    }}
                    toolBarRender={() => [
                        <Button key="reload" icon={<ReloadOutlined />} onClick={reloadTable}>
                            Làm mới
                        </Button>,
                    ]}
                />
            </Access>

            {/* Drawer chi tiết */}
            <CompanyRegistrationDrawer
                open={openDrawer}
                setOpen={setOpenDrawer}
                record={selectedRecord}
            />
        </>
    );
};

export default CompanyRegistrationPage;
