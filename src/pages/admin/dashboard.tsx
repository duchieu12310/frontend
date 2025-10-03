import React, { useState, useEffect } from "react";
import { Layout, Card, Statistic, DatePicker, Row, Col, Spin } from "antd";
import {
    UserOutlined,
    BankOutlined,
    FileTextOutlined,
    FileSearchOutlined,
    StarOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import {
    callFetchUser,
    callFetchCompany,
    callFetchJob,
    callFetchResume,
    callFetchAllSkill,
    callFetchSubscriber,
} from "@/config/api";

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

export default function Dashboard() {
    const [filterType, setFilterType] = useState("month");
    const [loading, setLoading] = useState(false);

    const [counts, setCounts] = useState({
        users: 0,
        companies: 0,
        jobs: 0,
        resumes: 0,
        skills: 0,
        subscribers: 0,
    });

    // Dữ liệu cho biểu đồ
    const [chartData, setChartData] = useState<any[]>([]);

    // Load dữ liệu từ API
    const fetchData = async () => {
        try {
            setLoading(true);
            const [
                resUser,
                resCompany,
                resJob,
                resResume,
                resSkill,
                resSubs,
            ] = await Promise.all([
                callFetchUser("page=1&pageSize=1"),
                callFetchCompany("page=1&pageSize=1"),
                callFetchJob("page=1&pageSize=1"),
                callFetchResume("page=1&pageSize=1"),
                callFetchAllSkill("page=1&pageSize=1"),
                callFetchSubscriber("page=1&pageSize=1"),
            ]);

            const data = {
                users: resUser?.data?.meta?.total || 0,
                companies: resCompany?.data?.meta?.total || 0,
                jobs: resJob?.data?.meta?.total || 0,
                resumes: resResume?.data?.meta?.total || 0,
                skills: resSkill?.data?.meta?.total || 0,
                subscribers: resSubs?.data?.meta?.total || 0,
            };

            setCounts(data);

            // Tạm thời chỉ hiển thị 1 mốc tổng để minh họa
            setChartData([
                {
                    time: "Hiện tại",
                    ...data,
                },
            ]);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu Dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (value: any) => {
        if (!value) return;
        if (value.length === 2) {
            setFilterType("range");
        } else {
            setFilterType("day");
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Layout>
                <Header style={{ background: "#fff", padding: "0 20px" }}>
                    <h2>Hệ thống quản trị</h2>
                </Header>
                <Content style={{ margin: "20px" }}>
                    <Spin spinning={loading}>
                        {/* Bộ lọc */}
                        <Card style={{ marginBottom: "20px" }}>
                            <h3>Bộ lọc thống kê</h3>
                            <RangePicker
                                picker={filterType === "month" ? "month" : "date"}
                                format={filterType === "month" ? "MM-YYYY" : "DD-MM-YYYY"}
                                onChange={handleFilterChange}
                            />
                        </Card>

                        {/* Tổng quan */}
                        <Row gutter={16}>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Người dùng"
                                        value={counts.users}
                                        prefix={<UserOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Công ty"
                                        value={counts.companies}
                                        prefix={<BankOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Việc làm"
                                        value={counts.jobs}
                                        prefix={<FileSearchOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Hồ sơ"
                                        value={counts.resumes}
                                        prefix={<FileTextOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Kỹ năng"
                                        value={counts.skills}
                                        prefix={<StarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={4}>
                                <Card>
                                    <Statistic
                                        title="Subscribers"
                                        value={counts.subscribers}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Biểu đồ đường */}
                        <Card style={{ marginTop: "20px" }}>
                            <h3>
                                Thống kê theo{" "}
                                {filterType === "month"
                                    ? "tháng"
                                    : filterType === "day"
                                        ? "ngày"
                                        : "khoảng thời gian"}
                            </h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#8884d8"
                                        name="Người dùng"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="companies"
                                        stroke="#82ca9d"
                                        name="Công ty"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="jobs"
                                        stroke="#ffc658"
                                        name="Việc làm"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="resumes"
                                        stroke="#ff8042"
                                        name="Hồ sơ"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="skills"
                                        stroke="#0088FE"
                                        name="Kỹ năng"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="subscribers"
                                        stroke="#00C49F"
                                        name="Subscribers"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>

                        {/* Biểu đồ cột */}
                        <Card style={{ marginTop: "20px" }}>
                            <h3>So sánh tổng quan</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="users" fill="#8884d8" name="Người dùng" />
                                    <Bar dataKey="companies" fill="#82ca9d" name="Công ty" />
                                    <Bar dataKey="jobs" fill="#ffc658" name="Việc làm" />
                                    <Bar dataKey="resumes" fill="#ff8042" name="Hồ sơ" />
                                    <Bar dataKey="skills" fill="#0088FE" name="Kỹ năng" />
                                    <Bar
                                        dataKey="subscribers"
                                        fill="#00C49F"
                                        name="Subscribers"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Spin>
                </Content>
            </Layout>
        </Layout>
    );
}
