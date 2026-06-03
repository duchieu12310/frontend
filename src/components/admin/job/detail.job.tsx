import { Drawer, Descriptions, Tag, List } from "antd";
import dayjs from "dayjs";
import { IJob } from "@/types/backend";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    record: IJob | null;
}

const JobDetailDrawer = ({ open, setOpen, record }: Props) => {
    const formatSalary = (salary: number) => {
        return `${salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} đ`;
    };

    return (
        <Drawer
            title="Chi tiết công việc tuyển dụng"
            placement="right"
            width={750}
            onClose={() => setOpen(false)}
            open={open}
            destroyOnClose
        >
            {record ? (
                <Descriptions bordered column={1} size="middle" style={{ marginTop: 10 }}>
                    <Descriptions.Item label="Tên công việc">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Công ty">{record.company?.name || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Mức lương">{formatSalary(record.salary)}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng tuyển">{record.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">{record.location}</Descriptions.Item>
                    <Descriptions.Item label="Cấp bậc (Trình độ)">
                        {record.levels && record.levels.length > 0 ? (
                            record.levels.map((lvl: any) => {
                                const val = typeof lvl === "object" ? lvl.name : lvl;
                                return (
                                    <Tag color="blue" key={val} style={{ marginRight: 5 }}>
                                        {val}
                                    </Tag>
                                );
                            })
                        ) : (
                            record.level || "—"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kỹ năng yêu cầu">
                        {record.skills && record.skills.length > 0 ? (
                            record.skills.map((skill: any) => (
                                <Tag color="green" key={skill.id || skill} style={{ marginRight: 5 }}>
                                    {skill.name || skill}
                                </Tag>
                            ))
                        ) : (
                            "—"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời hạn tuyển">
                        {dayjs(record.startDate).format("DD-MM-YYYY")} ~ {dayjs(record.endDate).format("DD-MM-YYYY")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={record.active ? "lime" : "red"}>
                            {record.active ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu công việc">
                        {record.requirements && record.requirements.length > 0 ? (
                            <List
                                size="small"
                                dataSource={record.requirements}
                                renderItem={(item: any) => (
                                    <List.Item style={{ padding: "4px 0" }}>
                                        • {item.content}
                                    </List.Item>
                                )}
                            />
                        ) : (
                            "—"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Quyền lợi công việc">
                        {record.benefits && record.benefits.length > 0 ? (
                            <List
                                size="small"
                                dataSource={record.benefits}
                                renderItem={(item: any) => (
                                    <List.Item style={{ padding: "4px 0" }}>
                                        • {item.content}
                                    </List.Item>
                                )}
                            />
                        ) : (
                            "—"
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả công việc">
                        <div
                            dangerouslySetInnerHTML={{ __html: record.description }}
                            style={{
                                maxHeight: "250px",
                                overflowY: "auto",
                                padding: "8px",
                                border: "1px solid #f0f0f0",
                                borderRadius: "4px",
                                background: "#fafafa"
                            }}
                        />
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có dữ liệu</p>
            )}
        </Drawer>
    );
};

export default JobDetailDrawer;
