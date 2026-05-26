import { Col, Row } from "antd";
import { ProFormDatePicker, ProFormGroup, ProFormList, ProFormText, ProFormTextArea } from "@ant-design/pro-components";

const OtherInfoSection = () => {
    return (
        <>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="achievements"
                        label="Thành tựu"
                        creatorButtonProps={{ creatorButtonText: 'Thêm thành tựu' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="title" label="Tiêu đề" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormTextArea name="description" label="Mô tả" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="certifications"
                        label="Chứng chỉ"
                        creatorButtonProps={{ creatorButtonText: 'Thêm chứng chỉ' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="name" label="Tên chứng chỉ" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="organization" label="Tổ chức cấp" placeholder="Vui lòng nhập" />
                            <ProFormDatePicker name="issueDate" label="Ngày cấp" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="activities"
                        label="Hoạt động"
                        creatorButtonProps={{ creatorButtonText: 'Thêm hoạt động' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="activityName" label="Tên hoạt động" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="role" label="Vai trò" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="hobbies"
                        label="Sở thích"
                        creatorButtonProps={{ creatorButtonText: 'Thêm sở thích' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="hobby" label="Sở thích" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
        </>
    );
};

export default OtherInfoSection;
