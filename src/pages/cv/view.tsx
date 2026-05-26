import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Button, message, notification } from "antd";
import { LeftOutlined, PrinterOutlined, PhoneOutlined, MailOutlined, HomeOutlined, GithubOutlined, LinkedinOutlined, CalendarOutlined } from "@ant-design/icons";
import { callFetchFormatCVById } from "@/config/api";
import { IFormatCV, IPersonalInformation } from "@/types/backend";
import dayjs from "dayjs";
import styles from "@/styles/cv.module.scss";

const defaultSections = [
    { sectionKey: "careerObjectives", sectionName: "Mục tiêu nghề nghiệp", columnPlacement: "left", orderIndex: 1, visible: true },
    { sectionKey: "workExperiences", sectionName: "Kinh nghiệm làm việc", columnPlacement: "left", orderIndex: 2, visible: true },
    { sectionKey: "projects", sectionName: "Dự án cá nhân", columnPlacement: "left", orderIndex: 3, visible: true },
    { sectionKey: "educations", sectionName: "Học vấn", columnPlacement: "right", orderIndex: 1, visible: true },
    { sectionKey: "technicalSkills", sectionName: "Kỹ năng chuyên môn", columnPlacement: "right", orderIndex: 2, visible: true },
    { sectionKey: "softSkills", sectionName: "Kỹ năng mềm", columnPlacement: "right", orderIndex: 3, visible: true },
    { sectionKey: "certifications", sectionName: "Chứng chỉ", columnPlacement: "right", orderIndex: 4, visible: true },
    { sectionKey: "languages", sectionName: "Ngoại ngữ", columnPlacement: "right", orderIndex: 5, visible: true },
    { sectionKey: "activities", sectionName: "Hoạt động", columnPlacement: "right", orderIndex: 6, visible: true },
    { sectionKey: "hobbies", sectionName: "Sở thích", columnPlacement: "right", orderIndex: 7, visible: true },
];

