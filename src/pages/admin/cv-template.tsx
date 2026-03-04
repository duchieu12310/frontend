import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCVTemplate } from "@/redux/slice/cvTemplateSlide";
import { ICVTemplate } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Image } from "antd";
import { useState, useRef } from 'react';
import queryString from 'query-string';
import { callDeleteCVTemplate } from "@/config/api";
import ModalCVTemplate from "@/components/admin/cv-template/modal.cv-template";
import { sfLike } from "spring-filter-query-builder";

const CVTemplatePage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ICVTemplate | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.cvTemplate.isFetching);
    const meta = useAppSelector(state => state.cvTemplate.meta);
    const templates = useAppSelector(state => state.cvTemplate.result);
    const dispatch = useAppDispatch();

    const handleDelete = async (id: string | number | undefined) => {
        if (id) {
            const res = await callDeleteCVTemplate(id);
            if (+res.statusCode === 200) {
                message.success('Xóa template thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<ICVTemplate>[] = [
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
            title: 'Tên Template',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Thumbnail',
            dataIndex: 'thumbnailUrl',
            hideInSearch: true,
            render: (text, record) => {
                return (
                    <Image
                        width={100}
                        src={record.thumbnailUrl}
                    />
                )
            }
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 50,
            render: (_value, entity) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa template"}
                        description={"Bạn có chắc chắn muốn xóa template này ?"}
                        onConfirm={() => handleDelete(entity.id)}
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
                </Space >
            ),
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        const clone = { ...params };
        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;

        if (!q.filter) delete q.filter;
        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }

        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=id,desc`;
        } else {
            temp = `${temp}&${sortBy}`;
        }

        return temp;
    }

    return (
        <div>
            <DataTable<ICVTemplate>
                actionRef={tableRef}
                headerTitle="Danh sách CV Template"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={templates}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchCVTemplate({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: meta.page,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        total: meta.total,
                        showTotal: (total, range) => {
                            return (<div>{range[0]}-{range[1]} trên {total} bản ghi</div>)
                        }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            Thêm mới
                        </Button>
                    );
                }}
            />
            <ModalCVTemplate
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default CVTemplatePage;
