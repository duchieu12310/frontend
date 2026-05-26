import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, Select, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callFetchCompany, callFetchRole, callUpdateUser, callFetchProvinces, callFetchDistricts, callFetchWards } from "@/config/api";
import { IUser, IProvince, IDistrict, IWard, IAddress } from "@/types/backend";
import { DebounceSelect } from "./debouce.select";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: IUser | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface ICompanySelect {
    label: string;
    value: string;
    key?: string;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    const [roles, setRoles] = useState<ICompanySelect[]>([]);
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [wards, setWards] = useState<IWard[]>([]);

    const [form] = Form.useForm();

    useEffect(() => {
        const initProvinces = async () => {
            const res = await callFetchProvinces();
            if (res && res.data) {
                setProvinces(res.data);
            }
        };
        if (openModal) {
            initProvinces();
        }
    }, [openModal]);

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

    useEffect(() => {
        const loadInitialAddress = async () => {
            if (dataInit?.id) {
                if (dataInit.company) {
                    setCompanies([{
                        label: dataInit.company.name,
                        value: dataInit.company.id,
                        key: dataInit.company.id,
                    }])
                }
                if (dataInit.role) {
                    setRoles([
                        {
                            label: dataInit.role?.name,
                            value: dataInit.role?.id,
                            key: dataInit.role?.id,
                        }
                    ])
                }
                form.setFieldsValue({
                    ...dataInit,
                    role: { label: dataInit.role?.name, value: dataInit.role?.id },
                    company: dataInit.company ? { label: dataInit.company?.name, value: dataInit.company?.id } : undefined,
                    provinceId: dataInit.address?.province?.id,
                    districtId: dataInit.address?.district?.id,
                    wardId: dataInit.address?.ward?.id,
                    detailAddress: dataInit.address?.line,
                });

                if (dataInit.address?.province?.id) {
                    const distRes = await callFetchDistricts(dataInit.address.province.id);
                    if (distRes && distRes.data) {
                        setDistricts(distRes.data);
                    }
                } else {
                    setDistricts([]);
                }
                if (dataInit.address?.district?.id) {
                    const wardRes = await callFetchWards(dataInit.address.district.id);
                    if (wardRes && wardRes.data) {
                        setWards(wardRes.data);
                    }
                } else {
                    setWards([]);
                }
            } else {
                form.resetFields();
                setDistricts([]);
                setWards([]);
            }
        };
        loadInitialAddress();
    }, [dataInit]);

    const submitUser = async (valuesForm: any) => {
        const { name, email, password, provinceId, districtId, wardId, detailAddress, age, gender, role, company } = valuesForm;
        
        const province = provinces.find(p => p.id === provinceId);
        const district = districts.find(d => d.id === districtId);
        const ward = wards.find(w => w.id === wardId);

        const address: IAddress = {
            id: dataInit?.address?.id,
            line: detailAddress,
            province: province ? { id: province.id, name: province.name, code: province.code } : undefined,
            district: district ? { id: district.id, name: district.name, code: district.code } : undefined,
            ward: ward ? { id: ward.id, name: ward.name, code: ward.code } : undefined
        };

        if (dataInit?.id) {
            //update
            const user = {
                id: dataInit.id,
                name,
                email,
                password,
                age,
                gender,
                address,
                role: { id: role.value, name: "" },
                company: company?.value ? {
                    id: company.value,
                    name: company.label
                } : null
            }

            const res = await callUpdateUser(user as IUser);
            if (res.data) {
                message.success("Cập nhật user thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const user = {
                name,
                email,
                password,
                age,
                gender,
                address,
                role: { id: role.value, name: "" },
                company: company?.value ? {
                    id: company.value,
                    name: company.label
                } : null
            }
            const res = await callCreateUser(user as IUser);
            if (res.data) {
                message.success("Thêm mới user thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setCompanies([]);
        setRoles([]);
        setDistricts([]);
        setWards([]);
        setOpenModal(false);
    }

    // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchCompany(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
    }

    async function fetchRoleList(name: string): Promise<ICompanySelect[]> {
        const res = await callFetchRole(`page=1&size=100&name=/${name}/i`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: item.id as string
                }
            })
            return temp;
        } else return [];
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật User" : "Tạo mới User"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitUser}
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    role: { label: dataInit.role?.name, value: dataInit.role?.id },
                    company: dataInit.company ? { label: dataInit.company?.name, value: dataInit.company?.id } : undefined,
                } : {}}

            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng không bỏ trống' },
                                { type: 'email', message: 'Vui lòng nhập email hợp lệ' }
                            ]}
                            placeholder="Nhập email"
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText.Password
                            disabled={dataInit?.id ? true : false}
                            label="Password"
                            name="password"
                            rules={[{ required: dataInit?.id ? false : true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập password"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Tên hiển thị"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên hiển thị"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            label="Tuổi"
                            name="age"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập nhập tuổi"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="gender"
                            label="Giới Tính"
                            valueEnum={{
                                MALE: 'Nam',
                                FEMALE: 'Nữ',
                                OTHER: 'Khác',
                            }}
                            placeholder="Chọn giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="role"
                            label="Vai trò"
                            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}

                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={roles}
                                value={roles}
                                placeholder="Chọn công vai trò"
                                fetchOptions={fetchRoleList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setRoles(newValue as ICompanySelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="company"
                            label="Thuộc Công Ty"
                            rules={[{ required: true, message: 'Vui lòng chọn company!' }]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={companies}
                                value={companies}
                                placeholder="Chọn công ty"
                                fetchOptions={fetchCompanyList}
                                onChange={(newValue: any) => {
                                    if (newValue?.length === 0 || newValue?.length === 1) {
                                        setCompanies(newValue as ICompanySelect[]);
                                    }
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
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
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
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
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
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
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Địa chỉ cụ thể"
                            name="detailAddress"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập số nhà, tên đường..."
                        />
                    </Col>
                </Row>
            </ModalForm >
        </>
    )
}

export default ModalUser;
