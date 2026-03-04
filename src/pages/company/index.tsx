import { Col, Row, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import CompanyCard from '@/components/client/card/company.card';

const ClientCompanyPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Breadcrumb
                style={{ margin: '16px 0' }}
                items={[
                    {
                        title: <Link to={"/"}>Trang Chủ</Link>,
                    },
                    {
                        title: "Công Ty",
                    },
                ]}
            />
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <CompanyCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientCompanyPage;