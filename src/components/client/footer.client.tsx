import React from "react";
import { FaFacebook, FaLinkedin, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import styles from './footer.module.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles['footer-container']}>
            <div className={styles['footer-content']}>
                {/* Column 1: Về ITviec */}
                <div className={styles.column}>
                    <h5>Về ITviec</h5>
                    <ul>
                        <li>Về ITviec</li>
                        <li>Liên Hệ</li>
                        <li>Dịch vụ AI Match</li>
                        <li>Hỏi Đáp</li>
                        <li>Quy chế hoạt động</li>
                        <li>Thỏa thuận sử dụng</li>
                        <li>Chính sách bảo mật</li>
                        <li>Giải quyết khiếu nại</li>
                        <li>Thông cáo báo chí</li>
                    </ul>
                </div>

                {/* Column 2: Chiến dịch & Tài nguyên */}
                <div className={styles.column}>
                    <h5>Chiến dịch & Tài nguyên</h5>
                    <ul>
                        <li>Cuộc thi viết IT Story</li>
                        <li>Việc làm IT nổi bật</li>
                        <li>Khảo sát lương IT hàng năm</li>
                    </ul>
                </div>

                {/* Column 3: Liên hệ */}
                <div className={styles.column}>
                    <h5>Liên hệ</h5>
                    <div className={styles['contact-info']}>
                        <div className={styles['contact-item']}>
                            <h6><FaMapMarkerAlt /> Văn phòng Hồ Chí Minh</h6>
                            <p>60 Nguyễn Văn Thủ, Phường Tân Định, Quận 1, Tp. Hồ Chí Minh</p>
                            <p className={styles.phone}><FaPhone /> (+84) 977 460 519</p>
                        </div>
                        <div className={styles['contact-item']}>
                            <h6><FaMapMarkerAlt /> Văn phòng Hà Nội</h6>
                            <p>Tòa nhà Ford, 105 Láng Hạ, Quận Đống Đa, Hà Nội</p>
                            <p className={styles.phone}><FaPhone /> (+84) 983 131 351</p>
                        </div>
                        <div className={styles['contact-item']}>
                            <h6><FaEnvelope /> Email hỗ trợ</h6>
                            <p className={styles.email}>love@itviec.com</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles['footer-bottom']}>
                <div className={styles['footer-bottom-content']}>
                    <div className={styles.copyright}>
                        Copyright © IT VIEC JSC - Mã số thuế: 0312191599
                    </div>
                    <div className={styles['social-links']}>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebook />
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <FaLinkedin />
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

