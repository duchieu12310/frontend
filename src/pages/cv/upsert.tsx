import { useState, useEffect } from "react";
import { Form, message, notification, Spin, Tabs, ConfigProvider, Button, Tooltip, Avatar, Row, Col, Table, Checkbox, Select, InputNumber, Modal, Input } from "antd";
import type { TabsProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LeftOutlined, SaveOutlined, PhoneOutlined, MailOutlined, HomeOutlined, GithubOutlined, LinkedinOutlined, CalendarOutlined, EyeOutlined, ThunderboltOutlined, RobotOutlined, AuditOutlined } from "@ant-design/icons";
import { FooterToolbar, ProForm, ProFormSelect, ProFormList, ProFormGroup, ProFormText } from "@ant-design/pro-components";
import viVN from "antd/lib/locale/vi_VN";
import dayjs from "dayjs";
import { callCreateFormatCV, callUpdateFormatCV, callFetchFormatCVById, callFetchCVTemplateById, callGptGenerateCV, callGptEvaluateCV } from "@/config/api";
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

// Simple inline parser for **bold** text
const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} style={{ color: '#000' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content) return null;
    
    // Preprocess: remove empty lines that are sandwiched between table lines
    const processedLines: string[] = [];
    const rawLines = content.split('\n');
    
    const isTableLineRaw = (idx: number) => {
        const trimmed = rawLines[idx]?.trim() || '';
        if (!trimmed.includes('|')) return false;
        if (trimmed.startsWith('|')) return true;
        // Check if neighbors contain '|'
        let hasNeighbor = false;
        for (let j = idx - 1; j >= 0; j--) {
            const t = rawLines[j].trim();
            if (t !== '') {
                hasNeighbor = t.includes('|');
                break;
            }
        }
        if (!hasNeighbor) {
            for (let j = idx + 1; j < rawLines.length; j++) {
                const t = rawLines[j].trim();
                if (t !== '') {
                    hasNeighbor = t.includes('|');
                    break;
                }
            }
        }
        return hasNeighbor;
    };

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();
        if (trimmed === '') {
            let prevTable = false;
            for (let j = i - 1; j >= 0; j--) {
                const prevTrimmed = rawLines[j].trim();
                if (prevTrimmed !== '') {
                    prevTable = isTableLineRaw(j);
                    break;
                }
            }
            let nextTable = false;
            for (let j = i + 1; j < rawLines.length; j++) {
                const nextTrimmed = rawLines[j].trim();
                if (nextTrimmed !== '') {
                    nextTable = isTableLineRaw(j);
                    break;
                }
            }
            if (prevTable && nextTable) {
                continue; // Skip sandwiched empty line
            }
        }
        processedLines.push(line);
    }

    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    
    const flushTable = (key: any) => {
        if (tableRows.length === 0) return null;
        
        const hasSeparator = tableRows[1] && tableRows[1].every(cell => cell.trim().startsWith('-') || cell.trim() === '');
        const headerRow = tableRows[0];
        const bodyRows = hasSeparator ? tableRows.slice(2) : tableRows.slice(1);
        
        const renderedTable = (
            <div key={key} style={{ overflowX: 'auto', margin: '16px 0', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                            {headerRow.map((cell, cIdx) => (
                                <th key={cIdx} style={{ padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'left', fontWeight: 600 }}>
                                    {parseInlineMarkdown(cell.trim())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} style={{ padding: '10px 12px', border: '1px solid #f0f0f0' }}>
                                        {parseInlineMarkdown(cell.trim())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        
        tableRows = [];
        inTable = false;
        return renderedTable;
    };

    const isTableLineProcessed = (idx: number) => {
        const trimmed = processedLines[idx]?.trim() || '';
        if (!trimmed.includes('|')) return false;
        if (trimmed.startsWith('|')) return true;
        const prev = processedLines[idx - 1]?.trim() || '';
        const next = processedLines[idx + 1]?.trim() || '';
        return prev.includes('|') || next.includes('|');
    };

    for (let i = 0; i < processedLines.length; i++) {
        const line = processedLines[i];
        const trimmed = line.trim();
        
        if (isTableLineProcessed(i)) {
            inTable = true;
            let cells = trimmed.split('|');
            if (cells.length > 0 && cells[0] === '') cells.shift();
            if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
            tableRows.push(cells);
        } else {
            if (inTable) {
                const tbl = flushTable(`table-${i}`);
                if (tbl) elements.push(tbl);
            }
            
            if (trimmed.startsWith('###')) {
                elements.push(<h4 key={i} style={{ marginTop: '20px', marginBottom: '8px', color: '#1f1f1f', fontWeight: 650, fontSize: '15px' }}>{trimmed.replace(/^###\s*/, '')}</h4>);
            } else if (trimmed.startsWith('##')) {
                elements.push(<h3 key={i} style={{ marginTop: '24px', marginBottom: '12px', color: '#111', fontWeight: 700, borderBottom: '1px solid #e8e8e8', paddingBottom: '4px', fontSize: '17px' }}>{trimmed.replace(/^##\s*/, '')}</h3>);
            } else if (trimmed.startsWith('#')) {
                elements.push(<h2 key={i} style={{ marginTop: '28px', marginBottom: '16px', color: '#111', fontWeight: 800, fontSize: '20px' }}>{trimmed.replace(/^#\s*/, '')}</h2>);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const text = trimmed.replace(/^[-*]\s*/, '');
                elements.push(
                    <div key={i} style={{ paddingLeft: '12px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ marginRight: '8px', color: '#fa541c', fontWeight: 'bold' }}>•</span>
                        <span>{parseInlineMarkdown(text)}</span>
                    </div>
                );
            } else if (/^\d+\.\s+/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.)\s+(.*)/);
                if (match) {
                    elements.push(
                        <div key={i} style={{ paddingLeft: '12px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ marginRight: '8px', color: '#fa541c', fontWeight: 'bold' }}>{match[1]}</span>
                            <span>{parseInlineMarkdown(match[2])}</span>
                        </div>
                    );
                }
            } else if (!trimmed) {
                elements.push(<div key={i} style={{ height: '8px' }} />);
            } else {
                elements.push(<p key={i} style={{ marginBottom: '10px' }}>{parseInlineMarkdown(trimmed)}</p>);
            }
        }
    }
    
    if (inTable) {
        const tbl = flushTable(`table-eof`);
        if (tbl) elements.push(tbl);
    }
    
    return <div style={{ lineHeight: '1.7', fontSize: '14.5px', color: '#434343' }}>{elements}</div>;
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

    // Modals state for AI
    const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
    const [writeInputText, setWriteInputText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Load saved evaluation from localStorage
    useEffect(() => {
        const key = id ? `cv_evaluation_${id}` : `cv_evaluation_new`;
        const saved = localStorage.getItem(key);
        if (saved) {
            setEvaluationResult(saved);
        } else {
            setEvaluationResult("");
        }
    }, [id]);

    const handleGenerateCV = async () => {
        if (!writeInputText.trim()) {
            message.warning("Vui lòng nhập thông tin thô của bạn!");
            return;
        }
        setIsGenerating(true);
        try {
            const res = await callGptGenerateCV(writeInputText);
            if (res && res.data) {
                const data = res.data;
                const parseDate = (dStr?: string) => {
                    if (!dStr) return undefined;
                    const d = dayjs(dStr);
                    return d.isValid() ? d : undefined;
                };

                const mappedData = {
                    title: data.title || form.getFieldValue("title") || "CV của tôi",
                    theme: data.theme || form.getFieldValue("theme") || "brown",
                    layoutKey: data.layoutKey || form.getFieldValue("layoutKey") || "two-column-right",
                    sectionLayouts: form.getFieldValue("sectionLayouts") || defaultSections,
                    cvTemplate: form.getFieldValue("cvTemplate"),
                    personalInformations: data.personalInformations?.map((p: any) => ({
                        ...p,
                        dateOfBirth: parseDate(p.dateOfBirth)
                    })) || [{}],
                    careerObjectives: data.careerObjectives || [],
                    educations: data.educations?.map((e: any) => ({
                        ...e,
                        startDate: parseDate(e.startDate),
                        endDate: parseDate(e.endDate)
                    })) || [],
                    workExperiences: data.workExperiences?.map((w: any) => ({
                        ...w,
                        startDate: parseDate(w.startDate),
                        endDate: parseDate(w.endDate)
                    })) || [],
                    technicalSkills: data.technicalSkills || [],
                    softSkills: data.softSkills || [],
                    projects: data.projects || [],
                    certifications: data.certifications?.map((c: any) => ({
                        ...c,
                        issueDate: parseDate(c.issueDate)
                    })) || [],
                    activities: data.activities || [],
                    languages: data.languages || [],
                    hobbies: data.hobbies || []
                };

                form.setFieldsValue(mappedData);
                message.success("AI đã điền thông tin CV thành công!");
                setIsWriteModalOpen(false);
                setWriteInputText("");
            } else {
                notification.error({
                    message: "Lỗi sinh CV",
                    description: "AI phản hồi không đúng cấu trúc"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi AI",
                description: error?.response?.data?.message || error.message || "Không thể sinh CV bằng AI"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEvaluateCV = async () => {
        const currentValues = form.getFieldsValue();
        const submitData = {
            ...currentValues,
            personalInformations: currentValues.personalInformations?.map((p: any) => ({
                ...p,
                dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth).format("YYYY-MM-DD") : null
            })),
            educations: currentValues.educations?.map((e: any) => ({
                ...e,
                startDate: e.startDate ? dayjs(e.startDate).format("YYYY-MM-DD") : null,
                endDate: e.endDate ? dayjs(e.endDate).format("YYYY-MM-DD") : null
            })),
            workExperiences: currentValues.workExperiences?.map((w: any) => ({
                ...w,
                startDate: w.startDate ? dayjs(w.startDate).format("YYYY-MM-DD") : null,
                endDate: w.endDate ? dayjs(w.endDate).format("YYYY-MM-DD") : null
            })),
            certifications: currentValues.certifications?.map((c: any) => ({
                ...c,
                issueDate: c.issueDate ? dayjs(c.issueDate).format("YYYY-MM-DD") : null
            })),
        };

        setIsEvaluating(true);
        setEvaluationResult("");
        setIsEvaluateModalOpen(true);

        try {
            const res = await callGptEvaluateCV(submitData);
            if (res && res.evaluation) {
                const evalText = res.evaluation;
                setEvaluationResult(evalText);
                const key = id ? `cv_evaluation_${id}` : `cv_evaluation_new`;
                localStorage.setItem(key, evalText);
            } else {
                setEvaluationResult("⚠️ Không nhận được kết quả đánh giá từ AI.");
            }
        } catch (error: any) {
            setEvaluationResult("❌ Có lỗi xảy ra trong quá trình AI phân tích CV của bạn.");
            notification.error({
                message: "Lỗi đánh giá CV",
                description: error?.response?.data?.message || error.message || "Không thể kết nối máy chủ AI"
            });
        } finally {
            setIsEvaluating(false);
        }
    };

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
                    const tempEval = localStorage.getItem("cv_evaluation_new");
                    if (tempEval && res.data.id) {
                        localStorage.setItem(`cv_evaluation_${res.data.id}`, tempEval);
                    }
                    localStorage.removeItem("cv_evaluation_new");
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
            <div className={styles.editorHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div className={styles.backLink} onClick={() => navigate("/cv")}>
                        <LeftOutlined /> Quay lại danh sách CV
                    </div>
                    <h3>{id ? "Chỉnh sửa CV cá nhân" : "Viết CV mới từ mẫu"}</h3>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Button
                        type="default"
                        icon={<ThunderboltOutlined style={{ color: "#389e0d" }} />}
                        onClick={() => setIsWriteModalOpen(true)}
                        style={{
                            borderColor: "#389e0d",
                            color: "#389e0d",
                            fontWeight: 500,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            boxShadow: "0 2px 4px rgba(56, 158, 13, 0.1)"
                        }}
                    >
                        AI Viết Nhanh
                    </Button>
                    <Button
                        type="default"
                        icon={<RobotOutlined style={{ color: "#fa541c" }} />}
                        onClick={handleEvaluateCV}
                        style={{
                            borderColor: "#fa541c",
                            color: "#fa541c",
                            fontWeight: 500,
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            boxShadow: "0 2px 4px rgba(250, 84, 28, 0.1)"
                        }}
                    >
                        AI Đánh Giá CV
                    </Button>
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
                        <div className={styles.rightPane} style={{ overflowY: "auto", paddingRight: "4px" }}>
                            <div className={styles.previewTitle}>
                                <EyeOutlined /> Bản xem trước Live Preview (Khổ A4)
                            </div>
                            <div className={styles.scrollContainer} style={{ flexGrow: 0, height: "550px", marginBottom: "12px" }}>
                                <LivePreviewCV form={form} />
                            </div>

                            {/* Persistent AI Evaluation Section */}
                            {evaluationResult && (
                                <div style={{ 
                                    background: "#fff", 
                                    border: "1px solid #fa541c", 
                                    borderRadius: "8px", 
                                    padding: "16px",
                                    boxShadow: "0 4px 12px rgba(250, 84, 28, 0.08)",
                                    marginBottom: "16px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px", marginBottom: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "14px", fontWeight: 600, color: "#fa541c" }}>
                                            <RobotOutlined />
                                            <span>Báo cáo đánh giá AI hiện tại</span>
                                        </div>
                                        <Button 
                                            type="link" 
                                            danger 
                                            size="small" 
                                            onClick={() => {
                                                const key = id ? `cv_evaluation_${id}` : `cv_evaluation_new`;
                                                localStorage.removeItem(key);
                                                setEvaluationResult("");
                                            }}
                                            style={{ padding: 0, height: "auto" }}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                    <div style={{ fontSize: "13px" }}>
                                        <MarkdownRenderer content={evaluationResult} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ProForm>

                {/* AI Modals */}
                <Modal
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "16px", color: "#389e0d" }}>
                            <ThunderboltOutlined />
                            <span>AI Hỗ Trợ Tạo CV Nhanh</span>
                        </div>
                    }
                    open={isWriteModalOpen}
                    onOk={handleGenerateCV}
                    onCancel={() => {
                        if (!isGenerating) {
                            setIsWriteModalOpen(false);
                            setWriteInputText("");
                        }
                    }}
                    confirmLoading={isGenerating}
                    okText="Sinh CV & Tự Điền"
                    cancelText="Hủy bỏ"
                    okButtonProps={{
                        style: { backgroundColor: "#389e0d", borderColor: "#389e0d" }
                    }}
                    width={650}
                >
                    <div style={{ margin: "16px 0" }}>
                        <p style={{ color: "#595959", fontSize: "13px", marginBottom: "12px" }}>
                            Nhập các thông tin cá nhân, học vấn, kinh nghiệm làm việc và kỹ năng của bạn dưới dạng ngôn ngữ tự nhiên. AI sẽ tự động phân tích và điền vào các ô trong form biên tập CV.
                        </p>
                        <Input.TextArea
                            rows={8}
                            value={writeInputText}
                            onChange={(e) => setWriteInputText(e.target.value)}
                            placeholder="Ví dụ: tôi tên là Trần Văn Nam, sinh ngày 20/05/2001. Địa chỉ ở Cầu Giấy, Hà Nội. Số điện thoại: 0912345678, email namtv@gmail.com. Tôi đã học Đại học Công nghệ UET chuyên ngành Kỹ thuật phần mềm từ 2019 đến 2023, GPA 3.4. Có kinh nghiệm 1 năm làm Backend NodeJS Developer tại công ty ABC từ 06/2023 đến nay. Kỹ năng gồm: Javascript, Node.js, Express, MongoDB, Git. Có chứng chỉ IELTS 6.5 cấp năm 2023."
                            disabled={isGenerating}
                            style={{ borderRadius: "6px", fontSize: "13.5px" }}
                        />
                        <div style={{ marginTop: "10px", color: "#faad14", fontSize: "12px" }}>
                            ⚠️ Lưu ý: Khi áp dụng, thông tin hiện tại trên form sẽ được thay thế bằng dữ liệu mới do AI sinh ra.
                        </div>
                    </div>
                </Modal>

                <Modal
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "16px", color: "#fa541c" }}>
                            <AuditOutlined />
                            <span>AI Đánh Giá & Chấm Điểm CV</span>
                        </div>
                    }
                    open={isEvaluateModalOpen}
                    onCancel={() => {
                        if (!isEvaluating) {
                            setIsEvaluateModalOpen(false);
                        }
                    }}
                    footer={[
                        <Button key="close" type="primary" onClick={() => setIsEvaluateModalOpen(false)} style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}>
                            Đóng báo cáo
                        </Button>
                    ]}
                    width={800}
                >
                    <div style={{ margin: "20px 0", maxHeight: "60vh", overflowY: "auto", paddingRight: "8px" }}>
                        {isEvaluating ? (
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "250px", gap: 16 }}>
                                <Spin size="large" />
                                <div style={{ color: "#595959", textAlign: "center" }}>
                                    <p style={{ fontWeight: 500, color: "#fa541c", margin: 0 }}>AI đang tiến hành phân tích CV...</p>
                                    <p style={{ fontSize: "12.5px", color: "#8c8c8c", marginTop: "4px" }}>
                                        Đang đối chiếu thông tin kỹ năng của bạn với các tin tuyển dụng thực tế trong hệ thống (Qdrant Vector DB)...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: "#fafafa", padding: "20px", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
                                <MarkdownRenderer content={evaluationResult} />
                            </div>
                        )}
                    </div>
                </Modal>
            </ConfigProvider>
        </div>
    );
};

export default ViewUpsertCV;
