import {
    Button,
    Col,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Table,
    Tabs,
    message,
    notification
} from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from "antd";
import { IResume, ISubscribers } from "@/types/backend";
import { useState, useEffect } from "react";
import {
    callCreateSubscriber,
    callFetchAllSkill,
    callFetchResumeByUser,
    callGetSubscriberSkills,
    callUpdateSubscriber,
    callChangePassword,

} from "@/config/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { MonitorOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
    open: boolean;
    onClose: (v: boolean) => void;
}

/** ------------------ Rải CV ------------------ */
const UserResume = () => {
    const [listCV, setListCV] = useState<IResume[]>([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            setIsFetching(true);
            const res = await callFetchResumeByUser();
            if (res && res.data) {
                setListCV(res.data.result as IResume[]);
            }
            setIsFetching(false);
        };
        init();
    }, []);

    const columns: ColumnsType<IResume> = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: "center",
            render: (text, record, index) => index + 1
        },
        {
            title: "Công Ty",
            dataIndex: "companyName"
        },
        {
            title: "Job title",
            dataIndex: ["job", "name"]
        },
        {
            title: "Trạng thái",
            dataIndex: "status"
        },
        {
            title: "Ngày rải CV",
            dataIndex: "createdAt",
            render(value, record) {
                return <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>;
            }
        },
        {
            title: "",
            dataIndex: "",
            render(value, record) {
                return (
                    <a
                        href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${record?.url}`}
                        target="_blank"
                    >
                        Chi tiết
                    </a>
                );
            }
        }
    ];

    return (
        <div>
            <Table<IResume>
                columns={columns}
                dataSource={listCV}
                loading={isFetching}
                pagination={false}
                rowKey={"id"}
            />
        </div>
    );
};


/** ------------------ Nhận Jobs qua Email ------------------ */
const JobByEmail = () => {
    const [form] = Form.useForm();
    const user = useAppSelector((state) => state.account.user);
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [subscriber, setSubscriber] = useState<ISubscribers | null>(null);

    useEffect(() => {
        const init = async () => {
            await fetchSkill();
            const res = await callGetSubscriberSkills();
            if (res && res.data) {
                setSubscriber(res.data);
                const d = res.data.skills;
                const arr = d.map((item: any) => ({
                    label: item.name as string,
                    value: item.id + "" as string
                }));
                form.setFieldValue("skills", arr);
            }
        };
        init();
    }, []);

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;
        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr =
                res?.data?.result?.map((item) => ({
                    label: item.name as string,
                    value: item.id + "" as string
                })) ?? [];
            setOptionsSkills(arr);
        }
    };

    const onFinish = async (values: any) => {
        const { skills } = values;
        const arr = skills?.map((item: any) => {
            if (item?.id) return { id: item.id };
            return { id: item };
        });

        if (!subscriber?.id) {
            const data = { email: user.email, name: user.name, skills: arr };
            const res = await callCreateSubscriber(data);
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res.message });
            }
        } else {
            const res = await callUpdateSubscriber({ id: subscriber?.id, skills: arr });
            if (res.data) {
                message.success("Cập nhật thông tin thành công");
                setSubscriber(res.data);
            } else {
                notification.error({ message: "Có lỗi xảy ra", description: res.message });
            }
        }
    };

    return (
        <Form onFinish={onFinish} form={form}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Form.Item
                        label={"Kỹ năng"}
                        name={"skills"}
                        rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 skill!" }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: "100%" }}
                            placeholder={
                                <>
                                    <MonitorOutlined /> Tìm theo kỹ năng...
                                </>
                            }
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" onClick={() => form.submit()}>
                        Cập nhật
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};
/** ------------------ Cập nhâp thông tin người dùng------------------ */
/** ------------------ Cập nhật thông tin người dùng ------------------ */
import { callFetchUser, callUpdateUser } from "@/config/api";
import { IUser } from "@/types/backend";

const { Option } = Select;

const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const user = useAppSelector((state) => state.account.user);
    const [loading, setLoading] = useState(false);

    // Lấy thông tin user hiện tại
    useEffect(() => {
        const init = async () => {
            try {
                // lấy user theo id
                const query = `id=${user?.id}`;
                const res = await callFetchUser(query);
                if (res && res.data) {
                    const current = res.data.result[0]; // vì callFetchUser trả về dạng paginate
                    form.setFieldsValue({
                        id: current.id,
                        email: current.email,
                        name: current.name,
                        gender: current.gender,
                        address: current.address,
                        age: current.age,
                    });
                }
            } catch (e: any) {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: e?.response?.data?.message || e.message,
                });
            }
        };
        if (user?.id) init();
    }, [user?.id]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await callUpdateUser(values as IUser);
            if (res && res.data) {
                message.success("Cập nhật thông tin thành công");
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Không thể cập nhật thông tin",
                });
            }
        } catch (e: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: e?.response?.data?.message || e.message,
            });
        }
        setLoading(false);
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={[20, 20]}>
                <Col span={12}>
                    <Form.Item name="id" hidden>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Họ và tên" name="name" rules={[{ required: true }]}>
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Giới tính" name="gender" rules={[{ required: true }]}>
                        <Select placeholder="Chọn giới tính">
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Tuổi" name="age">
                        <Input type="number" placeholder="Nhập tuổi" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item label="Địa chỉ" name="address">
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};


/** ------------------ Đổi mật khẩu ------------------ */
const UserChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        const { oldPassword, newPassword, confirmPassword } = values;
        if (newPassword !== confirmPassword) {
            return message.error("Mật khẩu mới và xác nhận không khớp");
        }
        setLoading(true);
        try {
            const res = await callChangePassword({ oldPassword, newPassword });

            if (res && res.statusCode === 200) {
                message.success(res.message || "Đổi mật khẩu thành công");
                form.resetFields();
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || "Không thể đổi mật khẩu"
                });
            }
        } catch (e: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: e?.response?.data?.message || e.message
            });
        }
        setLoading(false);
    };


    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                label="Mật khẩu hiện tại"
                name="oldPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới" },
                    { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        }
                    })
                ]}
            >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
            </Button>
        </Form>
    );
};

/** ------------------ Modal chính ------------------ */

const ManageAccount = (props: IProps) => {
    const { open, onClose } = props;

    const onChange = (key: string) => { };

    const items: TabsProps["items"] = [
        {
            key: "user-resume",
            label: `Rải CV`,
            children: <UserResume />
        },
        {
            key: "email-by-skills",
            label: `Nhận Jobs qua Email`,
            children: <JobByEmail />
        },
        {
            key: 'user-update-info',
            label: `Cập nhật thông tin`,
            children: <UserUpdateInfo />,
        },

        {
            key: "user-password",
            label: `Thay đổi mật khẩu`,
            children: <UserChangePassword />
        }
    ];

    return (
        <Modal
            title="Quản lý tài khoản"
            open={open}
            onCancel={() => onClose(false)}
            maskClosable={false}
            footer={null}
            destroyOnClose={true}
            width={isMobile ? "100%" : "1000px"}
        >
            <div style={{ minHeight: 400 }}>
                <Tabs defaultActiveKey="user-resume" items={items} onChange={onChange} />
            </div>
        </Modal>
    );
};

export default ManageAccount;
