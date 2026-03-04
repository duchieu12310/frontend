import { callFetchCompanyPublic } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { SafetyCertificateFilled, ArrowRightOutlined, ShopOutlined } from '@ant-design/icons';
import { Spin, Empty, Pagination } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize]);

    const fetchCompany = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}&sort=updatedAt,desc`;

        const res = await callFetchCompanyPublic(query);

        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`);
        }
    };

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    };

    return (
        <div className={`${styles["company-section"]}`}>
            <div className={styles["company-header"]}>
                <div className={styles["title"]}>
                    <SafetyCertificateFilled style={{ color: "#fca311", fontSize: "28px" }} />
                    Công ty nổi bật
                </div>
                <Link to="/company" className={styles["view-all"]}>
                    Xem tất cả <ArrowRightOutlined />
                </Link>
            </div>

            <Spin spinning={isLoading}>
                <div className={styles["company-list"]}>
                    {displayCompany && displayCompany.length > 0 ? (
                        displayCompany.map((item, index) => {
                            const jobCount = Math.floor(Math.random() * 20) + 1;
                            return (
                                <div className={styles["company-card"]} key={item.id} onClick={() => handleViewDetailJob(item)}>
                                    <div className={styles["logo-wrapper"]}>
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                            alt={item.name}
                                            onError={(e) => {
                                                e.currentTarget.src = "/images/company-default.png";
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <div className={styles["hiring-text"]}>
                                        <ShopOutlined /> {jobCount} vị trí đang tuyển
                                    </div>
                                </div>
                            )
                        })
                    ) : !isLoading ? (
                        <div className={styles["empty"]}>
                            <Empty description="Không có công ty nào" />
                        </div>
                    ) : null}
                </div>
                {showPagination && total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            total={total}
                            responsive
                            onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                        />
                    </div>
                )}
            </Spin>
        </div>
    );
};

export default CompanyCard;