const ViewCV = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [cvData, setCvData] = useState<IFormatCV | null>(null);

    useEffect(() => {
        const fetchCV = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await callFetchFormatCVById(Number(id));
                if (res?.data) {
                    setCvData(res.data);
                } else {
                    message.error("Không tìm thấy CV yêu cầu");
                }
            } catch (error: any) {
                notification.error({
                    message: "Lỗi tải CV",
                    description: error.message || "Đã xảy ra lỗi khi kết nối máy chủ"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCV();
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <Spin size="large" tip="Đang tải CV..." />
            </div>
        );
    }

    if (!cvData) {
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <h3>Không tìm thấy dữ liệu CV</h3>
                <Button onClick={() => navigate(-1)} icon={<LeftOutlined />}>Quay lại</Button>
            </div>
        );
    }

    const personal = (cvData.personalInformations?.[0] || {}) as IPersonalInformation;
    const name = personal.fullName || "Họ và Tên";
    const phone = personal.phone || "Số điện thoại";
    const email = personal.email || "Email liên hệ";
    const address = personal.address || "Địa chỉ";
    const github = personal.github || "";
    const linkedin = personal.linkedin || "";
    const avatarUrl = personal.image || "";
    const dob = personal.dateOfBirth ? dayjs(personal.dateOfBirth).format("DD/MM/YYYY") : "";

    const educations = cvData.educations || [];
    const careerObjectives = cvData.careerObjectives || [];
    const workExperiences = cvData.workExperiences || [];
    const projects = cvData.projects || [];
    const technicalSkills = cvData.technicalSkills || [];
    const softSkills = cvData.softSkills || [];
    const certifications = cvData.certifications || [];
    const activities = cvData.activities || [];
    const languages = cvData.languages || [];
    const hobbies = cvData.hobbies || [];

    const getInitials = (n: string) => {
        if (!n) return "?";
        const parts = n.trim().split(" ");
        return parts[parts.length - 1]?.charAt(0).toUpperCase() || "?";
    };

    const getThemeClass = (themeName?: string) => {
        switch (themeName) {
            case "emerald": return styles.themeEmerald;
            case "blue": return styles.themeBlue;
            case "slate": return styles.themeSlate;
            case "brown":
            default:
                return styles.themeBrown;
        }
    };

    const getLayoutClass = (layoutName?: string) => {
        switch (layoutName) {
            case "two-column-left": return styles.layoutLeft;
            case "single-column": return styles.layoutSingle;
            case "two-column-right":
            default:
                return styles.layoutRight;
        }
    };

    const renderSection = (key: string) => {
        switch (key) {
            case "careerObjectives":
                return careerObjectives.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Mục tiêu nghề nghiệp</h3>
                        <div className={styles.sectionContent}>
                            {careerObjectives.map((obj: any, idx: number) => (
                                <p key={idx} style={{ marginBottom: 6 }} className={styles.sectionContent}>• {obj.content}</p>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "workExperiences":
                return workExperiences.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Kinh nghiệm làm việc</h3>
                        <div className={styles.sectionContent}>
                            {workExperiences.map((exp: any, idx: number) => (
                                <div key={idx} className={styles.experienceItem}>
                                    <div className={styles.itemHeader}>
                                        <span>{exp.position}</span>
                                        <span style={{ fontWeight: "normal", fontSize: "10px" }}>
                                            {exp.startDate ? dayjs(exp.startDate).format("MM/YYYY") : ""} - {exp.endDate ? dayjs(exp.endDate).format("MM/YYYY") : "Hiện tại"}
                                        </span>
                                    </div>
                                    <div className={styles.itemSubheader}>{exp.company}</div>
                                    {exp.description && <div className={styles.itemDetail}>{exp.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "projects":
                return projects.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Dự án cá nhân</h3>
                        <div className={styles.sectionContent}>
                            {projects.map((proj: any, idx: number) => (
                                <div key={idx} className={styles.projectItem}>
                                    <div className={styles.itemHeader}>
                                        <span>{proj.projectName}</span>
                                        {proj.githubLink && (
                                            <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: "10px" }}>
                                                Github <GithubOutlined />
                                            </a>
                                        )}
                                    </div>
                                    {proj.technologies && <div className={styles.itemSubheader}>Công nghệ: {proj.technologies}</div>}
                                    {proj.description && <div className={styles.itemDetail}>{proj.description}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "educations":
                return educations.length > 0 && educations[0]?.schoolName ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Học vấn</h3>
                        <div className={styles.sectionContent}>
                            {educations.map((edu: any, idx: number) => (
                                <div key={idx} className={styles.educationItem}>
                                    <div className={styles.itemHeader} style={{ flexDirection: "column" }}>
                                        <span style={{ fontSize: "11px" }}>{edu.schoolName}</span>
                                        <span style={{ fontWeight: "normal", fontSize: "10px", color: "#616161" }}>
                                            {edu.startDate ? dayjs(edu.startDate).format("MM/YYYY") : ""} - {edu.endDate ? dayjs(edu.endDate).format("MM/YYYY") : ""}
                                        </span>
                                    </div>
                                    <div className={styles.itemSubheader}>{edu.major}</div>
                                    {edu.gpa && <div className={styles.itemDetail}>GPA: {edu.gpa}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "technicalSkills":
                return technicalSkills.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Kỹ năng</h3>
                        <div className={styles.skillListWithLevel}>
                            {technicalSkills.map((sk: any, idx: number) => (
                                <div key={idx} className={styles.skillRow}>
                                    <span style={{ fontWeight: 600 }}>{sk.skillName}</span>
                                    <span className={styles.skillRowLevel}>{sk.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "softSkills":
                return softSkills.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Kỹ năng mềm</h3>
                        <div style={{ marginTop: 4 }}>
                            {softSkills.map((sk: any, idx: number) => (
                                <span key={idx} className={styles.skillTag}>{sk.skillName}</span>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "certifications":
                return certifications.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Chứng chỉ</h3>
                        <div className={styles.sectionContent}>
                            {certifications.map((cert: any, idx: number) => (
                                <div key={idx} style={{ marginBottom: 6 }}>
                                    <div style={{ fontWeight: 600 }}>{cert.name}</div>
                                    <div style={{ fontSize: "9.5px", color: "#616161" }}>
                                        {cert.organization} {cert.issueDate ? `(${dayjs(cert.issueDate).format("YYYY")})` : ""}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "languages":
                return languages.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Ngoại ngữ</h3>
                        <div className={styles.sectionContent}>
                            {languages.map((lang: any, idx: number) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                    <span style={{ fontWeight: 600 }}>{lang.language}</span>
                                    <span>{lang.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "activities":
                return activities.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Hoạt động</h3>
                        <div className={styles.sectionContent}>
                            {activities.map((act: any, idx: number) => (
                                <div key={idx} style={{ marginBottom: 6 }}>
                                    <div style={{ fontWeight: 600 }}>{act.activityName}</div>
                                    <div style={{ fontSize: "9.5px", color: "#616161" }}>{act.role}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            case "hobbies":
                return hobbies.length > 0 ? (
                    <div className={styles.sectionBlock} key={key}>
                        <h3 className={styles.sectionTitle}>Sở thích</h3>
                        <div style={{ marginTop: 4 }}>
                            {hobbies.map((h: any, idx: number) => (
                                <span key={idx} className={styles.skillTag}>{h.hobby}</span>
                            ))}
                        </div>
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    const layouts = cvData.sectionLayouts && cvData.sectionLayouts.length > 0 
        ? cvData.sectionLayouts 
        : defaultSections;

    const leftSections = layouts
        .filter((s: any) => s.columnPlacement === "left" && s.visible !== false)
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    const rightSections = layouts
        .filter((s: any) => s.columnPlacement === "right" && s.visible !== false)
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ padding: "20px 10px", display: "flex", flexDirection: "column", alignItems: "center", background: "#f5f5f5" }}>
            {/* Control Bar (hidden during printing) */}
            <div 
                className="no-print" 
                style={{ 
                    width: "100%", 
                    maxWidth: "794px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    marginBottom: "20px",
                    background: "#fff",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
            >
                <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
                <div style={{ fontSize: "16px", fontWeight: 600 }}>Bản xem CV: {cvData.title}</div>
                <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>In / Xuất PDF</Button>
            </div>

            {/* Styled styles injection to hide header/footer when printing */}
            <style>{`
                @media print {
                    .no-print, header, footer, .layout-app main, .layout-app header, .layout-app footer {
                        display: none !important;
                    }
                    body {
                        background: #fff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    div[style*="background: rgb(245, 245, 245)"] {
                        background: #fff !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            {/* A4 CV Page Paper */}
            <div style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
                <div className={`${styles.cvPaper} ${getThemeClass(cvData.theme)} ${getLayoutClass(cvData.layoutKey)}`}>
                    {/* CV Header Banner */}
                    <div className={styles.bannerHeader}>
                        <h1 className={styles.nameText}>{name}</h1>
                        <p className={styles.titleText}>{cvData.title || "CV Ứng Tuyển"}</p>
                    </div>

                    {/* Split Columns */}
                    <div className={styles.cvContentColumns}>
                        {/* Left Column - Main Details */}
                        <div className={styles.leftColumn}>
                            {leftSections.map((s: any) => renderSection(s.sectionKey))}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className={styles.rightColumn}>
                            {/* Avatar Circle */}
                            <div className={styles.avatarWrapper}>
                                <div className={styles.avatarCircle}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" />
                                    ) : (
                                        <span>{getInitials(name)}</span>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className={styles.sectionBlock}>
                                <h3 className={styles.sectionTitle}>Thông tin liên hệ</h3>
                                <div className={styles.contactList}>
                                    <div className={styles.contactItem}>
                                        <PhoneOutlined className={styles.icon} />
                                        <span>{phone}</span>
                                    </div>
                                    <div className={styles.contactItem}>
                                        <MailOutlined className={styles.icon} />
                                        <span>{email}</span>
                                    </div>
                                    {dob && (
                                        <div className={styles.contactItem}>
                                            <CalendarOutlined className={styles.icon} />
                                            <span>{dob}</span>
                                        </div>
                                    )}
                                    <div className={styles.contactItem}>
                                        <HomeOutlined className={styles.icon} />
                                        <span>{address}</span>
                                    </div>
                                    {github && (
                                        <div className={styles.contactItem}>
                                            <GithubOutlined className={styles.icon} />
                                            <span>{github}</span>
                                        </div>
                                    )}
                                    {linkedin && (
                                        <div className={styles.contactItem}>
                                            <LinkedinOutlined className={styles.icon} />
                                            <span>{linkedin}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {rightSections.map((s: any) => renderSection(s.sectionKey))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewCV;
