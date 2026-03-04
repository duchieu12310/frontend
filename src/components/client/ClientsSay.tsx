import React from 'react';
import styles from '@/styles/home.module.scss';
import { MessageOutlined } from '@ant-design/icons';

interface Testimonial {
    id: number;
    text: string;
    name: string;
    profession: string;
    img: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        text: 'Công ty rất chuyên nghiệp và dịch vụ tuyệt vời. Tôi rất hài lòng với kết quả!',
        name: 'Nguyễn Văn A',
        profession: 'Nhân viên Kinh doanh',
        img: 'img/testimonial-1.jpg',
    },
    {
        id: 2,
        text: 'Đội ngũ làm việc nhiệt tình, hỗ trợ tận tâm. Chắc chắn sẽ giới thiệu cho người khác!',
        name: 'Trần Thị B',
        profession: 'Chuyên viên Marketing',
        img: 'img/testimonial-2.jpg',
    },
    {
        id: 3,
        text: 'Môi trường làm việc thân thiện và chuyên nghiệp. Tôi học hỏi được rất nhiều.',
        name: 'Lê Văn C',
        profession: 'Nhân viên IT',
        img: 'img/testimonial-3.jpg',
    },
    {
        id: 4,
        text: 'Dịch vụ nhanh chóng, chất lượng tốt. Tôi rất ấn tượng với cách làm việc ở đây.',
        name: 'Phạm Thị D',
        profession: 'Nhân viên Hành chính',
        img: 'img/testimonial-4.jpg',
    },
];

const ClientsSay: React.FC = () => {
    return (
        <div className={styles['section-container']}>
            <div className={styles['testimonials-section']}>
                <h2><span>Khách Hàng Nói Về Chúng Tôi!!!</span></h2>

                <div className={styles['testimonial-grid']}>
                    {testimonials.map((t) => (
                        <div key={t.id} className={styles['testimonial-card']}>
                            <MessageOutlined className={styles['quote-icon']} />
                            <p className={styles['text']}>{t.text}</p>
                            <div className={styles['author']}>
                                <img
                                    src={t.img}
                                    alt={t.name}
                                />
                                <div className={styles['info']}>
                                    <h5>{t.name}</h5>
                                    <small>{t.profession}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientsSay;
