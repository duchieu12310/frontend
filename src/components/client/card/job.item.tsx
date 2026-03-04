import { EnvironmentOutlined, HeartOutlined, DollarCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Card, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from '@/styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { convertSlug, getLocationName } from '@/config/utils';
import { IJob } from '@/types/backend';

dayjs.extend(relativeTime);

interface IProps {
    item: IJob;
}

const JobItem = (props: IProps) => {
    const { item } = props;
    const navigate = useNavigate();

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`)
    }

    return (
        <Card size="small" title={null} hoverable
            onClick={() => handleViewDetailJob(item)}
            style={{ height: '100%' }}
        >
            <div className={styles["card-job-content"]}>
                <div className={styles["job-card-header"]}>
                    <div className={styles["job-title"]}>{item.name}</div>
                    <HeartOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                </div>
                <div className={styles["job-card-body"]}>
                    <div className={styles["card-job-left"]}>
                        <img
                            alt="example"
                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.company?.logo}`}
                        />
                    </div>
                    <div className={styles["card-job-right"]}>
                        <div className={styles["company-name"]}>{item.company?.name}</div>
                        <div className={styles["job-salary"]}>
                            <DollarCircleOutlined style={{ fontSize: 16 }} />
                            {(item.salary + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + " triệu"}
                        </div>
                        <div className={styles["job-location"]}>
                            <EnvironmentOutlined style={{ color: '#58aaab' }} />
                            {getLocationName(item.location)}
                        </div>
                    </div>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div className={styles["job-card-footer"]}>
                    <ClockCircleOutlined />
                    Còn {dayjs(item.endDate).diff(dayjs(), 'day')} ngày
                </div>
            </div>
        </Card>
    )
}

export default JobItem;
