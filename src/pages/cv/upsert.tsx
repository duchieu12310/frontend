import { useState, useEffect } from "react";
import { Form, message, notification, Spin, Tabs, ConfigProvider, Button, Tooltip, Avatar, Row, Col, Table, Checkbox, Select, InputNumber } from "antd";
import type { TabsProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LeftOutlined, SaveOutlined, PhoneOutlined, MailOutlined, HomeOutlined, GithubOutlined, LinkedinOutlined, CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import { FooterToolbar, ProForm, ProFormSelect, ProFormList, ProFormGroup, ProFormText } from "@ant-design/pro-components";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import { callCreateFormatCV, callUpdateFormatCV, callFetchFormatCVById, callFetchCVTemplateById } from "@/config/api";
import { IFormatCV, IPersonalInformation } from "@/types/backend";
import styles from "@/styles/cv.module.scss";

// Reuse the existing section components from CVTemplate admin builder
import GeneralInfoSection from "@/components/admin/cv-template/sections/general-info";
import EducationExperienceSection from "@/components/admin/cv-template/sections/education-experience";
import SkillsLanguagesSection from "@/components/admin/cv-template/sections/skills-languages";
import OtherInfoSection from "@/components/admin/cv-template/sections/other-info";

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

// A live preview component that reactive watches the form fields
const LivePreviewCV = ({ form }: { form: any }) => {
    const values = (Form.useWatch([], form) || {}) as IFormatCV;

    const personal = (values.personalInformations?.[0] || {}) as IPersonalInformation;
    const name = personal.fullName || "Họ và Tên";
    const phone = personal.phone || "Số điện thoại";
    const email = personal.email || "Email liên hệ";
    const address = personal.address || "Địa chỉ";
    const github = personal.github || "";
    const linkedin = personal.linkedin || "";
    const avatarUrl = personal.image || "";
    const dob = personal.dateOfBirth ? dayjs(personal.dateOfBirth).format("DD/MM/YYYY") : "";

    const educations = values.educations || [];
    const careerObjectives = values.careerObjectives || [];
    const workExperiences = values.workExperiences || [];
    const projects = values.projects || [];
    const technicalSkills = values.technicalSkills || [];
    const softSkills = values.softSkills || [];
    const certifications = values.certifications || [];
    const activities = values.activities || [];
    const languages = values.languages || [];
    const hobbies = values.hobbies || [];

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

    const layouts = values.sectionLayouts && values.sectionLayouts.length > 0 
        ? values.sectionLayouts 
        : defaultSections;

    const leftSections = layouts
        .filter((s: any) => s.columnPlacement === "left" && s.visible !== false)
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    const rightSections = layouts
        .filter((s: any) => s.columnPlacement === "right" && s.visible !== false)
        .sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    return (
        <div className={`${styles.cvPaper} ${getThemeClass(values.theme)} ${getLayoutClass(values.layoutKey)}`}>
            {/* CV Header Banner */}
            <div className={styles.bannerHeader}>
                <h1 className={styles.nameText}>{name}</h1>
                <p className={styles.titleText}>{values.title || "CV Ứng Tuyển"}</p>
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
    );
};

const ViewUpsertCV = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params.get("id"); // format cv id (to edit)
    const templateId = params.get("templateId"); // template id (to create from)

    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(true);
    const [cvData, setCvData] = useState<IFormatCV | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                if (id) {
                    // Chế độ chỉnh sửa CV hiện có
                    const res = await callFetchFormatCVById(Number(id));
                    if (res?.data) {
                        setCvData(res.data);
                        const data = res.data;
                        form.setFieldsValue({
                            ...data,
                            selectedTemplateIds: data.selectedTemplateIds,
                            theme: data.theme || "brown",
                            layoutKey: data.layoutKey || "two-column-right",
                            sectionLayouts: data.sectionLayouts && data.sectionLayouts.length > 0 ? data.sectionLayouts : defaultSections,
                            personalInformations: data.personalInformations?.map(p => ({
                                ...p,
                                dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth) : undefined
                            })),
                            educations: data.educations?.map(e => ({
                                ...e,
                                startDate: e.startDate ? dayjs(e.startDate) : undefined,
                                endDate: e.endDate ? dayjs(e.endDate) : undefined
                            })),
                            workExperiences: data.workExperiences?.map(w => ({
                                ...w,
                                startDate: w.startDate ? dayjs(w.startDate) : undefined,
                                endDate: w.endDate ? dayjs(w.endDate) : undefined
                            })),
                            certifications: data.certifications?.map(c => ({
                                ...c,
                                issueDate: c.issueDate ? dayjs(c.issueDate) : undefined
                            })),
                        });
                    }
                } else if (templateId) {
                    // Chế độ tạo mới từ mẫu CVTemplate - form rỗng để user tự nhập
                    const res = await callFetchCVTemplateById(Number(templateId));
                    if (res?.data) {
                        const data = res.data;
                        form.setFieldsValue({
                            title: `CV của tôi`,
                            theme: data.theme || "brown",
                            layoutKey: data.layout || "two-column-right",
                            sectionLayouts: data.sectionLayouts && data.sectionLayouts.length > 0 ? data.sectionLayouts : defaultSections,
                            cvTemplate: { id: data.id, title: data.title },
                            personalInformations: [{}],
                            careerObjectives: [],
                            workExperiences: [],
                            educations: [],
                            technicalSkills: [],
                            softSkills: [],
                            projects: [],
                            achievements: [],
                            activities: [],
                            languages: [],
                            certifications: [],
                            hobbies: [],
                        });
                    }
                }
            } catch (error) {
                notification.error({
                    message: "Lỗi tải dữ liệu",
                    description: "Không thể lấy thông tin biểu mẫu"
                });
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
        return () => form.resetFields();
    }, [id, templateId]);

    const onFinish = async (valuesForm: any) => {
        // Cấu trúc lại các trường ngày tháng sang định dạng chuỗi trước khi lưu DB
        const submitData: IFormatCV = {
            ...valuesForm,
            personalInformations: valuesForm.personalInformations?.map((p: any) => ({
                ...p,
                dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth).format("YYYY-MM-DD") : null
            })),
            educations: valuesForm.educations?.map((e: any) => ({
                ...e,
                startDate: e.startDate ? dayjs(e.startDate).format("YYYY-MM-DD") : null,
                endDate: e.endDate ? dayjs(e.endDate).format("YYYY-MM-DD") : null
            })),
            workExperiences: valuesForm.workExperiences?.map((w: any) => ({
                ...w,
                startDate: w.startDate ? dayjs(w.startDate).format("YYYY-MM-DD") : null,
                endDate: w.endDate ? dayjs(w.endDate).format("YYYY-MM-DD") : null
            })),
            certifications: valuesForm.certifications?.map((c: any) => ({
                ...c,
                issueDate: c.issueDate ? dayjs(c.issueDate).format("YYYY-MM-DD") : null
            })),
        };

        try {
            if (id && cvData?.id) {
                // Cập nhật CV hiện có
                const res = await callUpdateFormatCV({ ...submitData, id: cvData.id });
                if (res.data) {
                    message.success("Cập nhật bản CV thành công");
                    navigate("/cv");
                } else {
                    notification.error({
                        message: "Lỗi lưu CV",
                        description: res.message
                    });
                }
            } else {
                // Tạo mới CV định dạng
                const res = await callCreateFormatCV(submitData);
                if (res.data) {
                    message.success("Tạo mới và lưu CV thành công");
                    navigate("/cv");
                } else {
                    notification.error({
                        message: "Lỗi tạo CV",
                        description: res.message
                    });
                }
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi kết nối máy chủ",
                description: error.message
            });
        }
    };

    const tabItems: TabsProps["items"] = [
        {
            key: "general",
            label: "Thông tin chung",
            children: (
                <>
                    <Row gutter={[20, 20]} style={{ marginBottom: "15px", borderBottom: "1px solid #f0f0f0", paddingBottom: "15px" }}>
                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="theme"
                                label="Chọn mẫu giao diện (Tông màu chủ đạo)"
                                placeholder="Chọn giao diện"
                                initialValue="brown"
                                options={[
                                    { label: "🟫 Mẫu Nâu Ấm Áp (Mặc định)", value: "brown" },
                                    { label: "🟩 Mẫu Xanh Lục Bảo", value: "emerald" },
                                    { label: "🟦 Mẫu Xanh Đại Dương", value: "blue" },
                                    { label: "⬛ Mẫu Charcoal / Xám Ghi", value: "slate" },
                                ]}
                            />
                        </Col>
                        <Col span={24} md={12}>
                            <ProFormSelect
                                name="layoutKey"
                                label="Chọn mẫu bố cục (Layout)"
                                placeholder="Chọn bố cục"
                                initialValue="two-column-right"
                                options={[
                                    { label: "📂 Mẫu 1: Hai cột - Sidebar phải", value: "two-column-right" },
                                    { label: "📂 Mẫu 2: Hai cột - Sidebar trái", value: "two-column-left" },
                                    { label: "📂 Mẫu 3: Một cột dọc - Từ trên xuống", value: "single-column" },
                                ]}
                            />
                        </Col>
                    </Row>


                    <GeneralInfoSection />
                </>
            ),
        },
        {
            key: "edu-exp",
            label: "Học vấn & Kinh nghiệm",
            children: <EducationExperienceSection />,
        },
        {
            key: "skills",
            label: "Kỹ năng & Ngoại ngữ",
            children: <SkillsLanguagesSection />,
        },
        {
            key: "other",
            label: "Thông tin khác",
            children: <OtherInfoSection />,
        },
        {
            key: "structure",
            label: "Cấu trúc hiển thị",
            children: (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '15px', fontWeight: 655, color: 'rgba(0, 0, 0, 0.85)', marginBottom: '4px' }}>Cấu hình phần hiển thị</div>
                        <p style={{ color: "#8c8c8c", fontSize: "12.5px" }}>Bật/tắt hiển thị, di chuyển vị trí cột (Trái/Phải), hoặc đổi thứ tự sắp xếp (số càng nhỏ hiển thị càng trước).</p>
                    </div>
                    <Form.List name="sectionLayouts">
                        {(fields) => {
                            const dataSource = fields.map((field) => {
                                const index = field.name;
                                const item = form.getFieldValue(["sectionLayouts", index]) || {};
                                return {
                                    key: field.key,
                                    fieldIndex: index,
                                    ...item,
                                };
                            });

                            const columns = [
                                {
                                    title: "Phần nội dung",
                                    dataIndex: "sectionName",
                                    key: "sectionName",
                                    width: "35%",
                                    render: (text: string) => <strong style={{ color: "#262626" }}>{text}</strong>
                                },
                                {
                                    title: "Hiển thị",
                                    dataIndex: "visible",
                                    key: "visible",
                                    width: "15%",
                                    align: "center" as const,
                                    render: (_: any, record: any) => (
                                        <Form.Item name={[record.fieldIndex, "visible"]} valuePropName="checked" noStyle>
                                            <Checkbox />
                                        </Form.Item>
                                    ),
                                },
                                {
                                    title: "Vị trí cột",
                                    dataIndex: "columnPlacement",
                                    key: "columnPlacement",
                                    width: "30%",
                                    render: (_: any, record: any) => (
                                        <Form.Item name={[record.fieldIndex, "columnPlacement"]} noStyle>
                                            <Select style={{ width: "100%" }}>
                                                <Select.Option value="left">Cột chính (Trái)</Select.Option>
                                                <Select.Option value="right">Cột phụ (Phải)</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    ),
                                },
                                {
                                    title: "Thứ tự",
                                    dataIndex: "orderIndex",
                                    key: "orderIndex",
                                    width: "20%",
                                    align: "center" as const,
                                    render: (_: any, record: any) => (
                                        <Form.Item name={[record.fieldIndex, "orderIndex"]} noStyle>
                                            <InputNumber min={1} max={100} style={{ width: "80%" }} />
                                        </Form.Item>
                                    ),
                                },
                            ];

                            return (
                                <Table
                                    dataSource={dataSource}
                                    columns={columns}
                                    pagination={false}
                                    size="small"
                                    bordered
                                    rowKey="key"
                                    style={{ marginTop: 8 }}
                                />
                            );
                        }}
                    </Form.List>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Spin size="large" tip="Đang tải mẫu biên tập..." />
            </div>
        );
    }

    return (
        <div className={styles.upsertContainer}>
            <div className={styles.editorHeader}>
                <div>
                    <div className={styles.backLink} onClick={() => navigate("/cv")}>
                        <LeftOutlined /> Quay lại danh sách CV
                    </div>
                    <h3>{id ? "Chỉnh sửa CV cá nhân" : "Viết CV mới từ mẫu"}</h3>
                </div>
            </div>

            <ConfigProvider locale={viVN}>
                <ProForm
                    form={form}
                    onFinish={onFinish}
                    submitter={{
                        searchConfig: {
                            resetText: "Hủy bỏ",
                            submitText: (
                                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <SaveOutlined /> {id ? "Cập nhật CV" : "Lưu CV vào Database"}
                                </span>
                            )
                        },
                        onReset: () => navigate("/cv"),
                        render: (_, dom) => <FooterToolbar>{dom}</FooterToolbar>,
                    }}
                >
                    <div className={styles.mainLayout}>
                        {/* Editor Form Columns */}
                        <div className={styles.leftPane}>
                            <Tabs defaultActiveKey="general" items={tabItems} />
                        </div>

                        {/* Live Preview Column */}
                        <div className={styles.rightPane}>
                            <div className={styles.previewTitle}>
                                <EyeOutlined /> Bản xem trước Live Preview (Khổ A4)
                            </div>
                            <div className={styles.scrollContainer}>
                                <LivePreviewCV form={form} />
                            </div>
                        </div>
                    </div>
                </ProForm>
            </ConfigProvider>
        </div>
    );
};

export default ViewUpsertCV;
