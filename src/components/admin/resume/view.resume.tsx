import { callUpdateResumeStatus, callEvaluateResume } from "@/config/api";
import { IResume } from "@/types/backend";
import { Badge, Button, Descriptions, Drawer, Form, Select, message, notification, Tabs, Spin, Alert } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useAppSelector } from "@/redux/hooks";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { RobotOutlined, InfoCircleOutlined, AuditOutlined } from "@ant-design/icons";
import MarkdownRenderer from "@/components/share/markdown-renderer";

const { Option } = Select;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    const permissions = useAppSelector(state => state.account.user.role?.permissions ?? []);
    const [hasUpdatePermission, setHasUpdatePermission] = useState<boolean>(false);

    // AI Evaluation states
    const [evaluationResult, setEvaluationResult] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

    useEffect(() => {
        if (dataInit) {
            const cached = sessionStorage.getItem(`resume-eval-${dataInit.id}`);
            setEvaluationResult(dataInit.aiReport || cached || null);
        } else {
            setEvaluationResult(null);
        }
        setIsEvaluating(false);
    }, [dataInit]);

    useEffect(() => {
        if (permissions?.length) {
            const check = permissions.find(item =>
                item.apiPath === ALL_PERMISSIONS.RESUMES.UPDATE.apiPath
                && item.method === ALL_PERMISSIONS.RESUMES.UPDATE.method
                && item.module === ALL_PERMISSIONS.RESUMES.UPDATE.module
            );
            if (check || import.meta.env.VITE_ACL_ENABLE === 'false') {
                setHasUpdatePermission(true);
            } else {
                setHasUpdatePermission(false);
            }
        } else {
            setHasUpdatePermission(import.meta.env.VITE_ACL_ENABLE === 'false');
        }
    }, [permissions]);

    const handleChangeStatus = async () => {
        setIsSubmit(true);

        const status = form.getFieldValue('status');
        const res = await callUpdateResumeStatus(dataInit?.id, status)
        if (res.data) {
            message.success("Update Resume status thành công!");
            setDataInit(null);
            onClose(false);
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsSubmit(false);
    }

    const handleEvaluate = async () => {
        if (!dataInit?.id) return;
        setIsEvaluating(true);
        try {
            const res = await callEvaluateResume(dataInit.id);
            if (res && res.data) {
                const report = res.data.evaluation;
                const score = res.data.matchScore;
                setEvaluationResult(report);
                sessionStorage.setItem(`resume-eval-${dataInit.id}`, report);
                
                // Update local dataInit to reflect the new AI evaluation details
                setDataInit((prev: any) => {
                    if (prev) {
                        return { ...prev, aiReport: report, matchScore: score };
                    }
                    return prev;
                });
                
                notification.success({
                    message: "Thành công",
                    description: "Đã hoàn thành đánh giá CV bằng AI!"
                });
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Không thể phân tích đánh giá hồ sơ."
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi kết nối",
                description: error.message || "Không thể kết nối đến máy chủ AI."
            });
        } finally {
            setIsEvaluating(false);
        }
    };

    useEffect(() => {
        if (dataInit) {
            form.setFieldValue("status", dataInit.status)
        }
        return () => form.resetFields();
    }, [dataInit])

    const tabItems = [
        {
            key: "details",
            label: (
                <span>
                    <InfoCircleOutlined />
                    Thông Tin Resume
                </span>
            ),
            children: dataInit ? (
                <Descriptions title="" bordered column={2} layout="vertical" style={{ marginTop: 10 }}>
                    <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Form form={form}>
                            <Form.Item name={"status"} style={{ marginBottom: 0 }}>
                                <Select
                                    style={{ width: "100%" }}
                                    defaultValue={dataInit?.status}
                                    disabled={!hasUpdatePermission}
                                >
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="REVIEWING">REVIEWING</Option>
                                    <Option value="APPROVED">APPROVED</Option>
                                    <Option value="REJECTED">REJECTED</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Job">
                        {dataInit?.job?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Công Ty">
                        {dataInit?.companyName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Chi tiết CV" span={2}>
                        {dataInit?.formatCv ? (
                            <a
                                href={`/cv/view/${dataInit.formatCv.id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontWeight: "bold", color: "#1890ff" }}
                            >
                                Xem CV thiết kế ({dataInit.formatCv.title})
                            </a>
                        ) : dataInit?.url ? (
                            <a
                                href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${dataInit.url}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontWeight: "bold", color: "#1890ff" }}
                            >
                                Tải/Xem file CV đính kèm
                            </a>
                        ) : (
                            <span style={{ color: "#ff4d4f" }}>Không có thông tin CV</span>
                        )}
                    </Descriptions.Item>
                </Descriptions>
            ) : null
        },
        {
            key: "ai-eval",
            label: (
                <span>
                    <RobotOutlined />
                    AI Đánh giá CV
                </span>
            ),
            children: (
                <div style={{ padding: "10px 0" }}>
                    {!dataInit?.formatCv && (!dataInit?.url || !dataInit?.url.toLowerCase().endsWith(".pdf")) && (
                        <Alert
                            message="Lưu ý về định dạng CV"
                            description="CV hiện tại không phải dạng file PDF hoặc CV thiết kế nội bộ. AI có thể gặp khó khăn hoặc không trích xuất đầy đủ nội dung nếu định dạng không phù hợp."
                            type="info"
                            showIcon
                            style={{ marginBottom: 15 }}
                        />
                    )}
                    {isEvaluating ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 20, fontSize: "14px", color: "#595959", textAlign: "center" }}>
                                <p style={{ fontWeight: 600, color: "#1890ff" }}>Trợ lý AI đang đối chiếu hồ sơ tuyển dụng...</p>
                                <p style={{ fontSize: "12px" }}>Đang chấm điểm độ tương thích, phân tích ma trận từ khóa ATS và chất lượng viết theo chuẩn Google XYZ.</p>
                            </div>
                        </div>
                    ) : evaluationResult ? (
                        <div style={{ padding: "15px", border: "1px solid #f0f0f0", borderRadius: "8px", background: "#fafafa" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                                <span style={{ fontWeight: 650, color: "#111", fontSize: "15px" }}>
                                    <AuditOutlined style={{ marginRight: 8, color: "#fa541c" }} />
                                    Báo cáo phân tích đối chiếu CV & Job
                                </span>
                                <Button size="small" type="dashed" icon={<RobotOutlined />} onClick={handleEvaluate}>
                                    Đánh giá lại
                                </Button>
                            </div>
                            <MarkdownRenderer content={evaluationResult} />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", border: "1px dashed #d9d9d9", borderRadius: "8px" }}>
                            <RobotOutlined style={{ fontSize: 48, color: "#bfbfbf", marginBottom: 16 }} />
                            <h3>Đánh giá CV bằng AI</h3>
                            <p style={{ color: "#8c8c8c", textAlign: "center", maxWidth: 380, marginBottom: 20, fontSize: "13px" }}>
                                So khớp tự động kỹ năng, kinh nghiệm trong CV của ứng viên với mô tả công việc đang tuyển dụng của bạn.
                            </p>
                            <Button type="primary" size="large" icon={<RobotOutlined />} onClick={handleEvaluate}>
                                Bắt đầu đánh giá bằng AI
                            </Button>
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <>
            <Drawer
                title="Thông Tin Resume"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"60vw"}
                maskClosable={false}
                destroyOnClose
                extra={
                    hasUpdatePermission &&
                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Change Status
                    </Button>
                }
            >
                {dataInit ? (
                    <Tabs defaultActiveKey="details" items={tabItems} />
                ) : (
                    <p>Không có dữ liệu</p>
                )}
            </Drawer>
        </>
    )
}

export default ViewDetailResume;