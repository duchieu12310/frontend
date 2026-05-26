import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Upload, Button, Form, Input, Select, Row, Col, notification } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { callUploadSingleFile, callCreateCompany, callFetchProvinces, callFetchDistricts, callFetchWards } from "@/config/api";
import { IProvince, IDistrict, IWard, IAddress, ICompany } from "@/types/backend";

const { Option } = Select;

const RegisterCompany = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [logoUrl, setLogoUrl] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // --- Division Data ---
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [wards, setWards] = useState<IWard[]>([]);

    useEffect(() => {
        const initProvinces = async () => {
            try {
                const res = await callFetchProvinces();
                if (res && res.data) {
                    setProvinces(res.data);
                }
            } catch (err) {
                message.error("Không thể tải danh sách tỉnh/thành!");
            }
        };
        initProvinces();
    }, []);

    const handleProvinceChange = async (provinceId: number) => {
        form.setFieldsValue({ districtId: undefined, wardId: undefined });
        setDistricts([]);
        setWards([]);
        try {
            const res = await callFetchDistricts(provinceId);
            if (res && res.data) {
                setDistricts(res.data);
            }
        } catch (err) {
            message.error("Không thể tải danh sách quận/huyện!");
        }
    };

    const handleDistrictChange = async (districtId: number) => {
        form.setFieldsValue({ wardId: undefined });
        setWards([]);
        try {
            const res = await callFetchWards(districtId);
            if (res && res.data) {
                setWards(res.data);
            }
        } catch (err) {
            message.error("Không thể tải danh sách phường/xã!");
        }
    };

    // --- Upload Handlers ---
    const handleUploadLogo = async (file: any) => {
        const res = await callUploadSingleFile(file, "company");
        if (res?.data?.fileName) {
            setLogoUrl(res.data.fileName);
            message.success("Tải logo thành công!");
        } else {
            message.error("Không thể tải logo!");
        }
        return false;
    };

    const handleUploadDocument = async (file: any) => {
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            message.error("Chỉ chấp nhận file PDF, DOC hoặc DOCX!");
            return false;
        }
        const res = await callUploadSingleFile(file, "company-documents");
        if (res?.data?.fileName) {
            setDocumentUrl(res.data.fileName);
            message.success("Tải tài liệu xác minh thành công!");
        } else {
            message.error("Không thể tải tài liệu!");
        }
        return false;
    };

    // --- Submit Handler ---
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const { companyName, description, taxCode, provinceId, districtId, wardId, detailAddress } = values;

            const province = provinces.find((p) => p.id === provinceId);
            const district = districts.find((d) => d.id === districtId);
            const ward = wards.find((w) => w.id === wardId);

            const address: IAddress = {
                line: detailAddress,
                province: province ? { id: province.id, name: province.name, code: province.code } : undefined,
                district: district ? { id: district.id, name: district.name, code: district.code } : undefined,
                ward: ward ? { id: ward.id, name: ward.name, code: ward.code } : undefined
            };

            const payload: ICompany = {
                name: companyName,
                description: description,
                taxCode: taxCode,
                address: address,
                logo: logoUrl,
                businessLicense: documentUrl,
                status: "PENDING"
            };

            const res = await callCreateCompany(payload);
            if (res?.data) {
                message.success("Gửi đăng ký công ty thành công! Vui lòng chờ duyệt.");
                navigate("/");
            } else {
                notification.error({
                    message: "Đăng ký thất bại",
                    description: res.message || "Có lỗi xảy ra"
                });
            }
        } catch (err: any) {
            console.error(err);
            notification.error({
                message: "Đăng ký thất bại",
                description: err?.response?.data?.message || "Vui lòng thử lại!"
            });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Tên công ty"
                    name="companyName"
                    rules={[{ required: true, message: "Vui lòng nhập tên công ty!" }]}
                >
                    <Input placeholder="VD: FPT Software" />
                </Form.Item>

                <Form.Item
                    label="Mã số thuế"
                    name="taxCode"
                    rules={[{ required: true, message: "Vui lòng nhập mã số thuế!" }]}
                >
                    <Input placeholder="VD: 0102030405" />
                </Form.Item>

                <Form.Item
                    label="Mô tả công ty"
                    name="description"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả công ty!" }]}
                >
                    <Input.TextArea rows={4} placeholder="Giới thiệu về công ty..." />
                </Form.Item>

                <Form.Item label="Địa chỉ (Tỉnh/Thành, Quận/Huyện, Phường/Xã)" required>
                    <Row gutter={10}>
                        <Col span={8}>
                            <Form.Item
                                name="provinceId"
                                rules={[{ required: true, message: "Chọn tỉnh / thành!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Tỉnh / Thành phố"
                                    onChange={handleProvinceChange}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={provinces.map((p) => ({
                                        label: p.name,
                                        value: p.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="districtId"
                                rules={[{ required: true, message: "Chọn quận / huyện!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Quận / Huyện"
                                    onChange={handleDistrictChange}
                                    showSearch
                                    disabled={!districts.length}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={districts.map((d) => ({
                                        label: d.name,
                                        value: d.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="wardId"
                                rules={[{ required: true, message: "Chọn phường / xã!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Phường / Xã"
                                    showSearch
                                    disabled={!wards.length}
                                    filterOption={(input, option) =>
                                        (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={wards.map((w) => ({
                                        label: w.name,
                                        value: w.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>

                <Form.Item
                    label="Địa chỉ cụ thể"
                    name="detailAddress"
                    rules={[{ required: true, message: "Nhập địa chỉ cụ thể (số nhà, đường...)" }]}
                >
                    <Input placeholder="VD: Số 17, Ngõ 34, Đường Trần Duy Hưng" />
                </Form.Item>

                <Form.Item label="Logo công ty">
                    <Upload beforeUpload={handleUploadLogo} showUploadList={false} accept="image/*">
                        <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
                    </Upload>
                    {logoUrl && (
                        <div className="mt-2">
                            <img src={logoUrl} alt="Company Logo" className="h-16 rounded-md border" />
                        </div>
                    )}
                </Form.Item>

                <Form.Item label="Tài liệu xác minh (PDF/DOC/DOCX)" required>
                    <Upload
                        beforeUpload={handleUploadDocument}
                        showUploadList={false}
                        accept=".pdf,.doc,.docx"
                    >
                        <Button icon={<UploadOutlined />}>Tải lên tài liệu</Button>
                    </Upload>
                    {documentUrl && (
                        <div className="mt-2">
                            📄{" "}
                            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                                Xem tài liệu đã tải lên
                            </a>
                        </div>
                    )}
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Gửi đăng ký doanh nghiệp
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterCompany;
