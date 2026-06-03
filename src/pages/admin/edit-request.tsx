import DataTable from "@/components/client/data-table";
import { useAppSelector } from "@/redux/hooks";
import { IEditRequest } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from "@ant-design/pro-components";
import { Space, message, notification, Tooltip, Modal, Input, Form, Button, Tag, Descriptions } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callFetchEditRequests, callApproveEditRequest, callRejectEditRequest, callRevisionEditRequest } from "@/config/api";
import queryString from "query-string";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { CheckOutlined, CloseOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";

const EditRequestPage = () => {
    const tableRef = useRef<ActionType>();

    const [dataSource, setDataSource] = useState<IEditRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0 });

    const [dataInit, setDataInit] = useState<IEditRequest | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);

    const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: number }>({ open: false });
    const [approveModal, setApproveModal] = useState<{ open: boolean; id?: number }>({ open: false });
    const [revisionModal, setRevisionModal] = useState<{ open: boolean; id?: number }>({ open: false });

    const [formReject] = Form.useForm();
    const [formApprove] = Form.useForm();
    const [formRevision] = Form.useForm();

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    const fetchEditRequests = async (query: string) => {
        setLoading(true);
        try {
            const res = await callFetchEditRequests(query);
            if (res && res.data) {
                setDataSource(res.data.result);
                setMeta({
                    page: res.data.meta.page,
                    pageSize: res.data.meta.pageSize,
                    total: res.data.meta.total,
                });
            } else {
                notification.error({
                    message: "Lỗi tải dữ liệu",
                    description: res.message,
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Từ chối yêu cầu
    const handleRejectSubmit = async () => {
        try {
            const values = await formReject.validateFields();
            const res = await callRejectEditRequest(rejectModal.id!, values.reason || "");
            if (res && +res.statusCode === 200) {
                message.warning("Đã từ chối yêu cầu chỉnh sửa");
                setRejectModal({ open: false });
                formReject.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi từ chối yêu cầu",
                    description: res.message,
                });
            }
        } catch {
            // ignore validation errors
        }
    };

    // Yêu cầu chỉnh sửa lại
    const handleRevisionSubmit = async () => {
        try {
            const values = await formRevision.validateFields();
            const res = await callRevisionEditRequest(revisionModal.id!, values.reason || "");
            if (res && +res.statusCode === 200) {
                message.warning("Đã gửi yêu cầu chỉnh sửa lại");
                setRevisionModal({ open: false });
                formRevision.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi yêu cầu chỉnh sửa lại",
                    description: res.message,
                });
            }
        } catch {
            // ignore validation errors
        }
    };

    // Phê duyệt yêu cầu
    const handleApproveSubmit = async () => {
        try {
            const values = await formApprove.validateFields();
            const res = await callApproveEditRequest(approveModal.id!, values.notes || "");
            if (res && +res.statusCode === 200) {
                message.success("Đã phê duyệt và áp dụng thay đổi thành công!");
                setApproveModal({ open: false });
                formApprove.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi phê duyệt yêu cầu",
                    description: res.message,
                });
            }
        } catch {
            // ignore validation errors
        }
    };

    const renderJsonDetails = (jsonString?: string) => {
        if (!jsonString) return "Không có dữ liệu thay đổi";
        try {
            const obj = JSON.parse(jsonString);
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(obj).map(([key, val]) => {
                        let displayVal = "";
                        if (typeof val === 'object' && val !== null) {
                            displayVal = JSON.stringify(val, null, 2);
                        } else {
                            displayVal = String(val);
                        }
                        return (
                            <div key={key} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
                                <span style={{ fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{key}: </span>
                                <span style={{ color: '#111827', fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                    {displayVal}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        } catch (e) {
            return <pre>{jsonString}</pre>;
        }
    };

    // Cấu hình bảng
    const columns: ProColumns<IEditRequest>[] = [
        {
            title: "Mã yêu cầu",
            dataIndex: "id",
            width: 100,
            render: (_, record) => (
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}
                >
                    {record.id}
                </a>
            ),
            hideInSearch: true,
        },
        {
            title: "Người yêu cầu",
            dataIndex: ["user", "email"],
            copyable: true,
            render: (_, record) => record.user?.email || record.createdBy || "",
        },
        {
            title: "Loại đối tượng",
            dataIndex: "targetType",
            sorter: true,
            renderFormItem: () => (
                <ProFormSelect
                    allowClear
                    valueEnum={{
                        COMPANY: "Công ty",
                        JOB: "Công việc",
                        CV: "CV / Hồ sơ",
                        USER: "Người dùng",
                    }}
                    placeholder="Chọn đối tượng"
                />
            ),
            render: (_, record) => {
                const colors: Record<string, string> = {
                    COMPANY: "blue",
                    JOB: "orange",
                    CV: "purple",
                    USER: "cyan",
                };
                return <Tag color={colors[record.targetType] || "default"}>{record.targetType}</Tag>;
            },
        },
        {
            title: "ID đối tượng",
            dataIndex: "targetId",
            width: 110,
            hideInSearch: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            sorter: true,
            renderFormItem: () => (
                <ProFormSelect
                    allowClear
                    valueEnum={{
                        PENDING: "Đang chờ",
                        REVIEWING: "Đang xem xét",
                        APPROVED: "Đã duyệt",
                        REJECTED: "Từ chối",
                        REVISION_REQUIRED: "Yêu cầu sửa lại",
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
            render: (_, record) => {
                const colors: Record<string, string> = {
                    PENDING: "warning",
                    REVIEWING: "processing",
                    APPROVED: "success",
                    REJECTED: "error",
                    REVISION_REQUIRED: "magenta",
                };
                const labels: Record<string, string> = {
                    PENDING: "Chờ duyệt",
                    REVIEWING: "Đang xem xét",
                    APPROVED: "Đã duyệt",
                    REJECTED: "Từ chối",
                    REVISION_REQUIRED: "Yêu cầu sửa lại",
                };
                return <Tag color={colors[record.status || "PENDING"]}>{labels[record.status || "PENDING"]}</Tag>;
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 180,
            sorter: true,
            render: (_, record) =>
                record.createdAt
                    ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
                    : "",
            hideInSearch: true,
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            width: 180,
            render: (_, record) => {
                const status = record.status;
                const showApprove = status === "PENDING";
                const showReject = status === "PENDING";
                const showRevision = status === "PENDING";

                return (
                    <Space>
                        <Tooltip title="Xem chi tiết thay đổi">
                            <Button
                                type="text"
                                icon={<EyeOutlined style={{ color: "#1890ff" }} />}
                                onClick={() => {
                                    setOpenViewDetail(true);
                                    setDataInit(record);
                                }}
                            />
                        </Tooltip>

                        <Access permission={ALL_PERMISSIONS.EDIT_REQUESTS.APPROVE} hideChildren={true}>
                            {showApprove && (
                                <Tooltip title="Phê duyệt">
                                    <Button
                                        type="text"
                                        icon={<CheckOutlined style={{ color: "green" }} />}
                                        onClick={() => {
                                            setApproveModal({
                                                open: true,
                                                id: record.id,
                                            });
                                            formApprove.setFieldsValue({ notes: "" });
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.EDIT_REQUESTS.REJECT} hideChildren={true}>
                            {showReject && (
                                <Tooltip title="Từ chối">
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined style={{ color: "red" }} />}
                                        onClick={() => {
                                            setRejectModal({ open: true, id: record.id });
                                            formReject.setFieldsValue({ reason: "" });
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.EDIT_REQUESTS.REVISION} hideChildren={true}>
                            {showRevision && (
                                <Tooltip title="Yêu cầu sửa lại">
                                    <Button
                                        type="text"
                                        icon={<EditOutlined style={{ color: "#722ed1" }} />}
                                        onClick={() => {
                                            setRevisionModal({ open: true, id: record.id });
                                            formRevision.setFieldsValue({ reason: "" });
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Access>
                    </Space>
                );
            },
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        
        let parts: string[] = [];
        if (clone.targetType) parts.push(`targetType = '${clone.targetType}'`);
        if (clone.status) parts.push(`status = '${clone.status}'`);
        
        if (parts.length > 0) {
            clone.filter = parts.join(" and ");
        }
        delete clone.targetType;
        delete clone.status;

        clone.page = clone.current;
        clone.size = clone.pageSize;
        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);
        let sortBy = "";

        if (sort?.targetType)
            sortBy = sort.targetType === "ascend" ? "sort=targetType,asc" : "sort=targetType,desc";
        if (sort?.status)
            sortBy = sort.status === "ascend" ? "sort=status,asc" : "sort=status,desc";
        if (sort?.createdAt)
            sortBy = sort.createdAt === "ascend" ? "sort=createdAt,asc" : "sort=createdAt,desc";

        temp += sortBy ? `&${sortBy}` : "&sort=createdAt,desc";
        return temp;
    };

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.EDIT_REQUESTS.GET_PAGINATE}>
                <DataTable<IEditRequest>
                    actionRef={tableRef}
                    headerTitle="Danh sách yêu cầu chỉnh sửa thông tin"
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={dataSource}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        await fetchEditRequests(query);
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => (
                            <div>
                                {range[0]}-{range[1]} trên {total} dòng
                            </div>
                        ),
                    }}
                    rowSelection={false}
                />
            </Access>

            {/* Drawer/Modal xem chi tiết */}
            <Modal
                title={`Chi tiết Yêu cầu chỉnh sửa #${dataInit?.id}`}
                open={openViewDetail}
                onCancel={() => setOpenViewDetail(false)}
                footer={[
                    <Button key="close" onClick={() => setOpenViewDetail(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
                destroyOnClose
            >
                {dataInit && (
                    <div style={{ marginTop: '16px' }}>
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label="Người yêu cầu">
                                {dataInit.user?.name} ({dataInit.user?.email})
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại đối tượng">
                                <Tag color="blue">{dataInit.targetType}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="ID đối tượng">
                                {dataInit.targetId}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={dataInit.status === "APPROVED" ? "success" : dataInit.status === "REJECTED" ? "error" : "warning"}>
                                    {dataInit.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú phản hồi">
                                {dataInit.notes || "Không có ghi chú"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian tạo">
                                {dataInit.createdAt ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss") : ""}
                            </Descriptions.Item>
                            <Descriptions.Item label="Dữ liệu yêu cầu thay đổi">
                                {renderJsonDetails(dataInit.data)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>

            {/* Modal từ chối */}
            <Modal
                title="Từ chối yêu cầu chỉnh sửa"
                open={rejectModal.open}
                onCancel={() => setRejectModal({ open: false })}
                onOk={handleRejectSubmit}
                okText="Từ chối"
                okButtonProps={{ danger: true }}
                cancelText="Hủy"
            >
                <Form form={formReject} layout="vertical">
                    <Form.Item
                        label="Lý do từ chối (không bắt buộc)"
                        name="reason"
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chấp nhận */}
            <Modal
                title="Phê duyệt yêu cầu chỉnh sửa"
                open={approveModal.open}
                onCancel={() => setApproveModal({ open: false })}
                onOk={handleApproveSubmit}
                okText="Phê duyệt & Áp dụng"
                cancelText="Hủy"
            >
                <Form form={formApprove} layout="vertical">
                    <Form.Item
                        label="Ghi chú phê duyệt (không bắt buộc)"
                        name="notes"
                    >
                        <Input placeholder="Nhập ghi chú phản hồi..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal yêu cầu sửa lại */}
            <Modal
                title="Yêu cầu sửa đổi thông tin"
                open={revisionModal.open}
                onCancel={() => setRevisionModal({ open: false })}
                onOk={handleRevisionSubmit}
                okText="Yêu cầu sửa lại"
                cancelText="Hủy"
            >
                <Form form={formRevision} layout="vertical">
                    <Form.Item
                        label="Nội dung/Lý do yêu cầu sửa đổi (bắt buộc)"
                        name="reason"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung yêu cầu sửa đổi!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Ví dụ: Vui lòng cập nhật lại giấy phép kinh doanh rõ nét hơn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EditRequestPage;
