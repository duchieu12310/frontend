import { callFetchAllJob } from '@/config/api';
import { IJob } from '@/types/backend';
import { StarFilled } from '@ant-design/icons';
import { Col, Empty, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import styles from 'styles/client.module.scss';
import JobItem from './job.item';

const SuggestJobCard = () => {
    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            // Fetch a larger pool to randomize from, e.g., 30 items
            const query = `page=1&size=30&sort=createdAt,desc`;
            const res = await callFetchAllJob(query);
            if (res && res.data) {
                // Shuffle logic
                const shuffled = [...res.data.result].sort(() => 0.5 - Math.random());
                // Take first 9
                setDisplayJob(shuffled.slice(0, 9));
            }
            setIsLoading(false);
        };

        fetchJob();
    }, []);

    return (
        <div className={`${styles["card-job-section"]}`} style={{ marginTop: 20 }}>
            {/* Header */}
            <div className={styles["job-header"]} style={{ marginBottom: 20 }}>
                <div className={styles["title"]}>
                    <StarFilled style={{ color: "#483cc9", marginRight: 10 }} />
                    Việc làm gợi ý
                </div>
            </div>

            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>
                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={8} key={item.id}>
                                    <JobItem item={item} />
                                </Col>
                            )
                        })}

                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                </Spin>
            </div>
        </div>
    )
}

export default SuggestJobCard;
