// src/components/admin/company-registration/CompanyRegistrationDrawer.tsx
import { Drawer, Descriptions, Image, Tag } from "antd";
import dayjs from "dayjs";
import { ICompanyRegistration } from "@/types/backend";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    record: ICompanyRegistration | null;
}

const CompanyRegistrationDrawer = ({ open, setOpen, record }: Props) => {
    return (
        <Drawer
            title="Chi tiết đăng ký công ty"
            placement="right"
            width={600}
            onClose={() => setOpen(false)}
            open={open}
        >
            {record ? (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tên công ty">{record.companyName}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{record.description || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{record.address || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Logo">
                        {record.logo ? (
                            <Image
                                width={100}
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company-logo/${record.logo}`}
                            />
                        ) : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Facebook">{record.facebookLink || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Github">{record.githubLink || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Tài liệu xác minh">
                        {record.verificationDocument ? (
                            <a
                                href={`${import.meta.env.VITE_BACKEND_URL}/storage/company-documents/${record.verificationDocument}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Xem tài liệu
                            </a>
                        ) : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={record.status === "APPROVED" ? "green" : record.status === "REJECTED" ? "red" : "blue"}>
                            {record.status || "PENDING"}
                        </Tag>
                    </Descriptions.Item>
                    {record.rejectionReason && (
                        <Descriptions.Item label="Lý do từ chối">{record.rejectionReason}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(record.createdAt).format("DD-MM-YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {record.updatedAt ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm") : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người đăng ký">
                        {record.user ? `${record.user.name} (${record.user.email})` : "—"}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có dữ liệu</p>
            )}
        </Drawer>
    );
};

export default CompanyRegistrationDrawer;
