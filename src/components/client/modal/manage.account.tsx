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
import { IResume, ISubscribers, IProvince, IDistrict, IWard, IAddress, IUser } from "@/types/backend";
import { useState, useEffect } from "react";
import {
    callCreateSubscriber,
    callFetchAllSkill,
    callFetchResumeByUser,
    callGetSubscriberSkills,
    callUpdateSubscriber,
    callChangePassword,
    callFetchProvinces,
    callFetchDistricts,
    callFetchWards,
    callFetchUser,
    callUpdateUser
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
/** ------------------ Cập nhật thông tin người dùng ------------------ */

const { Option } = Select;

const UserUpdateInfo = () => {
    const [form] = Form.useForm();
    const user = useAppSelector((state) => state.account.user);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [wards, setWards] = useState<IWard[]>([]);

    useEffect(() => {
        const initProvinces = async () => {
            const res = await callFetchProvinces();
            if (res && res.data) {
                setProvinces(res.data);
            }
        };
        initProvinces();
    }, []);

    const handleProvinceChange = async (provinceId: number) => {
        form.setFieldsValue({ districtId: undefined, wardId: undefined });
        setDistricts([]);
        setWards([]);
        const res = await callFetchDistricts(provinceId);
        if (res && res.data) {
            setDistricts(res.data);
        }
    };

    const handleDistrictChange = async (districtId: number) => {
        form.setFieldsValue({ wardId: undefined });
        setWards([]);
        const res = await callFetchWards(districtId);
        if (res && res.data) {
            setWards(res.data);
        }
    };

    // Lấy thông tin user hiện tại
    useEffect(() => {
        const init = async () => {
            try {
                const query = `id=${user?.id}`;
                const res = await callFetchUser(query);
                if (res && res.data) {
                    const current = res.data.result[0] as IUser;
                    setCurrentUser(current);
                    
                    form.setFieldsValue({
                        id: current.id,
                        email: current.email,
                        name: current.name,
                        gender: current.gender,
                        age: current.age,
                        provinceId: current.address?.province?.id,
                        districtId: current.address?.district?.id,
                        wardId: current.address?.ward?.id,
                        detailAddress: current.address?.line,
                    });

                    if (current.address?.province?.id) {
                        const distRes = await callFetchDistricts(current.address.province.id);
                        if (distRes && distRes.data) {
                            setDistricts(distRes.data);
                        }
                    }
                    if (current.address?.district?.id) {
                        const wardRes = await callFetchWards(current.address.district.id);
                        if (wardRes && wardRes.data) {
                            setWards(wardRes.data);
                        }
                    }
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
        const { id, name, email, gender, age, provinceId, districtId, wardId, detailAddress } = values;
        
        const province = provinces.find(p => p.id === provinceId);
        const district = districts.find(d => d.id === districtId);
        const ward = wards.find(w => w.id === wardId);

        const address: IAddress = {
            id: currentUser?.address?.id,
            line: detailAddress,
            province: province ? { id: province.id, name: province.name, code: province.code } : undefined,
            district: district ? { id: district.id, name: district.name, code: district.code } : undefined,
            ward: ward ? { id: ward.id, name: ward.name, code: ward.code } : undefined
        };

        setLoading(true);
        try {
            const res = await callUpdateUser({ id, name, email, gender, age, address } as IUser);
            if (res && res.data) {
                message.success("Cập nhật thông tin thành công");
                if (res.data.address) {
                    setCurrentUser(prev => prev ? { ...prev, address: res.data.address } : null);
                }
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
                
                <Col span={8}>
                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="provinceId"
                        rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                    >
                        <Select
                            placeholder="Chọn Tỉnh/Thành phố"
                            onChange={handleProvinceChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            options={provinces.map(p => ({ label: p.name, value: p.id }))}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Quận/Huyện"
                        name="districtId"
                        rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                    >
                        <Select
                            placeholder="Chọn Quận/Huyện"
                            onChange={handleDistrictChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            options={districts.map(d => ({ label: d.name, value: d.id }))}
                            disabled={!districts.length}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="Phường/Xã"
                        name="wardId"
                        rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                    >
                        <Select
                            placeholder="Chọn Phường/Xã"
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            options={wards.map(w => ({ label: w.name, value: w.id }))}
                            disabled={!wards.length}
                        />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item
                        label="Địa chỉ cụ thể (Số nhà, đường...)"
                        name="detailAddress"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                    >
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
