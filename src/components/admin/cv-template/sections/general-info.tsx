import { Col, Row } from "antd";
import { ProFormDatePicker, ProFormGroup, ProFormList, ProFormText, ProFormTextArea } from "@ant-design/pro-components";

const GeneralInfoSection = () => {
    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24} md={8}>
                    <ProFormText
                        label="Tên CV"
                        name="title"
                        placeholder="Vui lòng nhập"
                        rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                    />
                    
                </Col>
            </Row>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', marginBottom: '15px' }}>Thông tin cá nhân</div>
                    <Row gutter={[20, 20]}>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "fullName"]} label="Họ tên" placeholder="Vui lòng nhập" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]} />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormDatePicker name={["personalInformations", 0, "dateOfBirth"]} label="Ngày sinh" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "phone"]} label="Số điện thoại" placeholder="Vui lòng nhập" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]} />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "email"]} label="Email" placeholder="Vui lòng nhập" rules={[{ required: true, message: 'Vui lòng nhập email' }]} />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "address"]} label="Địa chỉ" placeholder="Vui lòng nhập" />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "github"]} label="Github" placeholder="Vui lòng nhập" />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "linkedin"]} label="Linkedin" placeholder="Vui lòng nhập" />
                        </Col>
                        <Col span={24} md={6}>
                            <ProFormText name={["personalInformations", 0, "image"]} label="URL Ảnh" placeholder="Vui lòng nhập" />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="careerObjectives"
                        label="Mục tiêu nghề nghiệp"
                        creatorButtonProps={{ creatorButtonText: 'Thêm mục tiêu' }}
                    >
                        <ProFormGroup>
                            <ProFormTextArea name="content" label="Nội dung" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
        </>
    );
};

export default GeneralInfoSection;
