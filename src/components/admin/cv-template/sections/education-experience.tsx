import { Col, Row } from "antd";
import { ProFormDatePicker, ProFormGroup, ProFormList, ProFormText, ProFormTextArea } from "@ant-design/pro-components";

const EducationExperienceSection = () => {
    return (
        <>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', marginBottom: '15px' }}>Học vấn</div>
                    <Row gutter={[20, 20]}>
                        <Col span={24} md={5}>
                            <ProFormText name={["educations", 0, "schoolName"]} label="Tên trường" placeholder="Vui lòng nhập" rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]} />
                        </Col>
                        <Col span={24} md={5}>
                            <ProFormText name={["educations", 0, "major"]} label="Chuyên ngành" placeholder="Vui lòng nhập" rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]} />
                        </Col>
                        <Col span={24} md={5}>
                            <ProFormDatePicker name={["educations", 0, "startDate"]} label="Từ ngày" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                        </Col>
                        <Col span={24} md={5}>
                            <ProFormDatePicker name={["educations", 0, "endDate"]} label="Đến ngày" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                        </Col>
                        <Col span={24} md={4}>
                            <ProFormText name={["educations", 0, "gpa"]} label="GPA" placeholder="Vui lòng nhập" />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[20, 20]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="workExperiences"
                        label="Kinh nghiệm làm việc"
                        creatorButtonProps={{ creatorButtonText: 'Thêm kinh nghiệm' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="company" label="Công ty" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="position" label="Vị trí" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormDatePicker name="startDate" label="Từ ngày" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                            <ProFormDatePicker name="endDate" label="Đến ngày" placeholder="Vui lòng chọn" fieldProps={{ style: { width: '100%' } }} />
                            <ProFormTextArea name="description" label="Mô tả" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <ProFormList copyIconProps={{ tooltipText: 'Sao chép' }} deleteIconProps={{ tooltipText: 'Xóa' }}
                        name="projects"
                        label="Dự án cá nhân"
                        creatorButtonProps={{ creatorButtonText: 'Thêm dự án' }}
                    >
                        <ProFormGroup>
                            <ProFormText name="projectName" label="Tên dự án" placeholder="Vui lòng nhập" rules={[{ required: true }]} />
                            <ProFormText name="technologies" label="Công nghệ sử dụng" placeholder="Vui lòng nhập" />
                            <ProFormTextArea name="description" label="Mô tả" placeholder="Vui lòng nhập" />
                            <ProFormText name="githubLink" label="Github Link" placeholder="Vui lòng nhập" />
                        </ProFormGroup>
                    </ProFormList>
                </Col>
            </Row>
        </>
    );
};

export default EducationExperienceSection;
