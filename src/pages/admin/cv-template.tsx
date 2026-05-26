import DataTable from "@/components/client/data-table";
import { ICVTemplate } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message } from "antd";
import { useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteCVTemplate } from "@/config/api";
import queryString from 'query-string';
import { useNavigate } from "react-router-dom";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";

const CVTemplatePage = () => {
    const navigate = useNavigate();
    const tableRef = useRef<ActionType>();

    const handleDeleteCVTemplate = async (id: number | undefined) => {
        if (id) {
            const res = await callDeleteCVTemplate(id);
            if (res && res.data) {
                message.success('Xóa Mẫu CV thành công');
                reloadTable();
            } else {
                message.error('Có lỗi xảy ra');
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<ICVTemplate>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <span>
                        {record.id}
                    </span>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            sorter: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
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
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Actions',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            navigate(`/admin/cv-template/upsert?id=${entity.id}`);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa mẫu CV"}
                        description={"Bạn có chắc chắn muốn xóa mẫu CV này ?"}
                        onConfirm={() => handleDeleteCVTemplate(entity.id)}
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
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.title) clone.title = `/${clone.title}/i`;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.title) {
            sortBy = sort.title === 'ascend' ? "sort=title,asc" : "sort=title,desc";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        }

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=updatedAt,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <Access permission={ALL_PERMISSIONS.CV_TEMPLATES.GET_PAGINATE}>
            <div>
                <DataTable<ICVTemplate>
                    actionRef={tableRef}
                    headerTitle="Danh sách Mẫu CV"
                    rowKey="id"
                    columns={columns}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        // Fetch directly from API
                        const { callFetchCVTemplates } = await import('@/config/api');
                        const res = await callFetchCVTemplates(query);
                        if (res && res.data) {
                            return {
                                data: res.data.result,
                                success: true,
                                total: res.data.meta.total
                            }
                        }
                        return {
                            data: [],
                            success: false,
                            total: 0
                        }
                    }}
                    toolBarRender={() => [
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => navigate('/admin/cv-template/upsert')}
                        >
                            Thêm mới
                        </Button>
                    ]}
                />
            </div>
        </Access>
    )
}

export default CVTemplatePage;
