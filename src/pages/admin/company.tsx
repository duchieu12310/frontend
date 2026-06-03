import ModalCompany from "@/components/admin/company/modal.company";
import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCompany } from "@/redux/slice/companySlide";
import { ICompany } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined, CreditCardOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Modal, Table } from "antd";
import { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { callDeleteCompany, callFetchPaidOrdersByCompany } from "@/config/api";
import queryString from 'query-string';
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";
import ModalAllOrders from "@/components/admin/payment/modal.all-orders";

const CompanyPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<ICompany | null>(null);

    const [openPackagesModal, setOpenPackagesModal] = useState<boolean>(false);
    const [selectedCompanyForPackages, setSelectedCompanyForPackages] = useState<ICompany | null>(null);
    const [companyOrders, setCompanyOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

    const [openAllOrdersModal, setOpenAllOrdersModal] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.company.isFetching);
    const meta = useAppSelector(state => state.company.meta);
    const companies = useAppSelector(state => state.company.result);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchOrders = async () => {
            if (selectedCompanyForPackages?.id && openPackagesModal) {
                setLoadingOrders(true);
                try {
                    const res = await callFetchPaidOrdersByCompany(selectedCompanyForPackages.id);
                    if (res && res.data) {
                        setCompanyOrders(res.data);
                    }
                } catch (error) {
                    console.error("Error fetching company paid orders:", error);
                } finally {
                    setLoadingOrders(false);
                }
            }
        };
        fetchOrders();
    }, [selectedCompanyForPackages, openPackagesModal]);

    const handleDeleteCompany = async (id: string | undefined) => {
        if (id) {
            const res = await callDeleteCompany(id);
            if (res && +res.statusCode === 200) {
                message.success('Xóa công ty thành công');
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

    const columns: ProColumns<ICompany>[] = [
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
            title: 'Tên công ty',
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            sorter: true,
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record) => {
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
            render: (text, record) => {
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
                    <Access
                        permission={ALL_PERMISSIONS.COMPANIES.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access >
                    <CreditCardOutlined
                        style={{
                            fontSize: 20,
                            color: '#1677ff',
                            cursor: 'pointer'
                        }}
                        title="Xem gói đã đăng ký & thanh toán"
                        onClick={() => {
                            setSelectedCompanyForPackages(entity);
                            setOpenPackagesModal(true);
                        }}
                    />
                    <Access
                        permission={ALL_PERMISSIONS.COMPANIES.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa công ty"}
                            description={"Bạn có chắc chắn muốn xóa công ty này không?"}
                            onConfirm={() => handleDeleteCompany(entity.id)}
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
                </Space >
            ),

        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        const q: any = {
            page: params.current,
            size: params.pageSize,
            filter: ""
        }

        if (clone.name) q.filter = `${sfLike("name", clone.name)}`;
        if (clone.address) {
            q.filter = clone.name ?
                q.filter + " and " + `${sfLike("address", clone.address)}`
                : `${sfLike("address", clone.address)}`;
        }

        if (!q.filter) delete q.filter;

        let temp = queryString.stringify(q);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name,asc" : "sort=name,desc";
        }
        if (sort && sort.address) {
            sortBy = sort.address === 'ascend' ? "sort=address,asc" : "sort=address,desc";
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
        <div>
            <Access
                permission={ALL_PERMISSIONS.COMPANIES.GET_PAGINATE}
            >
                <DataTable<ICompany>
                    actionRef={tableRef}
                    headerTitle="Danh sách công ty"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={companies}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchCompany({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} bản ghi</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <Space>
                                <Button
                                    icon={<CreditCardOutlined />}
                                    type="default"
                                    onClick={() => setOpenAllOrdersModal(true)}
                                >
                                    Các gói đã đăng ký
                                </Button>
                                <Access
                                    permission={ALL_PERMISSIONS.COMPANIES.CREATE}
                                    hideChildren
                                >
                                    <Button
                                        icon={<PlusOutlined />}
                                        type="primary"
                                        onClick={() => setOpenModal(true)}
                                    >
                                        Thêm mới
                                    </Button>
                                </Access>
                            </Space>
                        );
                    }}
                />
            </Access>
            <ModalCompany
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <Modal
                title={`Lịch sử gói cước & thanh toán - ${selectedCompanyForPackages?.name}`}
                open={openPackagesModal}
                onCancel={() => {
                    setOpenPackagesModal(false);
                    setSelectedCompanyForPackages(null);
                    setCompanyOrders([]);
                }}
                footer={null}
                width={800}
            >
                <Table
                    loading={loadingOrders}
                    dataSource={companyOrders}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                        {
                            title: 'Mã GD',
                            dataIndex: 'paymentCode',
                            key: 'paymentCode',
                        },
                        {
                            title: 'Tên Gói / Mua lẻ',
                            key: 'packageName',
                            render: (_, record) => {
                                return record.subscriptionPackage 
                                    ? record.subscriptionPackage.name 
                                    : "Mua lẻ giới hạn";
                            }
                        },
                        {
                            title: 'Bài đăng tuyển dụng',
                            key: 'jobLimit',
                            render: (_, record) => {
                                const val = record.subscriptionPackage 
                                    ? record.subscriptionPackage.jobLimit 
                                    : record.jobLimit;
                                return val > 0 ? `+${val}` : '0';
                            }
                        },
                        {
                            title: 'Hạn hiển thị (ngày)',
                            key: 'jobDurationLimit',
                            render: (_, record) => {
                                const val = record.subscriptionPackage 
                                    ? record.subscriptionPackage.jobDurationLimit 
                                    : record.jobDurationLimit;
                                return val > 0 ? `${val} ngày` : '0';
                            }
                        },
                        {
                            title: 'Số tiền thanh toán',
                            dataIndex: 'amount',
                            key: 'amount',
                            render: (amount) => {
                                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
                            }
                        },
                        {
                            title: 'Ngày thanh toán',
                            dataIndex: 'createdAt',
                            key: 'createdAt',
                            render: (date) => date ? dayjs(date).format('DD-MM-YYYY HH:mm:ss') : ''
                        }
                    ]}
                />
            </Modal>
            <ModalAllOrders
                open={openAllOrdersModal}
                onClose={() => setOpenAllOrdersModal(false)}
            />
        </div >
    )
}

export default CompanyPage;
