import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IJob } from "@/types/backend";
import { callFetchJobById, callFetchJob } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag, Button, Breadcrumb, Typography, Card } from "antd";
import {
    DollarOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    SendOutlined
} from "@ant-design/icons";
import { getLocationName, convertSlug } from "@/config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const ClientJobDetailPage = (props: any) => {
    const [jobDetail, setJobDetail] = useState<IJob | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [similarJobs, setSimilarJobs] = useState<IJob[]>([]);

    let location = useLocation();
    const navigate = useNavigate();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchJobById(id);
                if (res?.data) {
                    setJobDetail(res.data)
                    fetchSimilarJobs(res.data);
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    const fetchSimilarJobs = async (currentJob: IJob) => {
        let query = `page=1&size=6&sort=createdAt,desc`;

        if (currentJob.skills && currentJob.skills.length > 0) {
            const skillIds = currentJob.skills.map(item => item.id).join("','");
            query += `&filter=skills.id in ('${skillIds}')`;
        } else if (currentJob.location) {
            query += `&filter=location:'${currentJob.location}'`;
        }

        const res = await callFetchJob(query);
        if (res && res.data) {
            const filteredJobs = res.data.result.filter(job => job.id !== currentJob.id);
            if (filteredJobs.length > 5) {
                setSimilarJobs(filteredJobs.slice(0, 6));
            } else {
                setSimilarJobs(filteredJobs);
            }
        }
    }

    const handleViewCompanyDetail = (item: IJob) => {
        if (item.company && item.company.name) {
            const slug = convertSlug(item.company.name);
            navigate(`/company/${slug}?id=${item.company.id}`);
        }
    }

    return (
        <div className={styles["detail-job-section"]} style={{ padding: '20px 0', backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 100px)' }}>
            <div className={styles["container"]} style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Breadcrumb
                    style={{ margin: '16px 0' }}
                    items={[
                        {
                            title: <Link to={"/"}>Trang Chủ</Link>,
                        },
                        {
                            title: <Link to={"/job"}>Việc Làm</Link>,
                        },
                        {
                            title: jobDetail?.name ?? "Chi tiết công việc",
                        },
                    ]}
                />
                {isLoading ?
                    <Skeleton active paragraph={{ rows: 8 }} />
                    :
                    <Row gutter={[24, 24]}>
                        {jobDetail && jobDetail.id && (
                            <>
                                {/* Main Content Column */}
                                <Col span={24} md={16}>
                                    {/* Job Header Card */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                                        <Title level={2} style={{ marginBottom: 16, color: '#2c3e50', fontSize: 28 }}>{jobDetail.name}</Title>

                                        <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ backgroundColor: '#e6f7ff', padding: 8, borderRadius: '50%', color: '#1890ff' }}>
                                                    <DollarOutlined style={{ fontSize: 18 }} />
                                                </div>
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Mức lương</Text>
                                                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                                        {(jobDetail.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                                                    </Text>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ backgroundColor: '#fff7e6', padding: 8, borderRadius: '50%', color: '#fa8c16' }}>
                                                    <EnvironmentOutlined style={{ fontSize: 18 }} />
                                                </div>
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Địa điểm</Text>
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {getLocationName(jobDetail.location)}
                                                    </Text>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ backgroundColor: '#f6ffed', padding: 8, borderRadius: '50%', color: '#52c41a' }}>
                                                    <HistoryOutlined style={{ fontSize: 18 }} />
                                                </div>
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Kinh nghiệm</Text>
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {jobDetail.level || 'Không yêu cầu'}
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: 24 }}>
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<SendOutlined />}
                                                onClick={() => setIsModalOpen(true)}
                                                style={{ height: 48, padding: '0 32px', fontSize: 16, borderRadius: 8, fontWeight: 600 }}
                                            >
                                                Ứng tuyển ngay
                                            </Button>
                                            <span style={{ marginLeft: 16, color: '#8c8c8c' }}>
                                                <ClockCircleOutlined /> Hạn nộp hồ sơ: {dayjs(jobDetail.endDate).format('DD/MM/YYYY')}
                                            </span>
                                        </div>

                                        <Divider dashed />

                                        <div style={{ marginBottom: 12 }}>
                                            <Text strong style={{ marginRight: 8 }}>Kỹ năng:</Text>
                                            {jobDetail?.skills?.map((item, index) => (
                                                <Tag key={`${index}-key`} color="geekblue" style={{ padding: '4px 10px', fontSize: 14 }}>
                                                    {item.name}
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Job Description Card */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                                        <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 24 }}>Mô tả công việc</Title>
                                        <div style={{ lineHeight: 1.8, fontSize: 15, color: '#333' }}>
                                            {parse(jobDetail.description)}
                                        </div>
                                    </div>

                                    {/* Requirements Card */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                                        <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 24 }}>Yêu cầu công việc</Title>
                                        <ul style={{ lineHeight: 2, fontSize: 15, color: '#333', paddingLeft: 20 }}>
                                            {[
                                                "Tốt nghiệp Đại học chuyên ngành liên quan đến IT hoặc tương đương.",
                                                "Có tối thiểu 1-2 năm kinh nghiệm làm việc thực tế với các công nghệ yêu cầu.",
                                                "Tư duy logic tốt, có khả năng giải quyết vấn đề.",
                                                "Có khả năng đọc hiểu tài liệu tiếng Anh chuyên ngành.",
                                                "Chủ động trong công việc, có tinh thần trách nhiệm cao.",
                                                "Có kinh nghiệm sử dụng GIT quản lý source code (GitLab/GitHub).",
                                                "Hiểu biết về quy trình phát triển phần mềm Agile/Scrum.",
                                                "Có kỹ năng làm việc nhóm tốt, hòa đồng và sẵn sàng hỗ trợ đồng nghiệp.",
                                                "Sẵn sàng học hỏi các công nghệ mới, cập nhật xu hướng công nghệ.",
                                                "Ưu tiên ứng viên có kiến thức về Cloud (AWS/Azure) và Containerization (Docker).",
                                                "Có khả năng làm việc dưới áp lực cao và đảm bảo tiến độ dự án.",
                                                `Mã tham chiếu nội bộ: ${dayjs().valueOf().toString(16).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                            ].slice(0, 5).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Benefits Card */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
                                        <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 24 }}>Quyền lợi</Title>
                                        <ul style={{ lineHeight: 2, fontSize: 15, color: '#333', paddingLeft: 20 }}>
                                            {[
                                                "Mức lương cạnh tranh, review lương 2 lần/năm (tháng 6 và tháng 12).",
                                                "Thưởng tháng 13, thưởng hiệu quả dự án, thưởng các dịp lễ tết.",
                                                "Được đóng BHXH, BHYT, BHTN full lương theo quy định của nhà nước.",
                                                "Gói bảo hiểm sức khỏe cao cấp (PVI/BaoViet) cho nhân viên và người thân.",
                                                "Môi trường làm việc trẻ trung, năng động, chuyên nghiệp (Open office).",
                                                "Tham gia các khóa đào tạo nâng cao kỹ năng chuyên môn và kỹ năng mềm.",
                                                "Du lịch nghỉ mát hàng năm (Company Trip), Team Building hàng quý.",
                                                "Khám sức khỏe định kỳ hàng năm tại các bệnh viện uy tín.",
                                                "Được cung cấp đầy đủ trang thiết bị làm việc hiện đại (Macbook Pro/Dell XPS).",
                                                "Câu lạc bộ thể thao, giải trí, Teabreak, coffee miễn phí hàng ngày.",
                                                "Cơ hội thăng tiến rõ ràng, được Mentor hướng dẫn phát triển nghề nghiệp.",
                                                "Thời gian làm việc linh hoạt, Hybrid working (lên văn phòng 3-4 ngày/tuần)."
                                            ].slice(0, 5).map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* General Info Card */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <Title level={4} style={{ borderLeft: '4px solid #1890ff', paddingLeft: 12, marginBottom: 24 }}>Thông tin chung</Title>
                                        <Row gutter={[30, 20]}>
                                            <Col span={12} md={8}>
                                                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Ngày đăng</div>
                                                <div style={{ fontWeight: 500 }}>{jobDetail.createdAt ? dayjs(jobDetail.createdAt).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY")}</div>
                                            </Col>
                                            <Col span={12} md={8}>
                                                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Cấp bậc</div>
                                                <div style={{ fontWeight: 500 }}>{jobDetail.level || 'Nhân viên'}</div>
                                            </Col>
                                            <Col span={12} md={8}>
                                                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Số lượng tuyển</div>
                                                <div style={{ fontWeight: 500 }}>{jobDetail.quantity || 1} người</div>
                                            </Col>
                                            <Col span={12} md={8}>
                                                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Hình thức làm việc</div>
                                                <div style={{ fontWeight: 500 }}>Toàn thời gian</div>
                                            </Col>
                                            <Col span={24} md={16}>
                                                <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>Mã tin tuyển dụng</div>
                                                <div style={{ fontWeight: 500, fontFamily: 'monospace', letterSpacing: 1 }}>
                                                    JOB-{jobDetail.id}-{Math.random().toString(36).substring(2, 12).toUpperCase()}
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                </Col>

                                {/* Sidebar Column */}
                                <Col span={24} md={8}>
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                            <img
                                                alt="Company Logo"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${jobDetail.company?.logo}`}
                                                style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 8, border: '1px solid #f0f0f0', padding: 4 }}
                                            />
                                            <Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>{jobDetail.company?.name}</Title>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, color: '#8c8c8c' }}>
                                                <EnvironmentOutlined /> {getLocationName(jobDetail.location)}
                                            </div>
                                        </div>

                                        <Divider />

                                        <div style={{ marginBottom: 16 }}>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Quy mô công ty</Text>
                                            <Text strong>50 - 100 nhân viên</Text>
                                        </div>

                                        <div style={{ marginBottom: 16 }}>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Lĩnh vực</Text>
                                            <Text strong>Công nghệ thông tin</Text>
                                        </div>

                                        <Button
                                            block
                                            type="default"
                                            onClick={() => handleViewCompanyDetail(jobDetail)}
                                            style={{ borderColor: '#1890ff', color: '#1890ff', marginTop: 12 }}
                                        >
                                            Xem trang công ty
                                        </Button>
                                    </div>

                                    {/* Similar Jobs Section */}
                                    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: 24 }}>
                                        <Title level={5} style={{ marginBottom: 16 }}>Việc làm tương tự</Title>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {similarJobs.length > 0 ? similarJobs.map((job) => (
                                                <div
                                                    key={job.id}
                                                    style={{ border: '1px solid #f0f0f0', padding: 12, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onClick={() => navigate(`/job/${convertSlug(job.name)}?id=${job.id}`)}
                                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none'; }}
                                                >
                                                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 14, color: '#2c3e50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.name}</div>
                                                    <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{job.company?.name}</div>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        <Tag color="geekblue" style={{ margin: 0, fontSize: 11 }}>{getLocationName(job.location)}</Tag>
                                                        <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                                                            {(job.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " đ"}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            )) : (
                                                <Text type="secondary" style={{ fontSize: 13, textAlign: 'center' }}>Chưa có việc làm tương tự</Text>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            </>
                        )}
                    </Row>
                }
            </div>
            <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                jobDetail={jobDetail}
            />
        </div>
    )
}
export default ClientJobDetailPage;