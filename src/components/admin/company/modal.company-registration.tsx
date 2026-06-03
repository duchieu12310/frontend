import { Drawer, Descriptions, Image, Tag } from "antd";
import dayjs from "dayjs";
import { ICompany, IAddress } from "@/types/backend";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    record: ICompany | null;
}

const CompanyRegistrationDrawer = ({ open, setOpen, record }: Props) => {
    const getFullAddress = (addr?: IAddress) => {
        if (!addr) return "—";
        return [
            addr.line,
            addr.ward?.name,
            addr.district?.name,
            addr.province?.name
        ].filter(Boolean).join(", ");
    };

    return (
        <Drawer
            title="Chi tiết đăng ký công ty"
            placement="right"
            width={750}
            onClose={() => setOpen(false)}
            open={open}
            destroyOnClose
        >
            {record ? (
                <Descriptions bordered column={1} size="middle" style={{ marginTop: 10 }}>
                    <Descriptions.Item label="Tên công ty">{record.name}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{record.description || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Mã số thuế">{record.taxCode || "—"}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{getFullAddress(record.address)}</Descriptions.Item>
                    <Descriptions.Item label="Logo">
                        {record.logo ? (
                            <Image
                                width={100}
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${record.logo}`}
                            />
                        ) : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tài liệu xác minh">
                        {record.businessLicense ? (
                            <a
                                href={`${import.meta.env.VITE_BACKEND_URL}/storage/company-documents/${record.businessLicense}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Xem tài liệu giấy phép
                            </a>
                        ) : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={record.status === "APPROVED" ? "green" : record.status === "REJECTED" ? "red" : "blue"}>
                            {record.status || "PENDING"}
                        </Tag>
                    </Descriptions.Item>
                    {record.rejectReason && (
                        <Descriptions.Item label="Lý do từ chối">{record.rejectReason}</Descriptions.Item>
                    )}
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(record.createdAt).format("DD-MM-YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày cập nhật">
                        {record.updatedAt ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm") : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Người đăng ký">
                        {record.owner ? `${record.owner.name} (${record.owner.email})` : "—"}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có dữ liệu</p>
            )}
        </Drawer>
    );
};

export default CompanyRegistrationDrawer;
