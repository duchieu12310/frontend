import { Button, Col, Form, Row, Select, notification } from 'antd';
import {
    EnvironmentOutlined,
    MonitorOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const SearchClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (location.search) {
            const queryLocation = searchParams.get('location');
            const querySkills = searchParams.get('skills');
            if (queryLocation) form.setFieldValue('location', queryLocation.split(','));
            if (querySkills) form.setFieldValue('skills', querySkills.split(','));
        }
    }, [location.search]);

    useEffect(() => {
        fetchSkill();
    }, []);

    const fetchSkill = async () => {
        const query = `page=1&size=100&sort=createdAt,desc`;
        const res = await callFetchAllSkill(query);
        if (res?.data) {
            const arr =
                res?.data?.result?.map((item: any) => ({
                    label: item.name as string,
                    value: item.id + '' as string,
                })) ?? [];
            setOptionsSkills(arr);
        }
    };

    const onFinish = (values: any) => {
        let query = '';
        if (values?.location?.length) {
            query = `location=${values.location.join(',')}`;
        }
        if (values?.skills?.length) {
            query += query ? `&skills=${values.skills.join(',')}` : `skills=${values.skills.join(',')}`;
        }

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Vui lòng chọn tiêu chí để tìm kiếm',
            });
            return;
        }
        navigate(`/job?${query}`);
    };

    return (
        <>

            {/* 🔍 SEARCH SECTION */}
            <div
                className="search-bar-container"
                style={{
                    backgroundColor: '#00B074',
                    padding: '30px 20px',
                    borderRadius: '0',
                    textAlign: 'center',
                    marginTop: '-60px',
                    position: 'relative',
                    zIndex: 5,
                }}
            >
                <div
                    className="container"
                    style={{
                        maxWidth: 1100,
                        margin: '0 auto',
                    }}
                >
                    <ProForm form={form} onFinish={onFinish} submitter={{ render: () => <></> }}>
                        <Row gutter={[16, 16]} align="middle" justify="center">
                            <Col xs={24} md={8}>
                                <ProForm.Item name="skills">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%', height: 45, borderRadius: 8 }}
                                        placeholder={
                                            <>
                                                <MonitorOutlined style={{ marginRight: 8 }} />
                                                Keyword / Skill
                                            </>
                                        }
                                        options={optionsSkills}
                                        optionLabelProp="label"
                                    />
                                </ProForm.Item>
                            </Col>
                            <Col xs={12} md={8}>
                                <ProForm.Item name="location">
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%', height: 45, borderRadius: 8 }}
                                        placeholder={
                                            <>
                                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                                Location
                                            </>
                                        }
                                        options={optionsLocations}
                                        optionLabelProp="label"
                                    />
                                </ProForm.Item>
                            </Col>
                            <Col xs={12} md={4}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={() => form.submit()}
                                    style={{
                                        width: '100%',
                                        height: 40,
                                        fontWeight: 60,
                                        borderRadius: 8,
                                        backgroundColor: '#333333',
                                        marginTop: '-40px',
                                        marginBottom: '15px',
                                    }}
                                >
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </ProForm>
                </div>
            </div >
        </>
    );
};

export default SearchClient;
