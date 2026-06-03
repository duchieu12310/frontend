import DataTable from "@/components/client/data-table";
import { IAiCheckLog } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Space, Tag, Tooltip, Descriptions } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callFetchAiCheckLogs } from "@/config/api";
import queryString from 'query-string';
import { EyeOutlined, RobotOutlined } from "@ant-design/icons";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import MarkdownRenderer from "@/components/share/markdown-renderer";

const AiCheckHistoryPage = () => {
    const tableRef = useRef<ActionType>();
    const [openDetail, setOpenDetail] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<IAiCheckLog | null>(null);

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.candidateName) clone.candidateName = `/${clone.candidateName}/i`;
        if (clone.cvTitle) clone.cvTitle = `/${clone.cvTitle}/i`;
        if (clone.createdBy) clone.createdBy = `/${clone.createdBy}/i`;

        clone.page = clone.current;
        clone.size = clone.pageSize;
        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (!sortBy) {
            temp = `${temp}&sort=createdAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    };

    const columns: ProColumns<IAiCheckLog>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 60,
            hideInSearch: true,
        },
        {
            title: 'Ứng viên & CV',
            dataIndex: 'candidateName',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{record.candidateName || "Ẩn danh"}</span>
                    <a 
                        href={`/cv/view/${record.cvId}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ fontSize: '12px', color: '#1890ff', marginTop: '2px' }}
                    >
                        CV: {record.cvTitle || "CV Không tiêu đề"}
                    </a>
                </div>
            )
        },
        {
            title: 'Người kiểm tra',
            dataIndex: 'createdBy',
        },
        {
            title: 'Trạng thái AI',
            dataIndex: 'isInvalid',
            width: 260,
            render: (_, record) => {
                return record.isInvalid ? (
                    <Tag color="error">ĐỀ XUẤT TỪ CHỐI / KHÔNG PHÙ HỢP</Tag>
                ) : (
                    <Tag color="success">PHÙ HỢP / ĐẠT</Tag>
                );
            },
            valueType: 'select',
            valueEnum: {
                true: { text: 'Không phù hợp', status: 'Error' },
                false: { text: 'Phù hợp', status: 'Success' }
            }
        },
        {
            title: 'Ngày kiểm tra',
            dataIndex: 'createdAt',
            sorter: true,
            width: 170,
            hideInSearch: true,
            render: (_, record) => (
                <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : "N/A"}</>
            )
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 100,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem báo cáo chi tiết">
                        <Button 
                            type="text" 
                            icon={<EyeOutlined style={{ fontSize: 18, color: '#1890ff' }} />} 
                            onClick={() => {
                                setSelectedRecord(record);
                                setOpenDetail(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Access permission={ALL_PERMISSIONS.FORMAT_CVS.GET_PAGINATE}>
            <div>
                <DataTable<IAiCheckLog>
                    actionRef={tableRef}
                    headerTitle="Lịch sử kiểm tra CV bằng AI"
                    rowKey="id"
                    columns={columns}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        const res = await callFetchAiCheckLogs(query);
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

                <Drawer
                    title={
                        <span style={{ fontSize: '16px', fontWeight: 650 }}>
                            <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Chi tiết báo cáo đánh giá CV từ AI
                        </span>
                    }
                    placement="right"
                    width="55vw"
                    onClose={() => {
                        setOpenDetail(false);
                        setSelectedRecord(null);
                    }}
                    open={openDetail}
                    destroyOnClose
                >
                    {selectedRecord && (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Descriptions title="Thông tin chung" bordered column={1} size="small">
                                <Descriptions.Item label="Ứng viên"><b>{selectedRecord.candidateName || "Ẩn danh"}</b></Descriptions.Item>
                                <Descriptions.Item label="Tiêu đề CV">{selectedRecord.cvTitle || "CV Không tiêu đề"}</Descriptions.Item>
                                <Descriptions.Item label="Người kiểm tra">{selectedRecord.createdBy}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái đánh giá">
                                    {selectedRecord.isInvalid ? (
                                        <Tag color="error">ĐỀ XUẤT TỪ CHỐI / KHÔNG PHÙ HỢP</Tag>
                                    ) : (
                                        <Tag color="success">PHÙ HỢP / ĐẠT</Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian kiểm tra">
                                    {dayjs(selectedRecord.createdAt).format('DD-MM-YYYY HH:mm:ss')}
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '20px' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 650, borderBottom: '1px solid #e8e8e8', paddingBottom: '6px' }}>
                                    Báo cáo đánh giá chi tiết:
                                </h4>
                                <MarkdownRenderer content={selectedRecord.evaluationReport || ""} />
                            </div>
                        </Space>
                    )}
                </Drawer>
            </div>
        </Access>
    );
};

export default AiCheckHistoryPage;
