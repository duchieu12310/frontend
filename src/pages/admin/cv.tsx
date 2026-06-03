import DataTable from "@/components/client/data-table";
import { IFormatCV, IJob } from "@/types/backend";
import {
    EyeOutlined,
    PlusCircleOutlined,
    RobotOutlined,
    WarningOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Select, Space, message, notification, Tooltip, Progress, Collapse, Tag, Alert, Spin, List, Tabs } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    callFetchFormatCVs,
    callFetchAllJob,
    callCreateResume,
    callFetchFormatCVById,
    callGptEvaluateCV,
    callSuggestJobsForCv
} from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import MarkdownRenderer from "@/components/share/markdown-renderer";
import { useAppSelector } from "@/redux/hooks";
import AiHistoryPage from "./ai-history";
import AiCheckHistoryPage from "./ai-check-history";

const { Panel } = Collapse;

interface ICvAuditState {
    [key: string]: {
        status: "pending" | "loading" | "success" | "error";
        result?: string;
        isInvalid?: boolean;
        title: string;
        userName: string;
    };
}

const AdminCVPage = () => {
    const tableRef = useRef<ActionType>();
    const user = useAppSelector(state => state.account.user);
    
    // Modal states for assigning job
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedCv, setSelectedCv] = useState<IFormatCV | null>(null);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | number | undefined>(undefined);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modal states for AI job suggestions
    const [openSuggestJobsModal, setOpenSuggestJobsModal] = useState<boolean>(false);
    const [loadingSuggestJobs, setLoadingSuggestJobs] = useState<boolean>(false);
    const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
    const [selectedCvForSuggestions, setSelectedCvForSuggestions] = useState<IFormatCV | null>(null);
    const [assigningJobId, setAssigningJobId] = useState<string | number | null>(null);

    // 🔹 Selection states for Batch AI Audit
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<IFormatCV[]>([]);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditProgress, setAuditProgress] = useState(0);
    const [auditResults, setAuditResults] = useState<ICvAuditState>({});

    const handleSuggestJobs = async (cv: IFormatCV) => {
        if (!cv.id) return;
        setSelectedCvForSuggestions(cv);
        setOpenSuggestJobsModal(true);
        setLoadingSuggestJobs(true);
        setSuggestedJobs([]);
        try {
            const res = await callSuggestJobsForCv(cv.id);
            if (res && res.data && res.data.jobs) {
                setSuggestedJobs(res.data.jobs);
            } else {
                notification.error({
                    message: 'Gợi ý công việc thất bại',
                    description: res.message || 'Không thể tải danh sách công việc gợi ý.'
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Gợi ý công việc thất bại',
                description: error.message || 'Có lỗi xảy ra khi gọi AI.'
            });
        } finally {
            setLoadingSuggestJobs(false);
        }
    };

    const handleAssignJobDirectly = async (jobId: string | number) => {
        if (!selectedCvForSuggestions || !selectedCvForSuggestions.user) {
            message.error("Không tìm thấy thông tin ứng viên!");
            return;
        }
        setAssigningJobId(jobId);
        try {
            // Find suggestion details
            const suggestion = suggestedJobs.find(j => j.jobId === jobId);
            const matchScore = suggestion?.matchScore;
            const matchReason = suggestion?.matchReason;
            const missingSkills = suggestion?.missingSkills || [];

            // Construct matching report markdown
            const aiReport = `### Báo cáo đánh giá độ phù hợp AI (AI Match Report)\n\n` +
                `- **Vị trí gợi ý**: **${suggestion?.jobTitle || "Unknown"}**\n` +
                `- **Độ phù hợp**: **${matchScore !== undefined ? matchScore : 0}%**\n` +
                `- **Lý do phù hợp**: ${matchReason || "Không có lý do chi tiết."}\n` +
                `- **Kỹ năng thiếu hụt**: ${missingSkills.length > 0 ? missingSkills.join(", ") : "Không có"}`;

            const res = await callCreateResume(
                "", 
                jobId, 
                selectedCvForSuggestions.user.email, 
                selectedCvForSuggestions.user.id, 
                selectedCvForSuggestions.id,
                matchScore,
                aiReport
            );

            if (res && res.data) {
                message.success(`Đã gán ứng viên ${selectedCvForSuggestions.user.name} vào công việc thành công!`);
                setOpenSuggestJobsModal(false);
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Không thể gán CV vào công việc này"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.message || "Lỗi kết nối máy chủ"
            });
        } finally {
            setAssigningJobId(null);
        }
    };

    // Fetch jobs when Modal is opened
    useEffect(() => {
        const fetchJobs = async () => {
            if (isAssignModalOpen) {
                setLoadingJobs(true);
                try {
                    const res = await callFetchAllJob("page=1&size=100&sort=updatedAt,desc");
                    if (res && res.data) {
                        setJobs(res.data.result || []);
                    }
                } catch (error) {
                    message.error("Lỗi khi tải danh sách công việc");
                } finally {
                    setLoadingJobs(false);
                }
            }
        };
        fetchJobs();
    }, [isAssignModalOpen]);

    const reloadTable = () => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
        tableRef?.current?.reload();
    };

    const handleAssignJob = async () => {
        if (!selectedJobId) {
            message.error("Vui lòng chọn công việc ứng tuyển!");
            return;
        }
        if (!selectedCv || !selectedCv.user) {
            message.error("Không tìm thấy thông tin ứng viên!");
            return;
        }

        setSubmitting(true);
        try {
            const res = await callCreateResume(
                "", 
                selectedJobId, 
                selectedCv.user.email, 
                selectedCv.user.id, 
                selectedCv.id
            );

            if (res && res.data) {
                message.success(`Đã thêm ứng viên ${selectedCv.user.name} vào công việc thành công!`);
                setIsAssignModalOpen(false);
                setSelectedJobId(undefined);
                setSelectedCv(null);
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Không thể gán CV vào công việc này"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.message || "Lỗi kết nối máy chủ"
            });
        } finally {
            setSubmitting(false);
        }
    };

    // 🚀 Bắt đầu đánh giá AI hàng loạt cho CV tuyển dụng
    const startBatchAudit = async () => {
        if (selectedRows.length === 0) return;
        setIsBatchModalOpen(true);
        setIsAuditing(true);
        setAuditProgress(0);

        const initialResults: ICvAuditState = {};
        selectedRows.forEach((row) => {
            if (row.id) {
                initialResults[row.id] = {
                    status: "pending",
                    title: row.title || "CV Không tiêu đề",
                    userName: row.user?.name || "Ẩn danh"
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
                // Bước 1: Fetch đầy đủ thông tin CV theo ID
                const detailRes = await callFetchFormatCVById(row.id);
                if (detailRes && detailRes.data) {
                    // Bước 2: Gọi AI đánh giá CV thô
                    const evalRes = await callGptEvaluateCV(detailRes.data);
                    if (evalRes && evalRes.data) {
                        const report = evalRes.data.evaluation;
                        // Kiểm tra xem báo cáo có khuyên từ chối hay không phù hợp không
                        const isInvalid = report.toLowerCase().includes("rejected") ||
                            report.toLowerCase().includes("từ chối") ||
                            report.toLowerCase().includes("không phù hợp");

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
                } else {
                    setAuditResults((prev) => ({
                        ...prev,
                        [row.id!]: {
                            ...prev[row.id!],
                            status: "error",
                            result: "Không thể lấy thông tin chi tiết CV.",
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

    const columns: ProColumns<IFormatCV>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 60,
            hideInSearch: true,
        },
        {
            title: 'Tiêu đề CV',
            dataIndex: 'title',
            sorter: true,
            render: (text, record) => (
                <a href={`/cv/view/${record.id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 550, color: "#1890ff" }}>
                    {record.title}
                </a>
            )
        },
        {
            title: 'Ứng viên',
            dataIndex: ['user', 'name'],
            render: (text, record) => record.user?.name || "N/A"
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'],
            render: (text, record) => record.user?.email || "N/A"
        },
        {
            title: 'Mẫu gốc',
            dataIndex: ['cvTemplate', 'title'],
            hideInSearch: true,
            render: (text, record) => record.cvTemplate?.title || "Mẫu tùy chỉnh"
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
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
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 170,
            sorter: true,
            render: (text, record) => (
                <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
            ),
            hideInSearch: true,
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 140,
            render: (_value, entity) => (
                <Space size="middle">
                    {user?.role?.name === 'EMPLOYER' && (
                        <Tooltip title="Gợi ý công việc AI">
                            <Button 
                                type="text" 
                                icon={<RobotOutlined style={{ fontSize: 18, color: '#1890ff' }} />} 
                                onClick={() => handleSuggestJobs(entity)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Xem chi tiết CV">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined style={{ fontSize: 18, color: '#1890ff' }} />} 
                            onClick={() => window.open(`/cv/view/${entity.id}`, '_blank')}
                        />
                    </Tooltip>
                    <Tooltip title="Thêm vào công việc">
                        <Button 
                            type="text" 
                            icon={<PlusCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />} 
                            onClick={() => {
                                setSelectedCv(entity);
                                setIsAssignModalOpen(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.title) clone.title = `/${clone.title}/i`;
        if (clone["user.name"]) {
            clone["user.name"] = `/${clone["user.name"]}/i`;
        }
        if (clone["user.email"]) {
            clone["user.email"] = `/${clone["user.email"]}/i`;
        }

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.title) {
            sortBy = sort.title === 'ascend' ? "sort=title,asc" : "sort=title,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        if (!sortBy) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    };

    const invalidCvs = Object.values(auditResults).filter(item => item.isInvalid);

    const tabItems = [
        {
            key: '1',
            label: 'Quản lý CV của Ứng viên',
            children: (
                <div style={{ marginTop: 15 }}>
                    <DataTable<IFormatCV>
                        actionRef={tableRef}
                        headerTitle="Quản lý CV của Ứng viên"
                        rowKey="id"
                        columns={columns}
                        request={async (params, sort, filter): Promise<any> => {
                            const query = buildQuery(params, sort, filter);
                            const res = await callFetchFormatCVs(query);
                            if (res && res.data) {
                                return {
                                    data: res.data.result,
                                    success: true,
                                    total: res.data.meta.total
                                };
                            }
                            return {
                                data: [],
                                success: false,
                                total: 0
                            };
                        }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys, rows) => {
                                setSelectedRowKeys(keys);
                                setSelectedRows(rows);
                            }
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

                    {/* Modal Assign to Job */}
                    <Modal
                        title={<span style={{ fontSize: 16, fontWeight: 650 }}>Gán CV vào công việc mong muốn</span>}
                        open={isAssignModalOpen}
                        onOk={handleAssignJob}
                        onCancel={() => {
                            setIsAssignModalOpen(false);
                            setSelectedJobId(undefined);
                            setSelectedCv(null);
                        }}
                        confirmLoading={submitting}
                        okText="Xác nhận gán việc"
                        cancelText="Hủy bỏ"
                        maskClosable={false}
                        destroyOnClose
                    >
                        <div style={{ padding: "10px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                Ứng viên: <b>{selectedCv?.user?.name}</b> ({selectedCv?.user?.email})
                            </div>
                            <div>
                                CV liên kết: <b>{selectedCv?.title}</b>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <span style={{ fontWeight: 500 }}>Chọn công việc ứng tuyển:</span>
                                <Select
                                    showSearch
                                    placeholder="Nhập từ khóa tìm kiếm công việc..."
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    value={selectedJobId}
                                    onChange={(val) => setSelectedJobId(val)}
                                    loading={loadingJobs}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={jobs.map(job => ({
                                        value: job.id,
                                        label: `${job.name} - ${job.company?.name || "N/A"} (${job.location})`
                                    }))}
                                />
                            </div>
                        </div>
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

                        {!isAuditing && invalidCvs.length > 0 && (
                            <Alert
                                message={`Phát hiện ${invalidCvs.length} hồ sơ không phù hợp hoặc đề xuất từ chối!`}
                                description="Vui lòng nhấn vào từng hồ sơ màu đỏ phía dưới để xem báo cáo lý do chi tiết từ AI."
                                type="warning"
                                showIcon
                                style={{ marginBottom: 20 }}
                            />
                        )}

                        {!isAuditing && invalidCvs.length === 0 && (
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
                                                <span style={{ fontWeight: 600 }}>Ứng viên: {info.userName} (CV: {info.title})</span>
                                                {headerTag}
                                            </div>
                                        }
                                        forceRender
                                    >
                                        {info.status === "loading" && <div style={{ textAlign: "center", padding: 20 }}><Spin tip="AI đang phân tích..." /></div>}
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

                    {/* Modal Gợi ý công việc AI */}
                    <Modal
                        title={`Gợi ý công việc AI cho CV: ${selectedCvForSuggestions?.title}`}
                        open={openSuggestJobsModal}
                        onCancel={() => setOpenSuggestJobsModal(false)}
                        footer={[
                            <Button key="close" onClick={() => setOpenSuggestJobsModal(false)}>
                                Đóng
                            </Button>
                        ]}
                        width={800}
                        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
                        destroyOnClose
                    >
                        <List
                            loading={loadingSuggestJobs}
                            dataSource={suggestedJobs}
                            locale={{ emptyText: 'Không tìm thấy công việc phù hợp có độ khớp trên 40% trong công ty của bạn.' }}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        background: '#fafafa',
                                        display: 'block'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{item.jobTitle}</h4>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                            <div style={{ fontWeight: 600, color: item.matchScore >= 80 ? '#52c41a' : item.matchScore >= 60 ? '#1890ff' : '#fa8c16' }}>
                                                Độ phù hợp: {item.matchScore}%
                                            </div>
                                            <Progress 
                                                percent={item.matchScore} 
                                                showInfo={false} 
                                                strokeColor={item.matchScore >= 80 ? '#52c41a' : item.matchScore >= 60 ? '#1890ff' : '#fa8c16'}
                                                size="small" 
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Lý do phù hợp:</strong> <span style={{ color: '#595959' }}>{item.matchReason}</span>
                                    </div>
                                    {item.missingSkills && item.missingSkills.length > 0 && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <strong>Kỹ năng còn thiếu:</strong>{" "}
                                            {item.missingSkills.map((skill: string) => (
                                                <Tag color="volcano" key={skill} style={{ margin: '2px' }}>{skill}</Tag>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                        <Button 
                                            type="primary"
                                            size="small"
                                            loading={assigningJobId === item.jobId}
                                            icon={<PlusCircleOutlined />}
                                            onClick={() => handleAssignJobDirectly(item.jobId)}
                                        >
                                            Gán vào công việc này
                                        </Button>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Modal>
                </div>
            )
        },
        {
            key: '2',
            label: 'Lịch sử gợi ý công việc bằng AI',
            children: (
                <div style={{ marginTop: 15 }}>
                    <AiHistoryPage />
                </div>
            )
        },
        {
            key: '3',
            label: 'Lịch sử kiểm tra CV bằng AI',
            children: (
                <div style={{ marginTop: 15 }}>
                    <AiCheckHistoryPage />
                </div>
            )
        }
    ];

    return (
        <Access permission={ALL_PERMISSIONS.FORMAT_CVS.GET_PAGINATE}>
            <div>
                <Tabs defaultActiveKey="1" items={tabItems} />
            </div>
        </Access>
    );
};

export default AdminCVPage;
