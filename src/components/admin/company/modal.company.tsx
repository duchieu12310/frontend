import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea, ProFormList, ProForm } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, Select, message, notification } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateCompany, callUpdateCompany, callUploadSingleFile, callFetchProvinces, callFetchDistricts, callFetchWards } from "@/config/api";
import { ICompany, IProvince, IDistrict, IWard, IAddress } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICompany | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface ICompanyLogo {
    name: string;
    uid: string;
}

const ModalCompany = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [animation, setAnimation] = useState<string>('open');
    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<ICompanyLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
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
                form.setFieldsValue({
                    name: dataInit.name,
                    provinceId: dataInit.address?.province?.id,
                    districtId: dataInit.address?.district?.id,
                    wardId: dataInit.address?.ward?.id,
                    detailAddress: dataInit.address?.line,
                    companyDescriptions: dataInit.descriptions || []
                });
                setDataLogo([{
                    name: dataInit.logo,
                    uid: uuidv4(),
                }]);

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

    const isQuillEmpty = (content: string) => {
        if (!content) return true;
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();
        return cleanContent === '';
    };

    const submitCompany = async (valuesForm: any) => {
        console.log(">>> Submitting valuesForm:", valuesForm);
        const { name, provinceId, districtId, wardId, detailAddress, companyDescriptions } = valuesForm;

        if (dataLogo.length === 0) {
            message.error('Vui lòng tải lên ảnh Logo');
            return;
        }

        const arrDescriptions = companyDescriptions?.filter((item: any) => item?.content && !isQuillEmpty(item.content))?.map((item: any) => ({
            content: item.content,
            type: item.type || "HIGHLIGHT"
        })) || [];

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

        const companyPayload: ICompany = {
            name,
            address,
            logo: dataLogo[0].name,
            descriptions: arrDescriptions
        }

        if (dataInit?.id) {
            companyPayload.id = dataInit.id;
            const res = await callUpdateCompany(companyPayload);
            if (res.data) {
                message.success("Cập nhật công ty thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            const res = await callCreateCompany(companyPayload);
            if (res.data) {
                message.success("Thêm mới công ty thành công");
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
        setDistricts([]);
        setWards([]);
        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    }

    const handleRemoveFile = (file: any) => {
        setDataLogo([])
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ được phép tải file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi tải file.")
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res = await callUploadSingleFile(file, "company");
        if (res && res.data) {
            setDataLogo([{
                name: res.data.fileName,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataLogo([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    return (
        <>
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật công ty" : "Tạo mới công ty"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-company ${animation}`,
                            rootClassName: `modal-company-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitCompany}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên công ty"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên công ty"
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[{
                                        required: true,
                                        message: 'Vui lòng tải lên logo',
                                        validator: () => {
                                            if (dataLogo.length > 0) return Promise.resolve();
                                            else return Promise.reject(false);
                                        }
                                    }]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id ?
                                                    [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.logo ?? "",
                                                            status: 'done',
                                                            url: `${import.meta.env.VITE_BACKEND_URL}/storage/company/${dataInit?.logo}`,
                                                        }
                                                    ] : []
                                            }

                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Tải lên</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>

                            </Col>

                            <Col span={16}>
                                <Row gutter={16}>
                                    <Col span={12}>
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
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
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
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
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
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <ProFormText
                                            label="Địa chỉ cụ thể"
                                            name="detailAddress"
                                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                            placeholder="Nhập số nhà, tên đường..."
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col span={24}>
                                <div className="custom-pro-form-list-wrapper" style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16, marginBottom: 20, background: '#fafafa' }}>
                                    <ProFormList
                                        name="companyDescriptions"
                                        label="Đặc điểm nổi bật & Phúc lợi công ty"
                                        creatorButtonProps={{
                                            creatorButtonText: 'Thêm mô tả mới',
                                            style: { width: '100%', marginTop: 8 }
                                        }}
                                        min={0}
                                        copyIconProps={false}
                                    >
                                        <ProForm.Item
                                            name="content"
                                            rules={[{ required: true, message: 'Bắt buộc' }]}
                                        >
                                            <ReactQuill
                                                theme="snow"
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline', 'strike'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link', 'clean']
                                                    ]
                                                }}
                                            />
                                        </ProForm.Item>
                                    </ProFormList>
                                </div>
                            </Col>
                        </Row>
                    </ModalForm>
                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalCompany;
