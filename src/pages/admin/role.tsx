import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { IRole } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message, notification } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { callDeleteRole, callFetchPermission } from "@/config/api";
import queryString from 'query-string';
import { fetchRole } from "@/redux/slice/roleSlide";
import ModalRole from "@/components/admin/role/modal.role";
import { sfLike } from "spring-filter-query-builder";
import { groupByPermission } from "@/config/utils";

const RolePage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.role.isFetching);
    const meta = useAppSelector(state => state.role.meta);
    const roles = useAppSelector(state => state.role.result);
    const dispatch = useAppDispatch();

    // tất cả quyền từ backend (chỉ dùng để hiển thị trong ModalRole)
    const [listPermissions, setListPermissions] = useState<{
        module: string;
        permissions: any[]
    }[] | null>(null);

    // vai trò hiện tại
    const [singleRole, setSingleRole] = useState<IRole | null>(null);

    useEffect(() => {
        const init = async () => {
            const res = await callFetchPermission(`page=1&size=100`);
            if (res.data?.result) {
                setListPermissions(groupByPermission(res.data?.result));
            }
        };
        init();
    }, []);

    const handleDeleteRole = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteRole(id);
            if (res && res.statusCode === 200) {
                message.success('Xóa vai trò thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    };

    const reloadTable = () => {
        tableRef?.current?.reload();
    };

    const columns: ProColumns<IRole>[] = [
        {
            title: 'Mã',
            dataIndex: 'id',
            width: 250,
            render: (_, record) => <span>{record.id}</span>,
            hideInSearch: true,
        },
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            render(_, entity) {
                return (
                    <Tag color={entity.active ? "lime" : "red"}>
                        {entity.active ? "ĐANG HOẠT ĐỘNG" : "NGƯNG HOẠT ĐỘNG"}
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
            render: (_, record) => (
                <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
            ),
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (_, record) => (
                <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
            ),
            hideInSearch: true,
        },
        {
            title: 'Thao tác',
            hideInSearch: true,
            width: 80,
            render: (_value, entity) => (
                <Space>
                    <EditOutlined
                        style={{ fontSize: 20, color: '#ffa500', cursor: 'pointer' }}
                        onClick={() => {
                            setSingleRole(entity);
                            setOpenModal(true);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa vai trò"}
                        description={"Bạn có chắc chắn muốn xóa vai trò này?"}
                        onConfirm={() => handleDeleteRole(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <DeleteOutlined
                            style={{ fontSize: 20, color: '#ff4d4f', cursor: 'pointer' }}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const buildQuery = (params: any, sort: any) => {
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        };

        if (params.name) q.filter = `${sfLike("name", params.name)}`;

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);
        let sortBy = "";

        if (sort?.name) sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        else if (sort?.createdAt) sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
        else if (sort?.updatedAt) sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
        else sortBy = "sort=updatedAt,desc";

        temp = `${temp}&${sortBy}`;
        return temp;
    };

    return (
        <div>
            <DataTable<IRole>
                actionRef={tableRef}
                headerTitle="Danh sách Vai Trò"
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={roles}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchRole({ query }));
                }}
                scroll={{ x: true }}
                pagination={{
                    current: meta.page,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>{range[0]}-{range[1]} trên tổng {total} vai trò</div>
                    ),
                }}
                rowSelection={false}
                toolBarRender={() => (
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => setOpenModal(true)}
                    >
                        Thêm vai trò
                    </Button>
                )}
            />
            <ModalRole
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                listPermissions={listPermissions!}
                singleRole={singleRole}
                setSingleRole={setSingleRole}
            />
        </div>
    );
};

export default RolePage;
