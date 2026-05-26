import { useState, useEffect } from "react";
import { Button, Card, Popconfirm, message, Spin, Empty, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { callFetchFormatCVs, callDeleteFormatCV, callFetchCVTemplates } from "@/config/api";
import { IFormatCV, ICVTemplate } from "@/types/backend";
import dayjs from "dayjs";
import styles from "@/styles/cv.module.scss";

const { Title, Text } = Typography;

// Thumbnail preview component – renders a scaled-down A4 CV to visualise the template
const MiniCVPreview = ({ tpl }: { tpl: ICVTemplate }) => {
    const getThemeColors = (theme?: string) => {
        switch (theme) {
            case "emerald": return { banner: "#004d40", sidebar: "#e0f2f1", accent: "#80cbc4", text: "#004d40" };
            case "blue":    return { banner: "#0d47a1", sidebar: "#e3f2fd", accent: "#90caf9", text: "#1565c0" };
            case "slate":   return { banner: "#263238", sidebar: "#eceff1", accent: "#b0bec5", text: "#37474f" };
            case "red":     return { banner: "#b71c1c", sidebar: "#fce4e4", accent: "#ef9a9a", text: "#b71c1c" };
            case "purple":  return { banner: "#4a148c", sidebar: "#f3e5f5", accent: "#ce93d8", text: "#4a148c" };
            case "teal":    return { banner: "#00695c", sidebar: "#e0f2f1", accent: "#80cbc4", text: "#00695c" };
            case "indigo":  return { banner: "#1a237e", sidebar: "#e8eaf6", accent: "#9fa8da", text: "#1a237e" };
            case "pink":    return { banner: "#880e4f", sidebar: "#fce4ec", accent: "#f48fb1", text: "#880e4f" };
            case "amber":   return { banner: "#e65100", sidebar: "#fff3e0", accent: "#ffcc80", text: "#e65100" };
            case "orange":  return { banner: "#bf360c", sidebar: "#fbe9e7", accent: "#ffab91", text: "#bf360c" };
            case "jade":    return { banner: "#1b5e20", sidebar: "#e8f5e9", accent: "#a5d6a7", text: "#1b5e20" };
            case "sky":     return { banner: "#01579b", sidebar: "#e1f5fe", accent: "#81d4fa", text: "#01579b" };
            case "white":   return { banner: "#424242", sidebar: "#f5f5f5", accent: "#bdbdbd", text: "#424242" };
            case "black":   return { banner: "#212121", sidebar: "#eeeeee", accent: "#9e9e9e", text: "#212121" };
            case "gray":    return { banner: "#37474f", sidebar: "#eceff1", accent: "#b0bec5", text: "#37474f" };
            case "brown":
            default:        return { banner: "#5d4037", sidebar: "#e0dcd5", accent: "#a1887f", text: "#4e342e" };
        }
    };

    const c = getThemeColors(tpl.theme);
    const isLeft    = tpl.layout === "two-column-left";
    const isSingle  = tpl.layout === "single-column";

    // Scale factor: the inner div is 794px wide (A4 @96dpi) → shrink to ~220px
    const SCALE = 220 / 794;
    const innerH = 380; // visible height of fake A4

    return (
        <div style={{
            width: 220,
            height: Math.round(innerH * SCALE),
            overflow: "hidden",
            borderRadius: 6,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
            position: "relative",
            flexShrink: 0,
        }}>
            <div style={{
                width: 794,
                height: innerH,
                transformOrigin: "top left",
                transform: `scale(${SCALE})`,
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#333",
                display: "flex",
                flexDirection: "column",
            }}>
                {/* Banner */}
                <div style={{ background: c.banner, color: "#fff", padding: "18px 22px" }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>Nguyễn Văn A</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3, letterSpacing: 1.2, textTransform: "uppercase" }}>Lập trình viên Frontend</div>
                </div>

                {/* Columns */}
                <div style={{ display: "flex", flexDirection: isSingle ? "column" : isLeft ? "row-reverse" : "row", flexGrow: 1 }}>
                    {/* Main column */}
                    <div style={{ flex: 3, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {["Mục tiêu nghề nghiệp", "Kinh nghiệm làm việc", "Dự án cá nhân"].map(sec => (
                            <div key={sec}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: c.text, textTransform: "uppercase", borderBottom: `1.5px solid ${c.accent}`, paddingBottom: 3, marginBottom: 6 }}>{sec}</div>
                                <div style={{ background: "#f5f5f5", borderRadius: 3, height: 8, marginBottom: 4 }} />
                                <div style={{ background: "#f5f5f5", borderRadius: 3, height: 8, width: "80%" }} />
                            </div>
                        ))}
                    </div>

                    {/* Sidebar */}
                    <div style={{ flex: 2, background: isSingle ? "transparent" : c.sidebar, padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {/* Avatar placeholder */}
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: c.banner, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20 }}>A</div>
                        </div>
                        {["Thông tin liên hệ", "Học vấn", "Kỹ năng"].map(sec => (
                            <div key={sec}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: c.text, textTransform: "uppercase", borderBottom: `1px solid ${c.accent}`, paddingBottom: 2, marginBottom: 5 }}>{sec}</div>
                                <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 3, height: 7, marginBottom: 3 }} />
                                <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: 3, height: 7, width: "70%" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ClientCVPage = () => {
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const isLoadingUser = useAppSelector(state => state.account.isLoading);

    const [listCV, setListCV] = useState<IFormatCV[]>([]);
    const [templates, setTemplates] = useState<ICVTemplate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchCVData = async () => {
        setLoading(true);
        try {
            const cvRes = await callFetchFormatCVs("page=1&size=50&sort=updatedAt,desc");
            const tplRes = await callFetchCVTemplates("page=1&size=50");

            if (cvRes?.data) {
                setListCV(cvRes.data.result || []);
            }
            if (tplRes?.data) {
                setTemplates(tplRes.data.result || []);
            }
        } catch (error) {
            message.error("Lỗi khi tải thông tin dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCVData();
        }
    }, [isAuthenticated]);

    if (isLoadingUser) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
                <Spin size="large" tip="Đang tải thông tin..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <Empty
                    description="Vui lòng đăng nhập để quản lý và tạo CV cá nhân của bạn"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Button type="primary" size="large" onClick={() => navigate("/login")} style={{ marginTop: 16 }}>
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            const res = await callDeleteFormatCV(id);
            if (res) {
                message.success("Xóa CV thành công");
                fetchCVData();
            }
        } catch (error) {
            message.error("Xóa CV thất bại");
        }
    };

    return (
        <div className={styles.cvContainer}>
            <div className={styles.headerSection}>
                <div>
                    <h2>CV Của Tôi</h2>
                    <Text type="secondary">Tạo, chỉnh sửa và quản lý các bản CV chuyên nghiệp của bạn</Text>
                </div>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
                    <Spin size="large" tip="Đang tải danh sách CV..." />
                </div>
            ) : (
                <>
                    {/* Danh sách CV đã tạo */}
                    <div style={{ marginBottom: "40px" }}>
                        <Title level={4} style={{ marginBottom: "16px", fontWeight: 650 }}>Bản CV đã lưu</Title>
                        {listCV.length === 0 ? (
                            <Card style={{ textAlign: "center", padding: "30px", border: "1px dashed #d9d9d9", borderRadius: "12px" }}>
                                <Empty
                                    description="Bạn chưa lưu bản CV nào. Chọn một mẫu bên dưới để bắt đầu viết CV chuyên nghiệp!"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            </Card>
                        ) : (
                            <div className={styles.cardGrid}>
                                {listCV.map((cv) => (
                                    <div key={cv.id} className={styles.cvCard}>
                                        <div className={styles.cardHeader}>
                                            <FileTextOutlined className={styles.cvIcon} />
                                            <div style={{ overflow: "hidden", flexGrow: 1 }}>
                                                <h4 className={styles.cvTitle} title={cv.title}>{cv.title}</h4>
                                            </div>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <div className={styles.metaText}>
                                                <span>Mẫu gốc:</span>
                                                <Text strong>{cv.cvTemplate?.title || "Mẫu tùy chỉnh"}</Text>
                                            </div>
                                            <div className={styles.metaText}>
                                                <span>Cập nhật:</span>
                                                <span>{cv.updatedAt ? dayjs(cv.updatedAt).format("DD-MM-YYYY HH:mm") : dayjs(cv.createdAt).format("DD-MM-YYYY HH:mm")}</span>
                                            </div>
                                        </div>
                                        <div className={styles.cardActions}>
                                            <Popconfirm
                                                title="Xác nhận xóa CV"
                                                description="Bạn có chắc chắn muốn xóa bản CV này không?"
                                                onConfirm={() => handleDelete(cv.id)}
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button size="small" type="text" danger icon={<DeleteOutlined />}>
                                                    Xóa
                                                </Button>
                                            </Popconfirm>
                                            <Button
                                                size="small"
                                                type="primary"
                                                ghost
                                                icon={<EditOutlined />}
                                                onClick={() => navigate(`/cv/upsert?id=${cv.id}`)}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Danh sách Mẫu CV có sẵn */}
                    <div className={styles.templateSection}>
                        <h3 className={styles.templateTitle}>Chọn Mẫu CV để tạo mới</h3>
                        {templates.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                                <Text type="secondary">Chưa có mẫu CV nào được tạo trên hệ thống.</Text>
                            </div>
                        ) : (
                            <div className={styles.templateGrid}>
                                {templates.map((tpl) => (
                                    <div
                                        key={tpl.id}
                                        className={styles.templateCard}
                                        onClick={() => navigate(`/cv/upsert?templateId=${tpl.id}`)}
                                        style={{ padding: "14px", gap: 10 }}
                                    >
                                        {/* A4 thumbnail preview */}
                                        <MiniCVPreview tpl={tpl} />
                                        <span style={{ fontSize: 13, textAlign: "center" }}>{tpl.title}</span>
                                        <Button type="primary" size="small" icon={<PlusOutlined />}>
                                            Dùng mẫu này
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientCVPage;
