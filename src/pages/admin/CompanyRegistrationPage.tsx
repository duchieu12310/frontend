import { useRef, useState } from "react";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { Button, Popconfirm, Space, Tag, message, notification, Modal, Progress, List, Collapse, Alert } from "antd";
import {
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import queryString from "query-string";
import DataTable from "@/components/client/data-table";
import {
    callFetchCompany,
    callUpdateCompany,
    callDeleteCompany,
} from "@/config/api";
import { ICompany, IAddress } from "@/types/backend";
import { sfLike } from "spring-filter-query-builder";
import CompanyRegistrationDrawer from "@/components/admin/company/modal.company-registration";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import MarkdownRenderer from "@/components/share/markdown-renderer";

const { Panel } = Collapse;

const CompanyRegistrationPage = () => {
    const [data, setData] = useState<ICompany[]>([]);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ICompany | null>(null);
    const [buttonState, setButtonState] = useState<{ [key: string]: "APPROVED" | "REJECTED" | null }>({});
    const tableRef = useRef<ActionType>();

    // Lấy danh sách đăng ký công ty (các công ty có status = PENDING)
    const fetchData = async (query: string) => {
        setLoading(true);
        try {
            const res = await callFetchCompany(query);
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

    const handleUpdateStatus = async (company: ICompany, status: "APPROVED" | "REJECTED", reason?: string) => {
        try {
            const updatedCompany: ICompany = {
                ...company,
                status,
                rejectReason: status === "REJECTED" ? reason : undefined,
            };
            const res = await callUpdateCompany(updatedCompany);
            if (res && res.data) {
                message.success(status === "APPROVED" ? "✅ Duyệt công ty thành công!" : "❌ Từ chối công ty thành công!");
                if (company.id) {
                    setButtonState((prev) => ({ ...prev, [company.id!]: status }));
                }
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

    const handleApprove = (record: ICompany) => handleUpdateStatus(record, "APPROVED");

    const handleReject = (record: ICompany) => {
        const reason = prompt("Nhập lý do từ chối:");
        if (!reason?.trim()) return message.warning("Vui lòng nhập lý do từ chối!");
        handleUpdateStatus(record, "REJECTED", reason.trim());
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await callDeleteCompany(id);
            if (res && +res.statusCode === 200) {
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

    const handleViewDetail = (record: ICompany) => {
        setSelectedRecord(record);
        setOpenDrawer(true);
    };

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = { page: params.current, size: params.pageSize, filter: "status = 'PENDING'" };
        if (params.name) q.filter += ` and ${sfLike("name", params.name)}`;
        let temp = queryString.stringify(q);
        temp += "&sort=createdAt,desc";
        return temp;
    };

    const getFullAddress = (addr?: IAddress) => {
        if (!addr) return "—";
        return [
            addr.line,
            addr.ward?.name,
            addr.district?.name,
            addr.province?.name
        ].filter(Boolean).join(", ");
    };

    const columns: ProColumns<ICompany>[] = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (dom, entity, index) => <>{index + 1 + (meta.page - 1) * meta.pageSize}</>,
            hideInSearch: true,
        },
        {
            title: "Tên công ty",
            dataIndex: "name",
            sorter: true,
        },
        {
            title: "Mã số thuế",
            dataIndex: "taxCode",
            hideInSearch: true,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            hideInSearch: true,
            render: (dom, entity) => getFullAddress(entity.address),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            hideInSearch: true,
            render: (dom, entity) => {
                const status = entity.status;
                const color = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "blue";
                return <Tag color={color}>{status || "PENDING"}</Tag>;
            },
        },
        {
            title: "Ngày đăng ký",
            dataIndex: "createdAt",
            hideInSearch: true,
            render: (dom, entity) => (entity.createdAt ? dayjs(entity.createdAt).format("DD-MM-YYYY HH:mm") : ""),
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            width: 300,
            align: "center",
            render: (dom, entity) => {
                const currentStatus = entity.id ? (buttonState[entity.id] || entity.status) : entity.status;
                if (!entity.id) return null;

                return (
                    <Space>
                        <Access permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE} hideChildren>
                            <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(entity)} />
                        </Access>

                        <Access permission={ALL_PERMISSIONS.COMPANIES.UPDATE} hideChildren>
                            {(currentStatus === "PENDING" || currentStatus === "REJECTED") && (
                                <Popconfirm title="Duyệt công ty này?" onConfirm={() => handleApprove(entity)}>
                                    <Button icon={<CheckOutlined />} type="primary" />
                                </Popconfirm>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.COMPANIES.UPDATE} hideChildren>
                            {(currentStatus === "PENDING" || currentStatus === "APPROVED") && (
                                <Popconfirm title="Từ chối công ty này?" onConfirm={() => handleReject(entity)}>
                                    <Button icon={<CloseOutlined />} danger />
                                </Popconfirm>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.COMPANIES.DELETE} hideChildren>
                            <Popconfirm title="Xóa đăng ký này?" onConfirm={() => handleDelete(entity.id!)}>
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
            <Access permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}>
                <DataTable<ICompany>
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
