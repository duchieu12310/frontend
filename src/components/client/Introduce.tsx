import React from "react";
import styles from "@/styles/home.module.scss";
import { CheckCircleOutlined } from "@ant-design/icons";

const Introduce: React.FC = () => {
    return (
        <div className={styles['section-container']}>
            <div className={styles['intro-section']}>
                <div className={styles['intro-grid']}>
                    {/* Cột hình ảnh */}
                    <div className={styles['intro-images']}>
                        <img src="/img/about-1.jpg" alt="đội ngũ 1" />
                        <img src="/img/about-2.jpg" alt="đội ngũ 2" />
                        <img src="/img/about-3.jpg" alt="đội ngũ 3" />
                        <img src="/img/about-4.jpg" alt="đội ngũ 4" />
                    </div>

                    {/* Cột nội dung */}
                    <div className={styles['intro-content']}>
                        <h2 className="mb-4">
                            Chúng Tôi Giúp Bạn <span>Tìm Việc Tốt Nhất</span> Và Tìm Kiếm Nhân Tài
                        </h2>
                        <p>
                            Chúng tôi mang đến trải nghiệm thoải mái và dễ chịu. Dù có những khó khăn nhỏ, nhưng mọi thứ vẫn diễn ra thuận lợi. Một số điều vừa phải và vừa đủ để mang lại hiệu quả tốt nhất. Sự kết hợp này giúp bạn cảm thấy vừa vặn, đẹp mắt và đem lại trải nghiệm thú vị.
                        </p>

                        <div className={styles['features-list']}>
                            <div className={styles['feature-item']}>
                                <CheckCircleOutlined />
                                <span>Mang đến trải nghiệm thoải mái và dễ chịu</span>
                            </div>
                            <div className={styles['feature-item']}>
                                <CheckCircleOutlined />
                                <span>Những giải pháp vừa đủ và hiệu quả</span>
                            </div>
                            <div className={styles['feature-item']}>
                                <CheckCircleOutlined />
                                <span>Tạo cảm giác hài hòa và thú vị</span>
                            </div>
                        </div>

                        <a className="btn btn-primary py-3 px-5 mt-3" href="#">
                            Đọc Thêm
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Introduce;
