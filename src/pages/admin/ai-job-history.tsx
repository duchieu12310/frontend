import DataTable from "@/components/client/data-table";
import { ICvJobMatch } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Drawer, Space, Tag, Tooltip, Progress, Descriptions } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callFetchCvJobMatches } from "@/config/api";
import queryString from 'query-string';
import { EyeOutlined, ScheduleOutlined } from "@ant-design/icons";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const AiJobHistoryPage = () => {
    const tableRef = useRef<ActionType>();
    const [openDetail, setOpenDetail] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<ICvJobMatch | null>(null);

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.candidateName) clone.candidateName = `/${clone.candidateName}/i`;
        if (clone.jobTitle) clone.jobTitle = `/${clone.jobTitle}/i`;

        clone.page = clone.current;
        clone.size = clone.pageSize;
        delete clone.current;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);

        let sortBy = "";
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

    const columns: ProColumns<ICvJobMatch>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 60,
            hideInSearch: true,
        },
        {
            title: 'Công việc',
            dataIndex: 'jobTitle',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{record.jobTitle}</span>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>Công ty: {record.companyName}</span>
                </div>
            )
        },
        {
            title: 'Ứng viên & CV',
            dataIndex: 'candidateName',
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 550 }}>{record.candidateName}</span>
                    <a 
                        href={`/cv/view/${record.cvId}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ fontSize: '12px', color: '#1890ff', marginTop: '2px' }}
                    >
                        CV: {record.cvTitle}
                    </a>
                </div>
            )
        },
        {
            title: 'Độ phù hợp AI',
            dataIndex: 'matchScore',
            width: 150,
            render: (_, record) => {
                if (record.matchScore === undefined || record.matchScore === null) {
                    return <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>N/A</span>;
                }
                const score = record.matchScore;
                const color = score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#fa8c16';
                return (
                    <div style={{ width: '100%', minWidth: '100px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, color }}>{score}%</span>
                        </div>
                        <Progress 
                            percent={score} 
                            showInfo={false} 
                            strokeColor={color}
                            size="small" 
                        />
                    </div>
                );
            },
            hideInSearch: true,
        },
        {
            title: 'Kỹ năng thiếu hụt',
            dataIndex: 'missingSkills',
            hideInSearch: true,
            render: (_, record) => {
                if (!record.missingSkills) {
                    return <Tag color="green">Đầy đủ</Tag>;
                }
                const list = record.missingSkills.split(',');
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                        {list.map(s => (
                            <Tag color="volcano" key={s} style={{ margin: 0 }}>{s}</Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'Ngày gợi ý',
            dataIndex: 'updatedAt',
            sorter: true,
            width: 170,
            hideInSearch: true,
            render: (_, record) => (
                <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
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

    const getScoreColor = (score?: number) => {
        if (!score) return '#bfbfbf';
        return score >= 80 ? '#52c41a' : score >= 60 ? '#1890ff' : '#fa8c16';
    };

    return (
        <Access permission={ALL_PERMISSIONS.JOBS.GET_PAGINATE}>
            <div>
                <DataTable<ICvJobMatch>
                    actionRef={tableRef}
                    headerTitle="Lịch sử gợi ý ứng viên bằng AI"
                    rowKey="id"
                    columns={columns}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        const res = await callFetchCvJobMatches(query);
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
                            <ScheduleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Chi tiết báo cáo gợi ý AI
                        </span>
                    }
                    placement="right"
                    width="45vw"
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
                                <Descriptions.Item label="Công việc"><b>{selectedRecord.jobTitle}</b></Descriptions.Item>
                                <Descriptions.Item label="Công ty">{selectedRecord.companyName}</Descriptions.Item>
                                <Descriptions.Item label="Ứng viên"><b>{selectedRecord.candidateName}</b></Descriptions.Item>
                                <Descriptions.Item label="Tiêu đề CV">{selectedRecord.cvTitle}</Descriptions.Item>
                                <Descriptions.Item label="Độ phù hợp">
                                    <Tag color={getScoreColor(selectedRecord.matchScore)} style={{ fontWeight: 600 }}>
                                        {selectedRecord.matchScore}%
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian thực hiện">
                                    {dayjs(selectedRecord.updatedAt || selectedRecord.createdAt).format('DD-MM-YYYY HH:mm:ss')}
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '16px' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>Lý do phù hợp từ AI:</h4>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#595959' }}>
                                    {selectedRecord.matchReason || "Không có lý do chi tiết."}
                                </div>
                            </div>

                            {selectedRecord.missingSkills && (
                                <div style={{ background: '#fff2e8', border: '1px solid #ffd591', borderRadius: '8px', padding: '16px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#d4380d' }}>Kỹ năng còn thiếu hụt:</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {selectedRecord.missingSkills.split(',').map(s => (
                                            <Tag color="volcano" key={s} style={{ margin: 0 }}>{s}</Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Space>
                    )}
                </Drawer>
            </div>
        </Access>
    );
};

export default AiJobHistoryPage;
