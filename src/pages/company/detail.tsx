import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { ICompany } from "@/types/backend";
import { callFetchCompanyById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Breadcrumb } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { formatAddress } from "@/config/utils";


const ClientCompanyDetailPage = (props: any) => {
    const [companyDetail, setCompanyDetail] = useState<ICompany | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchCompanyById(id);
                if (res?.data) {
                    setCompanyDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            <Breadcrumb
                style={{ margin: '16px 0' }}
                items={[
                    {
                        title: <Link to={"/"}>Trang Chủ</Link>,
                    },
                    {
                        title: <Link to={"/company"}>Công Ty</Link>,
                    },
                    {
                        title: companyDetail?.name ?? "Chi tiết công ty",
                    },
                ]}
            />
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {companyDetail && companyDetail.id &&
                        <>
                             <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {companyDetail.name}
                                </div>

                                <div className={styles["location"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{formatAddress(companyDetail?.address)}
                                </div>

                                {companyDetail.descriptions && companyDetail.descriptions.length > 0 && (
                                     <>
                                         <Divider />
                                         <h3 style={{ fontSize: 18, marginBottom: 15, fontWeight: 600, color: '#333' }}>
                                             Đặc điểm nổi bật & Phúc lợi công ty
                                         </h3>
                                         <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 15 }}>
                                             {companyDetail.descriptions.map((desc, idx) => (
                                                 <div key={idx} style={{
                                                     background: '#fafafa',
                                                     padding: '12px 18px',
                                                     borderRadius: 8,
                                                     borderLeft: '4px solid #5b2ebd',
                                                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                 }}
                                                     dangerouslySetInnerHTML={{ __html: desc.content }}
                                                 />
                                             ))}
                                         </div>
                                     </>
                                 )}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            width={200}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${companyDetail?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {companyDetail?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientCompanyDetailPage;