import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IJob } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, RobotOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification, Modal, List, Progress, Tooltip, Tabs } from "antd";
import { useRef, useState, useEffect } from 'react';
import JobDetailDrawer from "@/components/admin/job/detail.job";
import dayjs from 'dayjs';
import { callDeleteJob, callSuggestCandidates, callFetchCompany, callFetchJob, callFetchPaidOrdersByCompany } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import { fetchJob } from "@/redux/slice/jobSlide";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfIn } from "spring-filter-query-builder";
import AiJobHistoryPage from "../ai-job-history";

const JobPage = () => {
    const tableRef = useRef<ActionType>();
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IJob | null>(null);

    const [openSuggestModal, setOpenSuggestModal] = useState<boolean>(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
    const [suggestedCandidates, setSuggestedCandidates] = useState<any[]>([]);
    const [selectedJobForSuggestions, setSelectedJobForSuggestions] = useState<IJob | null>(null);

    const isFetching = useAppSelector(state => state.job.isFetching);
    const meta = useAppSelector(state => state.job.meta);
    const jobs = useAppSelector(state => state.job.result);
    const user = useAppSelector(state => state.account.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [companyLimit, setCompanyLimit] = useState<{ 
        jobLimit: number; 
        jobDurationLimit: number; 
        currentJobs: number;
        purchasedPackages: { name: string; jobLimit: number; jobDurationLimit: number; amount: number }[]
    } | null>(null);

    useEffect(() => {
        const fetchEmployerLimits = async () => {
            if (user && user.role?.name === 'EMPLOYER') {
                try {
                    const resComp = await callFetchCompany("page=1&size=1");
                    if (resComp && resComp.data && resComp.data.result.length > 0) {
                        const comp = resComp.data.result[0];
                        const resJobs = await callFetchJob(`page=1&size=1&filter=company.id:${comp.id}`);
                        const resOrders = await callFetchPaidOrdersByCompany(comp.id);
                        
                        let purchasedPackagesList: any[] = [];
                        if (resOrders && resOrders.data) {
                            purchasedPackagesList = resOrders.data.map((order: any) => {
                                if (order.subscriptionPackage) {
                                    return {
                                        name: order.subscriptionPackage.name,
                                        jobLimit: order.subscriptionPackage.jobLimit ?? 0,
                                        jobDurationLimit: order.subscriptionPackage.jobDurationLimit ?? 0,
                                        amount: order.amount ?? 0
                                    };
                                } else {
                                    return {
                                        name: "Mua lẻ giới hạn",
                                        jobLimit: order.jobLimit ?? 0,
                                        jobDurationLimit: order.jobDurationLimit ?? 0,
                                        amount: order.amount ?? 0
                                    };
                                }
                            });
                        }

                        let jobLimit = (comp as any).jobLimit ?? 15;
                        let jobDurationLimit = (comp as any).jobDurationLimit ?? 30;
                        const expireDate = (comp as any).packageExpireDate;
                        
                        if (expireDate && dayjs(expireDate).isBefore(dayjs())) {
                            jobLimit = 0;
                            jobDurationLimit = 0;
                        }

                        setCompanyLimit({
                            jobLimit: jobLimit,
                            jobDurationLimit: jobDurationLimit,
                            currentJobs: resJobs?.data?.meta?.total ?? 0,
                            purchasedPackages: purchasedPackagesList
                        });
                    }
                } catch (error) {
                    console.error("Error fetching employer limits: ", error);
                }
            }
        }
        fetchEmployerLimits();
    }, [user]);

    const handleDeleteJob = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteJob(id);
            if (res && (res.data || res.statusCode === 200 || res.statusCode === 201)) {
                message.success('Xóa công việc thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleSuggestCandidates = async (job: IJob) => {
        if (!job.id) return;
        setSelectedJobForSuggestions(job);
        setOpenSuggestModal(true);
        setLoadingSuggestions(true);
        setSuggestedCandidates([]);
        try {
            const res = await callSuggestCandidates(job.id);
            if (res && res.data && res.data.candidates) {
                setSuggestedCandidates(res.data.candidates);
            } else {
                notification.error({
                    message: 'Gợi ý ứng viên thất bại',
                    description: res.message || 'Không thể tải danh sách ứng viên gợi ý.'
                });
            }
        } catch (error: any) {
            notification.error({
                message: 'Gợi ý ứng viên thất bại',
                description: error.message || 'Có lỗi xảy ra khi gọi AI.'
            });
        } finally {
            setLoadingSuggestions(false);
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IJob>[] = [
        {
            title: 'STT',
            key: 'index',
            width: 50,
            align: "center",
            render: (text, record, index) => {
                return (
                    <>
                        {(index + 1) + (meta.page - 1) * (meta.pageSize)}
                    </>)
            },
            hideInSearch: true,
        },
        {
            title: 'Tên công việc',
            dataIndex: 'name',
            sorter: true,
            render: (text, record) => {
                return (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setDataInit(record);
                            setOpenViewDetail(true);
                        }}
                        style={{ fontWeight: 500, color: "#1890ff" }}
                    >
                        {record.name}
                    </a>
                )
            }
        },
        {
            title: 'Công ty',
            dataIndex: ["company", "name"],
            sorter: true,
            hideInSearch: false,
            search: {
                transform: (value) => {
                    return { companyName: value };
                }
            }
        },
        {
            title: 'Mức lương',
            dataIndex: 'salary',
            sorter: true,
            render(dom, entity) {
                const str = "" + entity.salary;
                return <>{str?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ</>
            },
        },
        {
            title: 'Cấp bậc',
            dataIndex: 'levels',
            render: (text, record) => {
                const values = record.levels && record.levels.length > 0 
                    ? record.levels.map((lvl: any) => typeof lvl === 'object' ? lvl.name : lvl) 
                    : (record.level ? [record.level] : []);
                return (
                    <Space size={[0, 4]} wrap>
                        {values.map((lvl) => {
                            let color = 'blue';
                            if (lvl === 'INTERN') color = 'cyan';
                            else if (lvl === 'FRESHER') color = 'green';
                            else if (lvl === 'JUNIOR') color = 'geekblue';
                            else if (lvl === 'MIDDLE') color = 'orange';
                            else if (lvl === 'SENIOR') color = 'volcano';
                            return <Tag color={color} key={lvl}>{lvl}</Tag>
                        })}
                    </Space>
                )
            },
            renderFormItem: () => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        INTERN: 'Thực tập',
                        FRESHER: 'Mới ra trường',
                        JUNIOR: 'Nhân viên ít kinh nghiệm',
                        MIDDLE: 'Nhân viên có kinh nghiệm',
                        SENIOR: 'Chuyên gia',
                    }}
                    placeholder="Chọn cấp bậc"
                />
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render(dom, entity) {
                const status = entity.status;
                if (status) {
                    const colors: Record<string, string> = {
                        PENDING: "warning",
                        REVIEWING: "processing",
                        APPROVED: "lime",
                        REJECTED: "red",
                        REVISION_REQUIRED: "magenta"
                    };
                    const labels: Record<string, string> = {
                        PENDING: "Chờ duyệt",
                        REVIEWING: "Đang xem xét",
                        APPROVED: "Đang hoạt động",
                        REJECTED: "Từ chối",
                        REVISION_REQUIRED: "Yêu cầu sửa lại"
                    };
                    return <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>;
                }
                return (
                    <Tag color={entity.active ? "lime" : "red"} >
                        {entity.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                    </Tag>
                );
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (_, record) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (_, record) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 50,
            render: (_value, entity) => (
                <Space>
                    {user?.role?.name === 'EMPLOYER' && (
                        <Tooltip title="Gợi ý ứng viên AI">
                            <RobotOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#1890ff',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleSuggestCandidates(entity)}
                            />
                        </Tooltip>
                    )}
                    <Access
                        permission={ALL_PERMISSIONS.JOBS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            onClick={() => {
                                navigate(`/admin/job/upsert?id=${entity.id}`)
                            }}
                        />
                    </Access>
                    <Access
                        permission={ALL_PERMISSIONS.JOBS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa công việc"}
                            description={"Bạn có chắc chắn muốn xóa công việc này?"}
                            onConfirm={() => handleDeleteJob(entity.id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        let parts = [];
        if (clone.name) parts.push(`name ~ '${clone.name}'`);
        if (clone.salary) parts.push(`salary ~ '${clone.salary}'`);
        if (clone.companyName) parts.push(`company.name ~ '${clone.companyName}'`);
        if (clone?.levels?.length) {
            parts.push(`${sfIn("levels.name", clone.levels).toString()}`);
        }

        clone.filter = parts.join(' and ');
        if (!clone.filter) delete clone.filter;

        clone.page = clone.current;
        clone.size = clone.pageSize;

        delete clone.current;
        delete clone.pageSize;
        delete clone.name;
        delete clone.salary;
        delete clone.levels;
        delete clone.companyName;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        const fields = ["name", "salary", "createdAt", "updatedAt"];
        if (sort) {
            for (const field of fields) {
                if (sort[field]) {
                    sortBy = `sort=${field},${sort[field] === 'ascend' ? 'asc' : 'desc'}`;
                    break;
                }
            }
            if (!sortBy) {
                // handle nested company.name sort
                if (sort['company,name']) {
                    sortBy = `sort=company.name,${sort['company,name'] === 'ascend' ? 'asc' : 'desc'}`;
                } else if (sort['company.name']) {
                    sortBy = `sort=company.name,${sort['company.name'] === 'ascend' ? 'asc' : 'desc'}`;
                } else if (sort['company']) {
                    // sometimes antd passes { company: 'ascend' } if field is just company
                    sortBy = `sort=company.name,${sort['company'] === 'ascend' ? 'asc' : 'desc'}`;
                }
            }
        }

        // Mặc định sắp xếp theo ngày cập nhật
        if (sortBy) {
            temp = `${temp}&${sortBy}`;
        } else {
            temp = `${temp}&sort=updatedAt,desc`;
        }

        return temp;
    }

    const tabItems = [
        {
            key: '1',
            label: 'Quản lý Công việc',
            children: (
                <div style={{ marginTop: 15 }}>
                    {companyLimit && (
                        <div style={{
                            background: '#e6f7ff',
                            border: '1px solid #91d5ff',
                            borderRadius: '8px',
                            padding: '16px 20px',
                            marginBottom: '15px',
                            color: '#0050b3',
                            fontSize: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
                                <div>
                                    <strong>Thông tin giới hạn tin đăng doanh nghiệp:</strong>
                                </div>
                                <div>
                                    • Tổng số tin tuyển dụng: <strong style={{ color: '#cf1322' }}>{companyLimit.currentJobs}</strong> / <strong>{companyLimit.jobLimit}</strong> bài
                                </div>
                                <div>
                                    • Thời hạn đăng tối đa hiện tại: <strong>{companyLimit.jobDurationLimit} ngày</strong>
                                </div>
                            </div>
                            {companyLimit.purchasedPackages && companyLimit.purchasedPackages.length > 0 && (
                                <>
                                    <div style={{ borderTop: '1px dashed #91d5ff', paddingTop: '8px', marginTop: '4px' }}>
                                        <strong>Chi tiết các gói cước đang sở hữu ({companyLimit.purchasedPackages.length}):</strong>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px' }}>
                                        {companyLimit.purchasedPackages.map((pkg, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                                <span>• Gói <strong>{pkg.name}</strong>:</span>
                                                {pkg.jobLimit > 0 && (
                                                    <span>Số lượng bài đăng: <strong>+{pkg.jobLimit}</strong></span>
                                                )}
                                                {pkg.jobDurationLimit > 0 && (
                                                    <span>Thời hạn đăng tối đa mỗi bài: <strong>{pkg.jobDurationLimit} ngày</strong></span>
                                                )}
                                                {pkg.jobLimit === 0 && pkg.jobDurationLimit === 0 && (
                                                    <span style={{ color: '#8c8c8c' }}>Gói tính năng bổ trợ</span>
                                                )}
                                                {pkg.amount > 0 && (
                                                    <span>Số tiền: <strong style={{ color: '#52c41a' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.amount)}</strong></span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <Access
                        permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}
                    >
                        <DataTable<IJob>
                            actionRef={tableRef}
                            headerTitle="Danh sách công việc"
                            rowKey="id"
                            loading={isFetching}
                            columns={columns}
                            dataSource={jobs}
                            request={async (params, sort, filter): Promise<any> => {
                                const query = buildQuery(params, sort, filter);
                                dispatch(fetchJob({ query }))
                            }}
                            scroll={{ x: true }}
                            pagination={
                                {
                                    current: meta.page,
                                    pageSize: meta.pageSize,
                                    showSizeChanger: true,
                                    total: meta.total,
                                    showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} dòng</div>) }
                                }
                            }
                            rowSelection={false}
                            toolBarRender={(_action, _rows): any => {
                                const maxJobs = companyLimit?.jobLimit ?? 15;
                                const isEmployer = user?.role?.name === 'EMPLOYER';
                                
                                return (isEmployer && meta.total >= maxJobs) ? (
                                    <Button
                                        icon={<PlusOutlined />}
                                        type="primary"
                                        onClick={() => navigate('/admin/subscription')}
                                    >
                                        Nâng cấp gói để thêm công việc
                                    </Button>
                                ) : (
                                    <Button
                                        icon={<PlusOutlined />}
                                        type="primary"
                                        onClick={() => navigate('upsert')}
                                    >
                                        Thêm công việc mới
                                    </Button>
                                );
                            }}
                        />
                    </Access>
                    <JobDetailDrawer
                        open={openViewDetail}
                        setOpen={setOpenViewDetail}
                        record={dataInit}
                    />
                    <Modal
                        title={`Gợi ý ứng viên AI cho công việc: ${selectedJobForSuggestions?.name}`}
                        open={openSuggestModal}
                        onCancel={() => setOpenSuggestModal(false)}
                        footer={[
                            <Button key="close" onClick={() => setOpenSuggestModal(false)}>
                                Đóng
                            </Button>
                        ]}
                        width={800}
                        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
                    >
                        <List
                            loading={loadingSuggestions}
                            dataSource={suggestedCandidates}
                            locale={{ emptyText: 'Không có ứng viên nào có độ phù hợp trên 40%' }}
                            renderItem={(item) => (
                                <List.Item
                                    style={{
                                        padding: '16px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        background: '#fafafa',
                                        display: 'block'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{item.candidateName}</h4>
                                            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{item.email} - {item.cvTitle}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                            <div style={{ fontWeight: 600, color: item.matchScore >= 80 ? '#52c41a' : item.matchScore >= 60 ? '#1890ff' : '#fa8c16' }}>
                                                Độ phù hợp: {item.matchScore}%
                                            </div>
                                            <Progress 
                                                percent={item.matchScore} 
                                                showInfo={false} 
                                                strokeColor={item.matchScore >= 80 ? '#52c41a' : item.matchScore >= 60 ? '#1890ff' : '#fa8c16'}
                                                size="small" 
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Lý do phù hợp:</strong> <span style={{ color: '#595959' }}>{item.matchReason}</span>
                                    </div>
                                    {item.missingSkills && item.missingSkills.length > 0 && (
                                        <div>
                                            <strong>Kỹ năng còn thiếu:</strong>{" "}
                                            {item.missingSkills.map((skill: string) => (
                                                <Tag color="volcano" key={skill} style={{ margin: '2px' }}>{skill}</Tag>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                        <Button 
                                            type="link" 
                                            onClick={() => {
                                                window.open(`/cv/view/${item.cvId}`, '_blank');
                                            }}
                                            style={{ padding: 0 }}
                                        >
                                            Xem CV chi tiết &rarr;
                                        </Button>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Modal>
                </div>
            )
        },
        {
            key: '2',
            label: 'Lịch sử gợi ý ứng viên bằng AI',
            children: (
                <div style={{ marginTop: 15 }}>
                    <AiJobHistoryPage />
                </div>
            )
        }
    ];

    return (
        <div>
            <Tabs defaultActiveKey="1" items={tabItems} />
        </div>
    )
}

export default JobPage;
