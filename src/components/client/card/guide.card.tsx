import { Card, Col, Row, Button } from 'antd';
import styles from 'styles/client.module.scss';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const GuideCard = () => {
    const navigate = useNavigate();

    const guides = [
        {
            id: 1,
            title: "Call Center Là Gì? Phân Biệt A-Z Với Contact Center",
            description: "Tìm hiểu Call Center là gì, khác gì Contact Center, xu hướng phát triển và đâu là lựa chọn phù hợp cho doanh nghiệp. Xem ngay để tối ưu dịch vụ khách...",
            image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" // Placeholder
        },
        {
            id: 2,
            title: "Anhedonia là gì? Vì sao bạn làm gì cũng thấy chán?",
            description: "Anhedonia là gì, làm sao để bản thân thoát khỏi hội chứng Anhedonia và tìm lại hạnh phúc? Hãy tìm hiểu ngay trong bài viết!",
            image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" // Placeholder
        },
        {
            id: 3,
            title: "Bí mật của trì hoãn là gì, vì sao bạn luôn mắc bệnh để mai tính?",
            description: "Bạn sẽ dễ bị cuốn vào vòng xoáy của tiêu cực vì tự trách bản thân và bỏ lỡ nhiều cơ hội quan trọng. Vậy rốt cuộc lý do của trì hoãn là gì?",
            image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" // Placeholder
        }
    ];

    return (
        <div className={styles["guide-section"]}>
            <div className={styles["guide-header"]}>
                Cẩm nang nghề nghiệp
            </div>

            <div className={styles["guide-list"]}>
                <Row gutter={[24, 24]}>
                    {guides.map((item) => (
                        <Col xs={24} md={8} key={item.id}>
                            <div className={styles["guide-card"]}>
                                <div className={styles["image-wrapper"]}>
                                    <img src={item.image} alt={item.title} />
                                </div>
                                <div className={styles["content"]}>
                                    <h3 className={styles["card-title"]}>{item.title}</h3>
                                    <p className={styles["card-desc"]}>{item.description}</p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <div className={styles["view-more-btn"]}>
                <Button className={styles["btn-guide"]}>
                    Xem thêm cẩm nang nghề nghiệp
                </Button>
            </div>
        </div>
    );
};

export default GuideCard;
