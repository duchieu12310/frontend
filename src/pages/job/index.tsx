import SearchClient from '@/components/client/search.client';
import { Col, Divider, Row, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import JobCard from '@/components/client/card/job.card';

const ClientJobPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Breadcrumb
                style={{ margin: '16px 0' }}
                items={[
                    {
                        title: <Link to={"/"}>Trang Chủ</Link>,
                    },
                    {
                        title: "Việc Làm",
                    },
                ]}
            />
            <Row gutter={[20, 20]}>
                <Divider />
                <Col span={24}>
                    <SearchClient />
                </Col>
                <Divider />

                <Col span={24}>
                    <JobCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientJobPage;