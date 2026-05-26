import { Col, Row } from "antd";
import { ProFormGroup, ProFormList, ProFormText } from "@ant-design/pro-components";

const SkillsLanguagesSection = () => {
    return (
        <>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="technicalSkills"
                        label="Kỹ năng chuyên môn"
                        creatorButtonProps={{ creatorButtonText: 'Thêm kỹ năng' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="skillName" label="Tên kỹ năng" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="level" label="Mức độ" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="softSkills"
                        label="Kỹ năng mềm"
                        creatorButtonProps={{ creatorButtonText: 'Thêm kỹ năng' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="skillName" label="Tên kỹ năng" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="languages"
                        label="Ngoại ngữ"
                        creatorButtonProps={{ creatorButtonText: 'Thêm ngoại ngữ' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="language" label="Tên ngoại ngữ" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="level" label="Trình độ" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
        </>
    );
};

export default SkillsLanguagesSection;
