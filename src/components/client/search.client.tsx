import { Button, Form, Select, Input, notification } from 'antd';
import {
    EnvironmentOutlined,
    SearchOutlined,
    ThunderboltFilled,
    FileTextOutlined
} from '@ant-design/icons';
import { LOCATION_LIST, SKILLS_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './search.module.scss';
import { useTranslation } from 'react-i18next';

const SearchClient = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [searchParams] = useSearchParams();

    // Use SKILLS_LIST directly
    const optionsSkills = SKILLS_LIST;

    useEffect(() => {
        const queryLocation = searchParams.get('location');
        const queryName = searchParams.get('name');
        const querySkills = searchParams.get('skills');

        if (queryLocation) form.setFieldValue('location', queryLocation.split(','));
        if (queryName) form.setFieldValue('name', queryName);
        if (querySkills) form.setFieldValue('skills', querySkills.split(','));

    }, [searchParams]);

    const onFinish = async (values: any) => {
        let queryParts = [];

        if (values?.name) {
            queryParts.push(`name=${values.name}`);
        }
        if (values?.skills?.length) {
            queryParts.push(`skills=${values.skills.join(',')}`);
        }
        if (values?.location?.length) {
            queryParts.push(`location=${values.location.join(',')}`);
        }

        if (queryParts.length === 0) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng chọn tiêu chí để tìm kiếm',
            });
            return;
        }

        const query = queryParts.join('&');
        navigate(`/job?${query}`);
    };

    return (
        <div className={styles['search-wrapper']}>
            <div className={styles['search-layout']}>
                <div className={styles['search-left']}>
                    <div className={styles['search-container']}>
                        <ProForm
                            form={form}
                            onFinish={onFinish}
                            submitter={{ render: () => <></> }}
                            className={styles['search-form']}
                        >
                            <div className={styles['search-inputs']}>
                                <ProForm.Item name="name" className={styles['form-item-grow']}>
                                    <Input
                                        placeholder="Nhập vị trí muốn ứng tuyển"
                                        prefix={<SearchOutlined />}
                                        className={styles['custom-input']}
                                    />
                                </ProForm.Item>

                                <div className={styles['divider']} />

                                <ProForm.Item name="skills" className={styles['form-item-grow']}>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        placeholder="Ngôn ngữ"
                                        options={optionsSkills}
                                        className={styles['custom-select']}
                                        maxTagCount="responsive"
                                    />
                                </ProForm.Item>

                                <div className={styles['divider']} />

                                <ProForm.Item name="location" className={styles['form-item-grow']}>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        showSearch
                                        placeholder="Địa điểm"
                                        options={LOCATION_LIST}
                                        className={styles['custom-select']}
                                        maxTagCount="responsive"
                                    />
                                </ProForm.Item>

                                <ProForm.Item className={styles['search-btn-wrapper']}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SearchOutlined />}
                                        className={styles['search-btn']}
                                    >
                                        Tìm việc
                                    </Button>
                                </ProForm.Item>
                            </div>
                        </ProForm>
                    </div>

                    <div className={styles['quick-tags']}>
                        {['Việc làm Hà Nội', 'Việc làm TPHCM', 'Việc làm Marketing', 'Việc làm kế toán', 'Việc làm Bình Dương'].map((tag, index) => (
                            <span key={index} className={styles['tag']} onClick={() => navigate('/job')}>{tag}</span>
                        ))}
                    </div>
                </div>

                <div className={styles['search-right']}>
                    <div className={styles['action-btn']} onClick={() => navigate('/job')}>
                        <ThunderboltFilled style={{ color: '#ff6600' }} />
                        <span>Việc đi làm ngay</span>
                    </div>
                    <div className={styles['action-btn']} onClick={() => navigate('/job')}>
                        <FileTextOutlined style={{ color: '#2563eb' }} />
                        <span>Việc không cần CV</span>
                        <span className={styles['badge']}>Mới</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchClient;
