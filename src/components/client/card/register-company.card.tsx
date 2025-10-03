import { useState } from "react";
import { Button, Col, Form, Input, Row, Upload, message, Spin } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "styles/client.module.scss";
import { callUploadSingleFile, callCreateCompany } from "@/config/api";

const RegisterCompany = () => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        try {
            setIsLoading(true);

            let logoFileName = "";
            if (fileList.length > 0) {
                const uploadRes = await callUploadSingleFile(fileList[0].originFileObj, "company");
                if (uploadRes && uploadRes.data) {
                    logoFileName = uploadRes.data.fileName;
                } else {
                    message.error("Upload logo thất bại");
                    setIsLoading(false);
                    return;
                }
            }

            const res = await callCreateCompany(
                values.name,
                values.address || "",
                values.description || "",
                logoFileName
            );

            if (res && res.data) {
                message.success("Đăng ký công ty thành công!");
                navigate("/company");
            } else {
                message.error("Đăng ký thất bại, vui lòng thử lại.");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi đăng ký công ty.");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ chỉ cho phép ảnh
    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Chỉ được upload file ảnh (jpg, png, jpeg, gif)");
        }
        return isImage || Upload.LIST_IGNORE;
    };

    // ✅ xem trước ảnh
    const onPreview = async (file: any) => {
        let src = file.url;
        if (!src) {
            src = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result as string);
            });
        }
        const img = new Image();
        img.src = src;
        const w = window.open(src);
        w?.document.write(img.outerHTML);
    };

    return (
        <div className={styles["company-section"]}>
            <Spin spinning={isLoading} tip="Đang xử lý...">
                <Row justify="center">
                    <Col xs={24} md={18}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{}}
                        >
                            <Row gutter={16}>
                                {/* Cột trái */}
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Tên công ty"
                                        name="name"
                                        rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                                    >
                                        <Input placeholder="Nhập tên công ty" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Email liên hệ"
                                        name="email"
                                        rules={[
                                            { required: true, message: "Vui lòng nhập email" },
                                            { type: "email", message: "Email không hợp lệ" },
                                        ]}
                                    >
                                        <Input placeholder="Nhập email liên hệ" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                    >
                                        <Input placeholder="Nhập số điện thoại liên hệ" />
                                    </Form.Item>
                                </Col>

                                {/* Cột phải */}
                                <Col xs={24} md={12}>
                                    <Form.Item label="Địa chỉ" name="address">
                                        <Input placeholder="Nhập địa chỉ công ty" />
                                    </Form.Item>

                                    <Form.Item label="Mô tả" name="description">
                                        <Input.TextArea rows={4} placeholder="Giới thiệu ngắn về công ty" />
                                    </Form.Item>

                                    <Form.Item label="Logo" name="logo">
                                        <Upload
                                            listType="picture-card"
                                            maxCount={1}
                                            fileList={fileList}
                                            beforeUpload={beforeUpload}
                                            onChange={({ fileList }) => setFileList(fileList)}
                                            onPreview={onPreview}
                                        >
                                            {fileList.length === 0 && (
                                                <div>
                                                    <PlusOutlined />
                                                    <div style={{ marginTop: 8 }}>Chọn logo</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Đăng ký
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default RegisterCompany;
