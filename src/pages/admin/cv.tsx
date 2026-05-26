import DataTable from "@/components/client/data-table";
import { IFormatCV, IJob } from "@/types/backend";
import { EyeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Select, Space, message, notification, Tooltip } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { callFetchFormatCVs, callFetchAllJob, callCreateResume } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const AdminCVPage = () => {
    const tableRef = useRef<ActionType>();
    
    // Modal states for assigning job
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedCv, setSelectedCv] = useState<IFormatCV | null>(null);
    const [jobs, setJobs] = useState<IJob[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | number | undefined>(undefined);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch jobs when Modal is opened
    useEffect(() => {
        const fetchJobs = async () => {
            if (isAssignModalOpen) {
                setLoadingJobs(true);
                try {
                    const res = await callFetchAllJob("page=1&size=100&sort=updatedAt,desc");
                    if (res && res.data) {
                        setJobs(res.data.result || []);
                    }
                } catch (error) {
                    message.error("Lỗi khi tải danh sách công việc");
                } finally {
                    setLoadingJobs(false);
                }
            }
        };
        fetchJobs();
    }, [isAssignModalOpen]);

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    const handleAssignJob = async () => {
        if (!selectedJobId) {
            message.error("Vui lòng chọn công việc ứng tuyển!");
            return;
        }
        if (!selectedCv || !selectedCv.user) {
            message.error("Không tìm thấy thông tin ứng viên!");
            return;
        }

        setSubmitting(true);
        try {
            // Apply candidate to selected job using callCreateResume (empty url since it's a formatCv)
            const res = await callCreateResume(
                "", 
                selectedJobId, 
                selectedCv.user.email, 
                selectedCv.user.id, 
                selectedCv.id
            );

            if (res && res.data) {
                message.success(`Đã thêm ứng viên ${selectedCv.user.name} vào công việc thành công!`);
                setIsAssignModalOpen(false);
                setSelectedJobId(undefined);
                setSelectedCv(null);
                reloadTable();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message || "Không thể gán CV vào công việc này"
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.message || "Lỗi kết nối máy chủ"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ProColumns<IFormatCV>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 60,
            hideInSearch: true,
        },
        {
            title: 'Tiêu đề CV',
            dataIndex: 'title',
            sorter: true,
            render: (text, record) => (
                <a href={`/cv/view/${record.id}`} target="_blank" rel="noreferrer" style={{ fontWeight: 550 }}>
                    {record.title}
                </a>
            )
        },
        {
            title: 'Ứng viên',
            dataIndex: ['user', 'name'],
            render: (text, record) => record.user?.name || "N/A"
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'],
            render: (text, record) => record.user?.email || "N/A"
        },
        {
            title: 'Mẫu gốc',
            dataIndex: ['cvTemplate', 'title'],
            hideInSearch: true,
            render: (text, record) => record.cvTemplate?.title || "Mẫu tùy chỉnh"
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 170,
            sorter: true,
            render: (text, record) => (
                <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
            ),
            hideInSearch: true,
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 120,
            render: (_value, entity) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết CV">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined style={{ fontSize: 18, color: '#1890ff' }} />} 
                            onClick={() => window.open(`/cv/view/${entity.id}`, '_blank')}
                        />
                    </Tooltip>
                    <Tooltip title="Thêm vào công việc">
                        <Button 
                            type="text" 
                            icon={<PlusCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />} 
                            onClick={() => {
                                setSelectedCv(entity);
                                setIsAssignModalOpen(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.title) clone.title = `/${clone.title}/i`;
        if (clone["user.name"]) {
            clone["user.name"] = `/${clone["user.name"]}/i`;
        }
        if (clone["user.email"]) {
            clone["user.email"] = `/${clone["user.email"]}/i`;
        }

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.title) {
            sortBy = sort.title === 'ascend' ? "sort=title,asc" : "sort=title,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        if (!sortBy) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    };

    return (
        <Access permission={ALL_PERMISSIONS.FORMAT_CVS.GET_PAGINATE}>
            <div>
                <DataTable<IFormatCV>
                    actionRef={tableRef}
                    headerTitle="Quản lý CV của Ứng viên"
                    rowKey="id"
                    columns={columns}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        const res = await callFetchFormatCVs(query);
                        if (res && res.data) {
                            return {
                                data: res.data.result,
                                success: true,
                                total: res.data.meta.total
                            };
                        }
                        return {
                            data: [],
                            success: false,
                            total: 0
                        };
                    }}
                />

                {/* Modal Assign to Job */}
                <Modal
                    title={<span style={{ fontSize: 16, fontWeight: 650 }}>Gán CV vào công việc mong muốn</span>}
                    open={isAssignModalOpen}
                    onOk={handleAssignJob}
                    onCancel={() => {
                        setIsAssignModalOpen(false);
                        setSelectedJobId(undefined);
                        setSelectedCv(null);
                    }}
                    confirmLoading={submitting}
                    okText="Xác nhận gán việc"
                    cancelText="Hủy bỏ"
                    maskClosable={false}
                    destroyOnClose
                >
                    <div style={{ padding: "10px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                            Ứng viên: <b>{selectedCv?.user?.name}</b> ({selectedCv?.user?.email})
                        </div>
                        <div>
                            CV liên kết: <b>{selectedCv?.title}</b>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontWeight: 500 }}>Chọn công việc ứng tuyển:</span>
                            <Select
                                showSearch
                                placeholder="Nhập từ khóa tìm kiếm công việc..."
                                optionFilterProp="children"
                                style={{ width: '100%' }}
                                value={selectedJobId}
                                onChange={(val) => setSelectedJobId(val)}
                                loading={loadingJobs}
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={jobs.map(job => ({
                                    value: job.id,
                                    label: `${job.name} - ${job.company?.name || "N/A"} (${job.location})`
                                }))}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </Access>
    );
};

export default AdminCVPage;
