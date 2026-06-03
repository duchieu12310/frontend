import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Spin, Empty, Button, Drawer, Tag, Typography, message, notification, Modal, Radio, Select, Upload, Divider, Row, Col, Popconfirm } from "antd";
import type { UploadProps } from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { callFetchResumeByUser, callUploadSingleFile, callFetchFormatCVs, callUpdateResumeById, callDeleteResume } from "@/config/api";
import { IResume, IFormatCV } from "@/types/backend";
import dayjs from "dayjs";
import MarkdownRenderer from "@/components/share/markdown-renderer";
import styles from "@/styles/applied-jobs.module.scss";

const { Title, Paragraph, Text } = Typography;

const isAbsoluteUrl = (url?: string) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
};

const ClientAppliedJobsPage = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Drawer state for AI Report
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedAiReport, setSelectedAiReport] = useState<string>("");
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>("");

  // Expandable panel states for notes (keys are resume IDs)
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({});

  // Edit CV Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedResume, setSelectedResume] = useState<IResume | null>(null);
  const [editApplyType, setEditApplyType] = useState<"upload" | "created">("upload");
  const [editUrlCV, setEditUrlCV] = useState<string>("");
  const [editSelectedCvId, setEditSelectedCvId] = useState<number | undefined>(undefined);
  const [userCVs, setUserCVs] = useState<IFormatCV[]>([]);
  const [loadingCVs, setLoadingCVs] = useState<boolean>(false);

  // Fetch user's online CV templates for selection
  useEffect(() => {
    const fetchUserCVs = async () => {
      if (isEditModalOpen) {
        setLoadingCVs(true);
        try {
          const res = await callFetchFormatCVs("page=1&size=100&sort=updatedAt,desc");
          if (res && res.data) {
            setUserCVs(res.data.result || []);
          }
        } catch (error) {
          console.error("Lỗi fetch CV: ", error);
        } finally {
          setLoadingCVs(false);
        }
      }
    };
    fetchUserCVs();
  }, [isEditModalOpen]);

  const handleUpdateCv = async () => {
    if (editApplyType === "upload" && !editUrlCV) {
      message.error("Vui lòng upload CV!");
      return;
    }

    if (editApplyType === "created" && !editSelectedCvId) {
      message.error("Vui lòng chọn CV thiết kế!");
      return;
    }

    if (!selectedResume?.id) return;

    const cvUrl = editApplyType === "upload" ? editUrlCV : "";
    const formatCv = editApplyType === "created" ? { id: editSelectedCvId } : null;

    try {
      const res = await callUpdateResumeById(selectedResume.id, {
        url: cvUrl || undefined,
        formatCv: formatCv || undefined
      } as any);

      if (res.data) {
        message.success("Cập nhật CV thành công!");
        setIsEditModalOpen(false);
        fetchAppliedJobs(); // Refresh application list
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: res.message
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi cập nhật CV",
        description: error.message || "Đã xảy ra lỗi khi kết nối với máy chủ."
      });
    }
  };

  const handleDeleteResume = async (id?: string | number) => {
    if (!id) return;
    try {
      const res = await callDeleteResume(id.toString());
      if (res) {
        message.success("Rút hồ sơ ứng tuyển thành công!");
        fetchAppliedJobs(); // Refresh the list
      } else {
        notification.error({
          message: "Có lỗi xảy ra",
          description: "Không thể rút hồ sơ ứng tuyển."
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi rút hồ sơ",
        description: error.message || "Đã xảy ra lỗi khi kết nối với máy chủ."
      });
    }
  };

  const editUploadProps: UploadProps = {
    maxCount: 1,
    multiple: false,
    accept: "application/pdf,application/msword, .doc, .docx, .pdf",
    async customRequest({ file, onSuccess, onError }: any) {
      const res = await callUploadSingleFile(file, "resume");
      if (res && res.data) {
        setEditUrlCV(res.data.fileName);
        if (onSuccess) onSuccess("ok");
      } else {
        if (onError) {
          setEditUrlCV("");
          const error = new Error(res.message);
          onError({ event: error });
        }
      }
    },
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.");
      }
    },
  };

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const res = await callFetchResumeByUser();
      if (res && res.data) {
        // Handle pagination response structure: res.data.result contains list of IResume
        const results = (res.data.result || []) as IResume[];
        setResumes(results);
      } else {
        message.error("Không thể tải danh sách lịch sử ứng tuyển.");
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi tải dữ liệu",
        description: error.message || "Đã xảy ra lỗi khi kết nối với máy chủ."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const toggleNotes = (id: string | number) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper function to format status badge
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <div className={`${styles.statusBadge} ${styles.approved}`}>
            <CheckCircleOutlined /> Đã nhận việc / Hẹn phỏng vấn
          </div>
        );
      case "REJECTED":
        return (
          <div className={`${styles.statusBadge} ${styles.rejected}`}>
            <CloseCircleOutlined /> Từ chối
          </div>
        );
      case "REVIEWING":
        return (
          <div className={`${styles.statusBadge} ${styles.reviewing}`}>
            <SyncOutlined spin /> Đang xem xét
          </div>
        );
      case "REVISION_REQUIRED":
        return (
          <div className={`${styles.statusBadge} ${styles.revision}`}>
            <InfoCircleOutlined /> Cần bổ sung hồ sơ
          </div>
        );
      case "PENDING":
      default:
        return (
          <div className={`${styles.statusBadge} ${styles.pending}`}>
            <ClockCircleOutlined /> Đang chờ
          </div>
        );
    }
  };

  // Calculate statistics
  const totalApplied = resumes.length;
  const approvedCount = resumes.filter(r => r.status === "APPROVED").length;
  const pendingCount = resumes.filter(r => r.status === "PENDING" || r.status === "REVIEWING").length;
  const rejectedCount = resumes.filter(r => r.status === "REJECTED").length;

  const handleOpenAiReport = (report: string, jobTitle: string) => {
    setSelectedAiReport(report);
    setSelectedJobTitle(jobTitle);
    setIsDrawerOpen(true);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <Button 
          shape="circle" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/")} 
          style={{ border: "1px solid #cbd5e1" }}
        />
        <div>
          <h2>Lịch sử ứng tuyển</h2>
          <Text type="secondary">Xem các vị trí công việc bạn đã nộp hồ sơ và tiến trình đánh giá</Text>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải lịch sử ứng tuyển..." />
        </div>
      ) : (
        <>
          {/* Summary Dashboard */}
          <div className={styles.summaryGrid}>
            <div className={`${styles.summaryCard} ${styles.total}`}>
              <span className={styles.cardLabel}>Đã ứng tuyển</span>
              <span className={styles.cardNumber}>{totalApplied}</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.approved}`}>
              <span className={styles.cardLabel}>Đã nhận / Hẹn gặp</span>
              <span className={styles.cardNumber}>{approvedCount}</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.pending}`}>
              <span className={styles.cardLabel}>Đang chờ xử lý</span>
              <span className={styles.cardNumber}>{pendingCount}</span>
            </div>
            <div className={`${styles.summaryCard} ${styles.rejected}`}>
              <span className={styles.cardLabel}>Từ chối / Chưa đạt</span>
              <span className={styles.cardNumber}>{rejectedCount}</span>
            </div>
          </div>

          {/* Applied Jobs List */}
          <div className={styles.listSection}>
            {resumes.length === 0 ? (
              <Empty
                description="Bạn chưa nộp hồ sơ ứng tuyển nào."
                style={{ padding: "60px 0" }}
              >
                <Button type="primary" onClick={() => navigate("/job")}>
                  Khám phá việc làm ngay
                </Button>
              </Empty>
            ) : (
              resumes.map((item) => {
                const hasNote = !!item.note;
                const hasAiReport = !!item.aiReport;
                const isExpanded = !!expandedNotes[item.id!];
                
                return (
                  <div key={item.id} className={styles.appCard}>
                    <div className={styles.cardHeader}>
                      {/* Job details */}
                      <div className={styles.jobInfo}>
                        <div className={styles.companyLogo}>
                          {item.job?.company?.logo ? (
                            <img 
                              src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item.job.company.logo}`} 
                              alt={item.job.company.name} 
                            />
                          ) : (
                            item.job?.company?.name?.charAt(0).toUpperCase() || "C"
                          )}
                        </div>
                        <div className={styles.titleArea}>
                          <h4 
                            className={styles.jobTitle}
                            onClick={() => navigate(`/job/${item.job?.id}`)}
                            style={{ cursor: "pointer" }}
                          >
                            {item.job?.name}
                          </h4>
                          <span className={styles.companyName}>{item.job?.company?.name}</span>
                        </div>
                      </div>

                      {/* Application Meta details */}
                      <div className={styles.metaInfo}>
                        <div className={styles.metaItem}>
                          <span className={styles.label}>Ngày rải CV</span>
                          <span className={styles.value}>
                            {dayjs(item.createdAt).format("DD-MM-YYYY HH:mm")}
                          </span>
                        </div>
                        
                        {item.matchScore !== null && item.matchScore !== undefined && (
                          <div className={styles.metaItem}>
                            <span className={styles.label}>Độ tương thích</span>
                            <span className={styles.value}>
                              <span className={styles.scoreBadge}>
                                <RobotOutlined /> {item.matchScore}%
                              </span>
                            </span>
                          </div>
                        )}

                        <div className={styles.metaItem}>
                          <span className={styles.label}>CV đã nộp</span>
                          <span className={styles.value}>
                            {item.url ? (
                              <a 
                                href={isAbsoluteUrl(item.url) ? item.url : `${import.meta.env.VITE_BACKEND_URL}/storage/resume/${item.url}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <DownloadOutlined /> Xem CV
                              </a>
                            ) : item.formatCv?.id ? (
                              <a 
                                href={`/cv/view/${item.formatCv.id}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <EyeOutlined /> Xem CV Online
                              </a>
                            ) : (
                              <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Mẫu CV trực tuyến</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Status and Action dropdown/button */}
                      <div className={styles.statusWrapper}>
                        {renderStatusBadge(item.status)}
                        
                        {(item.status === "PENDING" || item.status === "REVISION_REQUIRED" || item.status === "REVIEWING") && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <Button
                              type="primary"
                              ghost
                              icon={<EditOutlined />}
                              onClick={() => {
                                setSelectedResume(item);
                                setEditUrlCV(item.url || "");
                                setEditSelectedCvId(item.formatCv?.id);
                                setEditApplyType(item.formatCv?.id ? "created" : "upload");
                                setIsEditModalOpen(true);
                              }}
                              size="small"
                            >
                              Cập nhật CV
                            </Button>

                            <Popconfirm
                              title="Rút hồ sơ ứng tuyển"
                              description="Bạn có chắc chắn muốn rút hồ sơ cho công việc này không?"
                              onConfirm={() => handleDeleteResume(item.id)}
                              okText="Rút hồ sơ"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="primary"
                                danger
                                ghost
                                icon={<DeleteOutlined />}
                                size="small"
                              >
                                Rút hồ sơ
                              </Button>
                            </Popconfirm>
                          </div>
                        )}

                        {(hasNote || hasAiReport) && (
                          <button 
                            className={styles.actionButton}
                            onClick={() => toggleNotes(item.id!)}
                          >
                            <EyeOutlined /> {isExpanded ? "Ẩn chi tiết" : "Xem chi tiết"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detailed info panel */}
                    {isExpanded && (
                      <div className={styles.detailsPanel}>
                        {hasNote && (
                          <div style={{ marginBottom: hasAiReport ? "12px" : "0" }}>
                            <div className={styles.panelHeader}>
                              <InfoCircleOutlined /> Phản hồi từ nhà tuyển dụng:
                            </div>
                            <div className={styles.panelContent}>
                              {item.status === "APPROVED" ? (
                                <Text strong style={{ color: "#059669" }}>
                                  🎉 Lịch hẹn phỏng vấn: {item.note}
                                </Text>
                              ) : (
                                <Paragraph style={{ margin: 0 }}>{item.note}</Paragraph>
                              )}
                            </div>
                          </div>
                        )}

                        {hasAiReport && (
                          <div>
                            <div className={styles.panelHeader}>
                              <RobotOutlined /> Phân tích hồ sơ bằng AI:
                            </div>
                            <Button 
                              type="dashed" 
                              icon={<RobotOutlined />}
                              onClick={() => handleOpenAiReport(item.aiReport!, item.job?.name || "")}
                              style={{ width: "100%", height: "40px", borderRadius: "8px", marginTop: "4px" }}
                            >
                              Nhấp để xem Báo cáo phân tích CV từ AI
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* AI Report Drawer */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#14372f" }}>
            <RobotOutlined style={{ fontSize: "20px" }} />
            <span>Báo cáo tương thích AI - {selectedJobTitle}</span>
          </div>
        }
        placement="right"
        width={750}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        bodyStyle={{ padding: "24px", background: "#f8fafc" }}
      >
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <MarkdownRenderer content={selectedAiReport} />
        </div>
      </Drawer>

      {/* Edit CV Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#14372f" }}>
            <EditOutlined />
            <span>Cập nhật CV ứng tuyển - {selectedResume?.job?.name}</span>
          </div>
        }
        open={isEditModalOpen}
        onOk={handleUpdateCv}
        onCancel={() => setIsEditModalOpen(false)}
        maskClosable={false}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        destroyOnClose={true}
        width={600}
      >
        <Divider style={{ margin: "12px 0" }} />
        <Row gutter={[16, 16]} style={{ padding: "10px 0" }}>
          <Col span={24}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Hình thức nộp CV mới</label>
              <Radio.Group
                value={editApplyType}
                onChange={(e) => setEditApplyType(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio value="upload">Tải lên file CV mới</Radio>
                <Radio value="created">Chọn CV đã thiết kế</Radio>
              </Radio.Group>
            </div>
          </Col>

          {editApplyType === "upload" ? (
            <Col span={24}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Tải lên file CV mới</label>
                <Upload {...editUploadProps}>
                  <Button icon={<UploadOutlined />} style={{ width: "100%", textAlign: "left" }}>
                    Tải lên file CV (Hỗ trợ *.doc, *.docx, *.pdf và &lt; 5MB)
                  </Button>
                </Upload>
                {editUrlCV && !editUrlCV.startsWith("http") && (
                  <div style={{ marginTop: 8, fontSize: "13px", color: "#64748b" }}>
                    Tệp hiện tại: <span style={{ fontWeight: 600 }}>{editUrlCV}</span>
                  </div>
                )}
              </div>
            </Col>
          ) : (
            <Col span={24}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#334155" }}>Chọn bản CV đã thiết kế</label>
                {userCVs.length > 0 ? (
                  <Select
                    placeholder="Chọn bản CV thiết kế đã lưu"
                    style={{ width: "100%" }}
                    value={editSelectedCvId}
                    onChange={(val) => setEditSelectedCvId(val)}
                    loading={loadingCVs}
                  >
                    {userCVs.map((cv) => (
                      <Select.Option key={cv.id} value={cv.id}>
                        {cv.title} (Cập nhật: {cv.updatedAt ? dayjs(cv.updatedAt).format("DD-MM-YYYY HH:mm") : dayjs(cv.createdAt).format("DD-MM-YYYY HH:mm")})
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <div style={{ color: "#ff4d4f", fontSize: "14px" }}>
                    Bạn chưa tạo bản thiết kế CV nào.{" "}
                    <Link to="/cv" onClick={() => setIsEditModalOpen(false)}>
                      Bấm vào đây để tạo CV ngay!
                    </Link>
                  </div>
                )}
              </div>
            </Col>
          )}
        </Row>
      </Modal>
    </div>
  );
};

export default ClientAppliedJobsPage;
