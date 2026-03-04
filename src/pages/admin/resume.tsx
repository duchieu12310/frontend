import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from "@ant-design/pro-components";
import { Space, message, notification, Tooltip, Modal, Input, Form } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { callDeleteResume, callUpdateResumeById } from "@/config/api";
import queryString from "query-string";
import { fetchResume } from "@/redux/slice/resumeSlide";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import {
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";

const ResumePage = () => {
    const tableRef = useRef<ActionType>();
    const dispatch = useAppDispatch();

    const isFetching = useAppSelector((state) => state.resume.isFetching);
    const meta = useAppSelector((state) => state.resume.meta);
    const resumes = useAppSelector((state) => state.resume.result);

    // 👇 Lấy thông tin user hiện tại để kiểm tra role
    const currentUser = useAppSelector((state) => state.account.user);
    const isAdmin = currentUser?.role?.name === "SUPER_ADMIN"; // tùy hệ thống bạn, có thể đổi tên role

    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState(false);

    const [rejectModal, setRejectModal] = useState<{ open: boolean; id?: string }>({ open: false });
    const [approveModal, setApproveModal] = useState<{
        open: boolean;
        id?: string;
        defaultAddress?: string;
    }>({ open: false });

    const [formReject] = Form.useForm();
    const [formApprove] = Form.useForm();

    const reloadTable = () => tableRef?.current?.reload();

    // 🗑️ Xóa hồ sơ
    const handleDeleteResume = async (id?: string) => {
        if (!id) return;
        const res = await callDeleteResume(id);
        if (res && res.data) {
            message.success("Xóa hồ sơ thành công");
            reloadTable();
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description: res.message,
            });
        }
    };

    // ❌ Từ chối hồ sơ
    const handleRejectSubmit = async () => {
        try {
            const values = await formReject.validateFields();
            const res = await callUpdateResumeById(rejectModal.id!, {
                status: "REJECTED",
                note: values.reason,
            });
            if (res && res.data) {
                message.warning("Đã từ chối hồ sơ");
                setRejectModal({ open: false });
                formReject.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi từ chối hồ sơ",
                    description: res.message,
                });
            }
        } catch {
            // bỏ qua lỗi validation
        }
    };

    // ✅ Chấp nhận hồ sơ
    const handleApproveSubmit = async () => {
        try {
            const values = await formApprove.validateFields();
            const res = await callUpdateResumeById(approveModal.id!, {
                status: "APPROVED",
                note: values.address,
            });
            if (res && res.data) {
                message.success("Đã chấp nhận hồ sơ");
                setApproveModal({ open: false });
                formApprove.resetFields();
                reloadTable();
            } else {
                notification.error({
                    message: "Lỗi chấp nhận hồ sơ",
                    description: res.message,
                });
            }
        } catch {
            // bỏ qua lỗi validation
        }
    };

    // 📋 Cấu hình bảng
    const columns: ProColumns<IResume>[] = [
        {
            title: "Mã hồ sơ",
            dataIndex: "id",
            width: 80,
            render: (_, record) => (
                <a
                    href="#"
                    onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}
                >
                    {record.id}
                </a>
            ),
            hideInSearch: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            copyable: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            sorter: true,
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: "Đang chờ",
                        REVIEWING: "Đang xem xét",
                        APPROVED: "Đã duyệt",
                        REJECTED: "Từ chối",
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },
        {
            title: "Công ty",
            dataIndex: ["job", "company", "name"],
            hideInSearch: true,
            render: (_, record) => record.job?.company?.name || "",
        },
        {
            title: "Vị trí ứng tuyển",
            dataIndex: ["job", "name"],
            hideInSearch: true,
            render: (_, record) => record.job?.name || "",
        },
        {
            title: "Người nộp hồ sơ",
            dataIndex: ["user", "name"],
            hideInSearch: true,
            render: (_, record) => record.user?.name || record.email || "",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 200,
            sorter: true,
            render: (_, record) =>
                record.createdAt
                    ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
                    : "",
            hideInSearch: true,
        },
        {
            title: "Thao tác",
            hideInSearch: true,
            width: 220,
            render: (_, entity) => {
                const status = entity.status;
                const showApprove = status === "PENDING" || status === "REJECTED";
                const showReject = status === "PENDING" || status === "APPROVED";

                return (
                    <Space>
                        {/* 👁️ Xem chi tiết */}
                        <Tooltip title="Xem chi tiết">
                            <EditOutlined
                                style={{ fontSize: 20, color: "#ffa500" }}
                                onClick={() => {
                                    setOpenViewDetail(true);
                                    setDataInit(entity);
                                }}
                            />
                        </Tooltip>

                        {/* ✅ và ❌ chỉ hiển thị khi KHÔNG phải admin */}
                        {!isAdmin && (
                            <>
                                {/* ✅ Chấp nhận */}
                                {showApprove && (
                                    <Tooltip title="Chấp nhận hồ sơ">
                                        <CheckOutlined
                                            style={{ fontSize: 20, color: "green" }}
                                            onClick={() =>
                                                setApproveModal({
                                                    open: true,
                                                    id: entity.id,
                                                    defaultAddress:
                                                        entity.job?.company?.address ||
                                                        "Địa chỉ công ty",
                                                })
                                            }
                                        />
                                    </Tooltip>
                                )}

                                {/* ❌ Từ chối */}
                                {showReject && (
                                    <Tooltip title="Từ chối hồ sơ">
                                        <CloseOutlined
                                            style={{ fontSize: 20, color: "red" }}
                                            onClick={() =>
                                                setRejectModal({ open: true, id: entity.id })
                                            }
                                        />
                                    </Tooltip>
                                )}
                            </>
                        )}

                        {/* 🗑️ Xóa */}
                        <Access permission={ALL_PERMISSIONS.RESUMES.DELETE}>
                            <Tooltip title="Xóa hồ sơ">
                                <DeleteOutlined
                                    style={{ fontSize: 20, color: "darkred" }}
                                    onClick={() => handleDeleteResume(entity.id?.toString())}
                                />
                            </Tooltip>
                        </Access>
                    </Space>
                );
            },
        },
    ];

    // 🔍 Build query filter
    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone?.status?.length) {
            clone.filter = sfIn("status", clone.status).toString();
            delete clone.status;
        }
        clone.page = clone.current;
        clone.size = clone.pageSize;
        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);
        let sortBy = "";

        if (sort?.status)
            sortBy = sort.status === "ascend" ? "sort=status,asc" : "sort=status,desc";
        if (sort?.createdAt)
            sortBy =
                sort.createdAt === "ascend"
                    ? "sort=createdAt,asc"
                    : "sort=createdAt,desc";
        if (sort?.updatedAt)
            sortBy =
                sort.updatedAt === "ascend"
                    ? "sort=updatedAt,asc"
                    : "sort=updatedAt,desc";

        temp += sortBy ? `&${sortBy}` : "&sort=updatedAt,desc";
        return temp;
    };

    return (
        <div>
            <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách hồ sơ"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={resumes}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchResume({ query }));
                    }}
                    scroll={{ x: true }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => (
                            <div>
                                {range[0]}-{range[1]} trên {total} dòng
                            </div>
                        ),
                    }}
                    rowSelection={false}
                    toolBarRender={false}
                />
            </Access>

            {/* 👁️ Modal xem chi tiết */}
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />

            {/* ❌ Modal từ chối */}
            <Modal
                title="Từ chối hồ sơ"
                open={rejectModal.open}
                onCancel={() => setRejectModal({ open: false })}
                onOk={handleRejectSubmit}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
            >
                <Form form={formReject} layout="vertical">
                    <Form.Item
                        label="Lý do từ chối"
                        name="reason"
                        rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ✅ Modal chấp nhận */}
            <Modal
                title="Chấp nhận hồ sơ - Hẹn phỏng vấn"
                open={approveModal.open}
                onCancel={() => setApproveModal({ open: false })}
                onOk={handleApproveSubmit}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <Form form={formApprove} layout="vertical">
                    <Form.Item
                        label="Địa điểm phỏng vấn"
                        name="address"
                        initialValue={approveModal.defaultAddress}
                        rules={[{ required: true, message: "Vui lòng nhập địa điểm phỏng vấn" }]}
                    >
                        <Input placeholder="Nhập địa điểm phỏng vấn..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResumePage;
