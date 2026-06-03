import { useState, useEffect } from 'react';
import { Table, Button, Space, notification, Popconfirm, Modal, Form, Input, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ISubscriptionPackage } from '@/types/backend';
import { callFetchPackages, callCreatePackage, callUpdatePackage, callDeletePackage } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';

const SubscriptionPackagePage = () => {
    const user = useAppSelector(state => state.account.user);
    const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    if (user?.role?.name !== 'SUPER_ADMIN' && user?.role?.name !== 'ADMIN') {
        return <div style={{ padding: '24px' }}>Bạn không có quyền truy cập trang này.</div>;
    }

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await callFetchPackages();
            if (res && res.data) {
                setPackages(res.data);
            } else if (Array.isArray(res)) {
                setPackages(res as any);
            }
        } catch (error) {
            notification.error({ message: "Lỗi tải dữ liệu", description: "Không thể lấy danh sách gói cước." });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const showCreateModal = () => {
        setIsEditing(false);
        form.resetFields();
        // default values
        form.setFieldsValue({
            price: 0,
            durationDays: 30,
            jobLimit: 15,
            jobDurationLimit: 30,
            hasAiSuggestCandidates: false,
            hasAiEvaluateResume: false,
            hasAiEvaluateCv: false
        });
        setIsModalVisible(true);
    };

    const showEditModal = (record: ISubscriptionPackage) => {
        setIsEditing(true);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await callDeletePackage(id);
            notification.success({ message: "Xóa thành công", description: "Gói cước đã được xóa." });
            fetchPackages();
        } catch (error) {
            notification.error({ message: "Lỗi", description: "Không thể xóa gói cước." });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (isEditing) {
                await callUpdatePackage(values);
                notification.success({ message: "Cập nhật thành công" });
            } else {
                await callCreatePackage(values);
                notification.success({ message: "Tạo thành công" });
            }
            setIsModalVisible(false);
            fetchPackages();
        } catch (error: any) {
            notification.error({ message: "Lỗi", description: "Vui lòng kiểm tra lại thông tin." });
        }
    };

    const columns = [
        {
            title: 'Tên Gói',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá tiền (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
        },
        {
            title: 'Thời hạn (ngày)',
            dataIndex: 'durationDays',
            key: 'durationDays',
        },
        {
            title: 'Job Limit',
            dataIndex: 'jobLimit',
            key: 'jobLimit',
        },
        {
            title: 'Job Duration Limit',
            dataIndex: 'jobDurationLimit',
            key: 'jobDurationLimit',
        },
        {
            title: 'Gợi ý ƯV AI',
            dataIndex: 'hasAiSuggestCandidates',
            key: 'hasAiSuggestCandidates',
            render: (val: boolean) => val ? <span style={{ color: 'green' }}>Có</span> : <span style={{ color: 'red' }}>Không</span>,
        },
        {
            title: 'Đánh giá CV AI (Công ty)',
            dataIndex: 'hasAiEvaluateResume',
            key: 'hasAiEvaluateResume',
            render: (val: boolean) => val ? <span style={{ color: 'green' }}>Có</span> : <span style={{ color: 'red' }}>Không</span>,
        },
        {
            title: 'Chấm điểm CV AI (Public)',
            dataIndex: 'hasAiEvaluateCv',
            key: 'hasAiEvaluateCv',
            render: (val: boolean) => val ? <span style={{ color: 'green' }}>Có</span> : <span style={{ color: 'red' }}>Không</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: ISubscriptionPackage) => (
                <Space size="middle">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => showEditModal(record)}>Sửa</Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa gói này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Quản lý Gói Dịch Vụ</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                    Thêm Gói Mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={packages} 
                rowKey="id" 
                loading={loading}
                pagination={false}
            />

            <Modal 
                title={isEditing ? "Cập nhật gói dịch vụ" : "Thêm gói dịch vụ mới"} 
                open={isModalVisible} 
                onOk={handleOk} 
                onCancel={() => setIsModalVisible(false)}
                okText={isEditing ? "Cập nhật" : "Tạo mới"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    {isEditing && <Form.Item name="id" hidden><Input /></Form.Item>}
                    <Form.Item name="name" label="Tên Gói" rules={[{ required: true, message: 'Vui lòng nhập tên gói' }]}>
                        <Input placeholder="Ví dụ: Gói Cơ Bản" />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả" rules={[{ required: true }]}>
                        <Input.TextArea placeholder="Mô tả gói cước..." />
                    </Form.Item>
                    <Form.Item name="price" label="Giá tiền (VNĐ)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="durationDays" label="Thời hạn gói (ngày)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item name="jobLimit" label="Số lượng Job tối đa" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    <Form.Item name="jobDurationLimit" label="Số ngày hiển thị Job tối đa (job-duration-limit)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                    
                    <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>Mở khóa Tính Năng AI:</div>
                    <Form.Item name="hasAiSuggestCandidates" label="Gợi ý Ứng viên (/suggest-candidates)" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="hasAiEvaluateResume" label="Đánh giá Resume (/evaluate-resume)" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="hasAiEvaluateCv" label="Đánh giá CV (/evaluate-cv)" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SubscriptionPackagePage;
