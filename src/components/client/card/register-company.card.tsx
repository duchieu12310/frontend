import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Upload, Button, Form, Input, Select, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { callUploadSingleFile, callCreateCompanyRegistration } from "@/config/api";

const RegisterCompany = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [logoUrl, setLogoUrl] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [loading, setLoading] = useState(false);

    // --- Dữ liệu hành chính Việt Nam ---
    const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
    const [districts, setDistricts] = useState<{ code: number; name: string }[]>([]);
    const [wards, setWards] = useState<{ code: number; name: string }[]>([]);

    // 🗺️ Lấy danh sách tỉnh / thành phố khi mở trang
    useEffect(() => {
        fetch("https://provinces.open-api.vn/api/?depth=1")
            .then((res) => res.json())
            .then((data) => setProvinces(data))
            .catch(() => message.error("Không thể tải danh sách tỉnh/thành!"));
    }, []);

    // 🏙️ Khi chọn tỉnh → tải danh sách quận / huyện
    const handleProvinceChange = (provinceCode: number) => {
        form.setFieldsValue({ district: undefined, ward: undefined });
        setDistricts([]);
        setWards([]);

        fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
            .then((res) => res.json())
            .then((data) => setDistricts(data.districts || []))
            .catch(() => message.error("Không thể tải danh sách quận/huyện!"));
    };

    // 🏘️ Khi chọn quận → tải danh sách phường / xã
    const handleDistrictChange = (districtCode: number) => {
        form.setFieldsValue({ ward: undefined });
        setWards([]);

        fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
            .then((res) => res.json())
            .then((data) => setWards(data.wards || []))
            .catch(() => message.error("Không thể tải danh sách phường/xã!"));
    };

    // 🖼️ Upload logo công ty
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

    // 📄 Upload tài liệu xác minh (pdf/doc/docx)
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

    // 📨 Gửi form đăng ký công ty
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const provinceName = provinces.find((p) => p.code === values.province)?.name || "";
            const districtName = districts.find((d) => d.code === values.district)?.name || "";
            const wardName = wards.find((w) => w.code === values.ward)?.name || "";

            const fullAddress = [
                values.detailAddress,
                wardName,
                districtName,
                provinceName,
            ]
                .filter(Boolean)
                .join(", ");

            const payload = {
                companyName: values.companyName,
                description: values.description,
                address: fullAddress,
                logo: logoUrl,
                facebookLink: values.facebookLink || "",
                githubLink: values.githubLink || "",
                verificationDocument: documentUrl,
            };

            const res = await callCreateCompanyRegistration(payload);
            if (res?.data) {
                message.success("Gửi đăng ký công ty thành công! Vui lòng chờ duyệt.");
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            message.error("Đăng ký thất bại. Vui lòng thử lại!");
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
                    label="Mô tả"
                    name="description"
                    rules={[{ required: true, message: "Vui lòng nhập mô tả công ty!" }]}
                >
                    <Input.TextArea rows={4} placeholder="Giới thiệu về công ty..." />
                </Form.Item>

                {/* --- Gộp Tỉnh / Huyện / Xã trên cùng 1 dòng --- */}
                <Form.Item label="Địa chỉ (Tỉnh/Thành, Quận/Huyện, Phường/Xã)" required>
                    <Row gutter={10}>
                        <Col span={8}>
                            <Form.Item
                                name="province"
                                rules={[{ required: true, message: "Chọn tỉnh / thành!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Tỉnh / Thành phố"
                                    onChange={handleProvinceChange}
                                    showSearch
                                    optionFilterProp="label"
                                    options={provinces.map((p) => ({
                                        label: p.name,
                                        value: p.code,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="district"
                                rules={[{ required: true, message: "Chọn quận / huyện!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Quận / Huyện"
                                    onChange={handleDistrictChange}
                                    showSearch
                                    disabled={!districts.length}
                                    optionFilterProp="label"
                                    options={districts.map((d) => ({
                                        label: d.name,
                                        value: d.code,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="ward"
                                rules={[{ required: true, message: "Chọn phường / xã!" }]}
                                noStyle
                            >
                                <Select
                                    placeholder="Phường / Xã"
                                    showSearch
                                    disabled={!wards.length}
                                    optionFilterProp="label"
                                    options={wards.map((w) => ({
                                        label: w.name,
                                        value: w.code,
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

                <Form.Item
                    label="Facebook"
                    name="facebookLink"
                    rules={[{ type: "url", message: "Vui lòng nhập link hợp lệ!" }]}
                >
                    <Input placeholder="https://facebook.com/company" />
                </Form.Item>

                <Form.Item
                    label="GitHub"
                    name="githubLink"
                    rules={[{ type: "url", message: "Vui lòng nhập link hợp lệ!" }]}
                >
                    <Input placeholder="https://github.com/company" />
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

                <Form.Item label="Tài liệu xác minh (PDF/DOC/DOCX)">
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
                                Xem tài liệu
                            </a>
                        </div>
                    )}
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Gửi đăng ký
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterCompany;
