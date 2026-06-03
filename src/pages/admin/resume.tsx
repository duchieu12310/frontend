import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from "@ant-design/pro-components";
import { Space, message, notification, Tooltip, Modal, Input, Form, Button, Progress, Tag, Collapse, Alert, Spin } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteResume, callUpdateResumeById, callEvaluateResume } from "@/config/api";
import queryString from "query-string";
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import {
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
    RobotOutlined,
    WarningOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import MarkdownRenderer from "@/components/share/markdown-renderer";

const { Panel } = Collapse;

interface IResumeAuditState {
    [key: string]: {
        status: "pending" | "loading" | "success" | "error";
        result?: string;
        isInvalid?: boolean;
        email: string;
        jobName: string;
    };
}

const ResumePage = () => {
    const tableRef = useRef<ActionType>();
    const dispatch = useAppDispatch();

    const isFetching = useAppSelector((state) => state.resume.isFetching);
    const meta = useAppSelector((state) => state.resume.meta);
    const resumes = useAppSelector((state) => state.resume.result);

    const currentUser = useAppSelector((state) => state.account.user);
    const isAdmin = currentUser?.role?.name === "SUPER_ADMIN";

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);

    const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
    const [approveModal, setApproveModal] = useState<{
        open: boolean;
        id?: string;
        defaultAddress?: string;
    }>({ open: false });

    const [formReject] = Form.useForm();
    const [formApprove] = Form.useForm();

    // 🔹 Selection states for Batch AI Audit
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<IResume[]>([]);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditProgress, setAuditProgress] = useState(0);
    const [auditResults, setAuditResults] = useState<IResumeAuditState>({});

    const reloadTable = () => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
        tableRef?.current?.reload();
    };

    // Xóa hồ sơ
    const handleDeleteResume = async (id?: string) => {
        if (!id) return;
        const res = await callDeleteResume(id);
        if (res && res.data) {
            message.success("Xóa hồ sơ thành công");
            reloadTable();
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message,
            });
        }
    };

    // Từ chối hồ sơ
    const handleRejectSubmit = async () => {
        try {
            const values = await formReject.validateFields();
            const res = await callUpdateResumeById(rejectModal.id!, {
                status: "REJECTED",
                note: values.reason || "",
            });
            if (res && res.data) {
                message.warning("Đã từ chối hồ sơ");
                setRejectModal({ open: false });
                formReject.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi từ chối hồ sơ",
                    description: res.message,
                });
            }
        } catch {
            // bỏ qua validation errors
        }
    };

    // Chấp nhận hồ sơ
    const handleApproveSubmit = async () => {
        try {
            const values = await formApprove.validateFields();
            const res = await callUpdateResumeById(approveModal.id!, {
                status: "APPROVED",
                note: values.address,
            });
            if (res && res.data) {
                message.success("Đã chấp nhận hồ sơ");
                setApproveModal({ open: false });
                formApprove.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi chấp nhận hồ sơ",
                    description: res.message,
                });
            }
        } catch {
            // bỏ qua validation errors
        }
    };

    // 🚀 Bắt đầu đánh giá AI hàng loạt
    const startBatchAudit = async () => {
        if (selectedRows.length === 0) return;
        setIsBatchModalOpen(true);
        setIsAuditing(true);
        setAuditProgress(0);

        const initialResults: IResumeAuditState = {};
        selectedRows.forEach((row) => {
            if (row.id) {
                initialResults[row.id] = {
                    status: "pending",
                    email: row.email,
                    jobName: row.job?.name || "Không rõ vị trí"
                };
            }
        });
        setAuditResults(initialResults);

        let completedCount = 0;
        for (const row of selectedRows) {
            if (!row.id) continue;

            setAuditResults((prev) => ({
                ...prev,
                [row.id!]: { ...prev[row.id!], status: "loading" }
            }));

            try {
                const res = await callEvaluateResume(row.id);
                if (res && res.data) {
                    const report = res.data.evaluation;
                    // Kiểm tra xem báo cáo có khuyên từ chối hay không phù hợp không
                    const isInvalid = report.toLowerCase().includes("rejected") ||
                        report.toLowerCase().includes("từ chối") ||
                        report.toLowerCase().includes("không phù hợp");

                    // Cache báo cáo trong sessionStorage cho Drawer sau này dùng luôn
                    sessionStorage.setItem(`resume-eval-${row.id}`, report);

                    setAuditResults((prev) => ({
                        ...prev,
                        [row.id!]: {
                            ...prev[row.id!],
                            status: "success",
                            result: report,
                            isInvalid
                        }
                    }));
                } else {
                    setAuditResults((prev) => ({
                        ...prev,
                        [row.id!]: {
                            ...prev[row.id!],
                            status: "error",
                            result: "Không thể lấy thông tin phản hồi từ AI.",
                            isInvalid: true
                        }
                    }));
                }
            } catch (error: any) {
                setAuditResults((prev) => ({
                    ...prev,
                    [row.id!]: {
                        ...prev[row.id!],
                        status: "error",
                        result: error.message || "Lỗi kết nối máy chủ AI.",
                        isInvalid: true
                    }
                }));
            }
            completedCount++;
            setAuditProgress(Math.round((completedCount / selectedRows.length) * 100));
        }
        setIsAuditing(false);
    };

    // Cấu hình bảng
    const columns: ProColumns<IResume>[] = [
        {
            title: "Mã hồ sơ",
            dataIndex: "id",
            width: 80,
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
            title: "Email",
            dataIndex: "email",
            copyable: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            sorter: true,
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: "Đang chờ",
                        REVIEWING: "Đang xem xét",
                        APPROVED: "Đã duyệt",
                        REJECTED: "Từ chối",
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: "Độ phù hợp AI",
            dataIndex: "matchScore",
            width: 150,
            render: (_, record) => {
                if (record.matchScore === undefined || record.matchScore === null) {
                    return <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>Chưa đánh giá</span>;
                }
                const score = record.matchScore;
                const color = score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#fa8c16';
                return (
                    <div style={{ width: '100%', minWidth: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, color }}>{score}%</span>
                        </div>
                        <Progress 
                            percent={score} 
                            showInfo={false} 
                            strokeColor={color}
                            size="small" 
                        />
                    </div>
                );
            },
            hideInSearch: true,
        },
        {
            title: "Công ty",
            dataIndex: ["job", "company", "name"],
            hideInSearch: true,
            render: (_, record) => record.job?.company?.name || "",
        },
        {
            title: "Vị trí ứng tuyển",
            dataIndex: ["job", "name"],
            hideInSearch: true,
            render: (_, record) => record.job?.name || "",
        },
        {
            title: "Người nộp hồ sơ",
            dataIndex: ["user", "name"],
            hideInSearch: true,
            render: (_, record) => record.user?.name || record.email || "",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 200,
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
            width: 220,
            render: (_, record) => {
                const status = record.status;
                const showApprove = status === "PENDING" || status === "REVIEWING" || status === "REJECTED";
                const showReject = status === "PENDING" || status === "REVIEWING" || status === "APPROVED";

                return (
                    <Space>
                        <Tooltip title="Xem chi tiết">
                            <EditOutlined
                                style={{ fontSize: 20, color: "#ffa500" }}
                                onClick={() => {
                                    setOpenViewDetail(true);
                                    setDataInit(record);
                                }}
                            />
                        </Tooltip>

                        <Access permission={ALL_PERMISSIONS.RESUMES.UPDATE} hideChildren={true}>
                            {showApprove && (
                                <Tooltip title="Chấp nhận hồ sơ">
                                    <CheckOutlined
                                        style={{ fontSize: 20, color: "green" }}
                                        onClick={() => {
                                            const addr = record.job?.location ||
                                                record.job?.company?.address ||
                                                "Địa chỉ công việc";
                                            setApproveModal({
                                                open: true,
                                                id: record.id,
                                                defaultAddress: addr,
                                            });
                                            formApprove.setFieldsValue({
                                                address: addr,
                                            });
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.RESUMES.UPDATE} hideChildren={true}>
                            {showReject && (
                                <Tooltip title="Từ chối hồ sơ">
                                    <CloseOutlined
                                        style={{ fontSize: 20, color: "red" }}
                                        onClick={() => {
                                            setRejectModal({ open: true, id: record.id });
                                            formReject.setFieldsValue({ reason: "" });
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Access>

                        <Access permission={ALL_PERMISSIONS.RESUMES.DELETE} hideChildren={true}>
                            <Tooltip title="Xóa hồ sơ">
                                <DeleteOutlined
                                    style={{ fontSize: 20, color: "darkred" }}
                                    onClick={() => handleDeleteResume(record.id?.toString())}
                                />
                            </Tooltip>
                        </Access>
                    </Space>
                );
            },
        },
    ];

    // Lọc ra các hồ sơ bị AI đánh giá "Không hợp lệ / Cần từ chối" để hiển thị cảnh báo
    const invalidResumes = Object.values(auditResults).filter(item => item.isInvalid);

    // Build query filter
    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone?.status?.length) {
            clone.filter = sfIn("status", clone.status).toString();
            delete clone.status;
        }
        clone.page = clone.current;
        clone.size = clone.pageSize;
        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);
        let sortBy = "";

        if (sort?.status)
            sortBy = sort.status === "ascend" ? "sort=status,asc" : "sort=status,desc";
        if (sort?.createdAt)
            sortBy =
                sort.createdAt === "ascend"
                    ? "sort=createdAt,asc"
                    : "sort=createdAt,desc";
        if (sort?.updatedAt)
            sortBy =
                sort.updatedAt === "ascend"
                    ? "sort=updatedAt,asc"
                    : "sort=updatedAt,desc";

        temp += sortBy ? `&${sortBy}` : "&sort=updatedAt,desc";
        return temp;
    };

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách hồ sơ"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={resumes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchResume({ query }));
                    }}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys, rows) => {
                            setSelectedRowKeys(keys);
                            setSelectedRows(rows);
                        }
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
                    toolBarRender={() => [
                        selectedRows.length > 0 && (
                            <Button
                                key="batch-audit"
                                type="primary"
                                danger
                                icon={<RobotOutlined />}
                                onClick={startBatchAudit}
                            >
                                Kiểm tra không hợp lệ bằng AI ({selectedRows.length})
                            </Button>
                        )
                    ]}
                />
            </Access>

            {/* Modal xem chi tiết */}
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />

            {/* Modal từ chối */}
            <Modal
                title="Từ chối hồ sơ"
                open={rejectModal.open}
                onCancel={() => setRejectModal({ open: false })}
                onOk={handleRejectSubmit}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
            >
                <Form form={formReject} layout="vertical">
                    <Form.Item
                        label="Lý do từ chối (không bắt buộc)"
                        name="reason"
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối nếu có..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chấp nhận */}
            <Modal
                title="Chấp nhận hồ sơ - Hẹn phỏng vấn"
                open={approveModal.open}
                onCancel={() => setApproveModal({ open: false })}
                onOk={handleApproveSubmit}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={formApprove} layout="vertical">
                    <Form.Item
                        label="Địa điểm phỏng vấn"
                        name="address"
                        initialValue={approveModal.defaultAddress}
                        rules={[{ required: true, message: "Vui lòng nhập địa điểm phỏng vấn" }]}
                    >
                        <Input placeholder="Nhập địa điểm phỏng vấn..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Đánh giá CV hàng loạt bằng AI */}
            <Modal
                title={
                    <span>
                        <RobotOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                        Kết quả Đánh giá CV hàng loạt bằng AI
                    </span>
                }
                open={isBatchModalOpen}
                onCancel={() => {
                    if (isAuditing) {
                        message.warning("Đang đánh giá, vui lòng chờ hoàn thành!");
                        return;
                    }
                    setIsBatchModalOpen(false);
                }}
                footer={[
                    <Button
                        key="close"
                        type="primary"
                        disabled={isAuditing}
                        onClick={() => {
                            setIsBatchModalOpen(false);
                            reloadTable();
                        }}
                    >
                        Đóng
                    </Button>
                ]}
                width={850}
                destroyOnClose
            >
                <div style={{ margin: "15px 0" }}>
                    <Progress percent={auditProgress} status={isAuditing ? "active" : "normal"} />
                    <div style={{ marginTop: 10, fontSize: "13px", color: "#595959" }}>
                        {isAuditing ? "Trợ lý AI đang chấm điểm và phân tích các CV đã chọn..." : "Đã hoàn thành đánh giá CV hàng loạt!"}
                    </div>
                </div>

                {!isAuditing && invalidResumes.length > 0 && (
                    <Alert
                        message={`Phát hiện ${invalidResumes.length} hồ sơ không phù hợp hoặc đề xuất từ chối!`}
                        description="Vui lòng nhấn vào từng hồ sơ màu đỏ phía dưới để xem báo cáo lý do chi tiết từ AI."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />
                )}

                {!isAuditing && invalidResumes.length === 0 && (
                    <Alert
                        message="Tất cả các hồ sơ đã chọn đều đạt yêu cầu!"
                        description="Trợ lý AI đánh giá các CV đều có độ khớp từ khoá cao và đạt mức phỏng vấn."
                        type="success"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />
                )}

                <Collapse defaultActiveKey={[]} expandIconPosition="right">
                    {Object.entries(auditResults).map(([id, info]) => {
                        let headerTag = <Tag color="default">Đang chờ...</Tag>;
                        if (info.status === "loading") {
                            headerTag = <Tag color="processing">Đang phân tích...</Tag>;
                        } else if (info.status === "error") {
                            headerTag = <Tag color="error">Lỗi đánh giá</Tag>;
                        } else if (info.status === "success") {
                            headerTag = info.isInvalid ? (
                                <Tag color="error" icon={<WarningOutlined />}>
                                    ĐỀ XUẤT TỪ CHỐI / KHÔNG PHÙ HỢP
                                </Tag>
                            ) : (
                                <Tag color="success" icon={<CheckCircleOutlined />}>
                                    PHÙ HỢP / ĐẠT
                                </Tag>
                            );
                        }

                        return (
                            <Panel
                                key={id}
                                header={
                                    <div style={{ display: "flex", justifyContent: "space-between", width: "95%" }}>
                                        <span style={{ fontWeight: 600 }}>Ứng viên: {info.email} → Vị trí: {info.jobName}</span>
                                        {headerTag}
                                    </div>
                                }
                                forceRender
                            >
                                {info.status === "loading" && <div style={{ textAlign: "center", padding: 20 }}><Spin tip="AI đang phân tích đối chiếu..." /></div>}
                                {info.status === "success" && info.result && (
                                    <div style={{ padding: "10px", background: "#fcfcfc", border: "1px solid #f0f0f0", borderRadius: "6px" }}>
                                        <MarkdownRenderer content={info.result} />
                                    </div>
                                )}
                                {info.status === "error" && <p style={{ color: "red" }}>{info.result}</p>}
                                {info.status === "pending" && <p>Đang chờ xếp hàng phân tích...</p>}
                            </Panel>
                        );
                    })}
                </Collapse>
            </Modal>
        </div>
    );
};

export default ResumePage;
