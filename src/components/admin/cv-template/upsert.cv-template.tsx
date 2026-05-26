import { Breadcrumb, ConfigProvider, Form, message, notification, Tabs } from "antd";
import type { TabsProps } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FooterToolbar, ProForm } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { useState, useEffect } from 'react';
import { callCreateCVTemplate, callUpdateCVTemplate, callFetchCVTemplateById } from "@/config/api";
import { CheckSquareOutlined } from "@ant-design/icons";
import viVN from 'antd/lib/locale/vi_VN';
import dayjs from 'dayjs';
import { ICVTemplate } from "@/types/backend";
import GeneralInfoSection from "./sections/general-info";
import EducationExperienceSection from "./sections/education-experience";
import SkillsLanguagesSection from "./sections/skills-languages";
import OtherInfoSection from "./sections/other-info";

const ViewUpsertCVTemplate = (props: any) => {
    const navigate = useNavigate();

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // cv template id
    const [dataUpdate, setDataUpdate] = useState<ICVTemplate | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            if (id) {
                const res = await callFetchCVTemplateById(Number(id));
                if (res && res.data) {
                    setDataUpdate(res.data);
                    const data = res.data;
                    form.setFieldsValue({
                        ...data,
                        personalInformations: data.personalInformations?.map(p => ({
                            ...p,
                            dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth) : undefined
                        })),
                        educations: data.educations?.map(e => ({
                            ...e,
                            startDate: e.startDate ? dayjs(e.startDate) : undefined,
                            endDate: e.endDate ? dayjs(e.endDate) : undefined
                        })),
                        workExperiences: data.workExperiences?.map(w => ({
                            ...w,
                            startDate: w.startDate ? dayjs(w.startDate) : undefined,
                            endDate: w.endDate ? dayjs(w.endDate) : undefined
                        })),
                        certifications: data.certifications?.map(c => ({
                            ...c,
                            issueDate: c.issueDate ? dayjs(c.issueDate) : undefined
                        })),
                    });
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id])

    const onFinish = async (valuesForm: any) => {
        const submitData = {
            ...valuesForm,
            personalInformations: valuesForm.personalInformations?.map((p: any) => ({
                ...p,
                dateOfBirth: p.dateOfBirth ? dayjs(p.dateOfBirth).format('YYYY-MM-DD') : null
            })),
            educations: valuesForm.educations?.map((e: any) => ({
                ...e,
                startDate: e.startDate ? dayjs(e.startDate).format('YYYY-MM-DD') : null,
                endDate: e.endDate ? dayjs(e.endDate).format('YYYY-MM-DD') : null
            })),
            workExperiences: valuesForm.workExperiences?.map((w: any) => ({
                ...w,
                startDate: w.startDate ? dayjs(w.startDate).format('YYYY-MM-DD') : null,
                endDate: w.endDate ? dayjs(w.endDate).format('YYYY-MM-DD') : null
            })),
            certifications: valuesForm.certifications?.map((c: any) => ({
                ...c,
                issueDate: c.issueDate ? dayjs(c.issueDate).format('YYYY-MM-DD') : null
            })),
        };

        if (dataUpdate?.id) {
            // update
            const res = await callUpdateCVTemplate({ ...submitData, id: dataUpdate.id });
            if (res.data) {
                message.success("Cập nhật CV Template thành công");
                navigate('/admin/cv-template')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            // create
            const res = await callCreateCVTemplate(submitData);
            if (res.data) {
                message.success("Tạo mới CV Template thành công");
                navigate('/admin/cv-template')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const tabItems: TabsProps['items'] = [
        {
            key: 'general',
            label: 'Thông tin chung',
            children: <GeneralInfoSection />,
        },
        {
            key: 'edu-exp',
            label: 'Học vấn & Kinh nghiệm',
            children: <EducationExperienceSection />,
        },
        {
            key: 'skills',
            label: 'Kỹ năng & Ngoại ngữ',
            children: <SkillsLanguagesSection />,
        },
        {
            key: 'other',
            label: 'Thông tin khác',
            children: <OtherInfoSection />,
        },
    ];

    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/cv-template">Manage CV Template</Link>,
                        },
                        {
                            title: 'Upsert CV Template',
                        },
                    ]}
                />
            </div>
            <div>
                <ConfigProvider locale={viVN}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{dataUpdate?.id ? "Cập nhật Mẫu CV" : "Tạo mới Mẫu CV"}</>
                                },
                                onReset: () => navigate('/admin/cv-template'),
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Tabs defaultActiveKey="general" items={tabItems} />
                    </ProForm>
                </ConfigProvider>
            </div>
        </div>
    )
}

export default ViewUpsertCVTemplate;
