import { Col, Divider, Row } from "antd";
import styles from "styles/client.module.scss";
import RegisterCompany from "@/components/client/card/register-company.card";

const ClientRegisterCompanyPage = () => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <h2 style={{ textAlign: "center", marginBottom: 10 }}>
                        Đăng Ký Công Ty
                    </h2>
                </Col>
                <Divider />

                <Col span={24}>
                    <RegisterCompany />
                </Col>
            </Row>
        </div>
    );
};

export default ClientRegisterCompanyPage;
