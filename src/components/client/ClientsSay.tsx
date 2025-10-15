import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <div className="container-xxl py-5">
            <div className="container">
                <h1 className="text-center mb-5">Khách Hàng Nói Về Chúng Tôi!!!</h1>

                <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
                    <div className="carousel-inner">
                        {testimonials.map((t, index) => (
                            <div key={t.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                                <div className="testimonial-item bg-light rounded p-4 text-center">
                                    <i className="fa fa-quote-left fa-2x text-primary mb-3"></i>
                                    <p>{t.text}</p>
                                    <div className="d-flex align-items-center justify-content-center mt-3">
                                        <img
                                            className="img-fluid rounded-circle"
                                            src={t.img}
                                            alt={t.name}
                                            style={{ width: '50px', height: '50px' }}
                                        />
                                        <div className="ps-3 text-start">
                                            <h5 className="mb-1">{t.name}</h5>
                                            <small>{t.profession}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Điều khiển carousel */}
                    <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Trước</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Tiếp</span>
                    </button>

                    {/* Chỉ báo carousel */}
                    <div className="carousel-indicators mt-3">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                data-bs-target="#testimonialCarousel"
                                data-bs-slide-to={idx}
                                className={idx === 0 ? 'active' : ''}
                                aria-current={idx === 0 ? 'true' : undefined}
                                aria-label={`Slide ${idx + 1}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientsSay;
