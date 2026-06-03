import { Link } from 'react-router-dom';
import { 
    RocketOutlined, 
    SearchOutlined, 
    LineChartOutlined, 
    TeamOutlined, 
    ArrowRightOutlined, 
    CheckCircleFilled, 
    StarFilled,
    PhoneOutlined,
    SendOutlined
} from '@ant-design/icons';
import styles from 'styles/home.module.scss';

const HomePage = () => {
    return (
        <div className={styles["topcv-landing"]}>
            {/* HERO SECTION */}
            <section className={styles["topcv-hero"]}>
                <div className={styles["hero-container"]}>
                    <div className="hero-left">
                        <div className={styles["hero-badge"]}>
                            <StarFilled style={{ color: '#fca311' }} /> Giải pháp tuyển dụng nhân sự AI hàng đầu
                        </div>
                        <h1>
                            Tuyển Dụng Nhân Tài,<br />
                            Kiến Tạo Tương Lai Cùng <span>JobHunter</span>
                        </h1>
                        <p className={styles["hero-sub"]}>
                            Tiếp cận hơn 5.000.000+ hồ sơ ứng viên chất lượng cao. Tự động hóa phễu sàng lọc, tăng tỷ lệ tuyển dụng thành công lên 85% với chi phí tối ưu nhất.
                        </p>
                        <div className={styles["hero-ctas"]}>
                            <Link to="/register-company" className={styles["btn-primary"]}>
                                Đăng tin ngay <SendOutlined />
                            </Link>
                            <Link to="/login" className={styles["btn-outline"]}>
                                Tư vấn tuyển dụng <PhoneOutlined />
                            </Link>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className={styles["hero-mockup"]}>
                            {/* Floating Badge 1 */}
                            <div className={styles["floating-badge-1"]}>
                                <CheckCircleFilled /> Top Match AI 98%
                            </div>

                            {/* Main Card Mockup */}
                            <div className={styles["mockup-card"]}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, color: '#0c241f' }}>
                                    Ứng viên phù hợp nhất
                                </h4>
                                <div className={styles["mockup-item"]}>
                                    <div className={styles["avatar"]}>HN</div>
                                    <div className={styles["info"]}>
                                        <h5>Nguyễn Hoàng Nam</h5>
                                        <p>Senior Frontend Engineer</p>
                                    </div>
                                    <div className={styles["match-badge"]}>98% Match</div>
                                </div>
                                <div className={styles["mockup-item"]}>
                                    <div className={styles["avatar"]}>MA</div>
                                    <div className={styles["info"]}>
                                        <h5>Lê Minh Anh</h5>
                                        <p>UI/UX Product Designer</p>
                                    </div>
                                    <div className={styles["match-badge"]}>95% Match</div>
                                </div>
                                <div className={styles["mockup-item"]}>
                                    <div className={styles["avatar"]}>DH</div>
                                    <div className={styles["info"]}>
                                        <h5>Trần Đức Huy</h5>
                                        <p>Backend Tech Lead</p>
                                    </div>
                                    <div className={styles["match-badge"]}>92% Match</div>
                                </div>
                            </div>

                            {/* Floating Badge 2 */}
                            <div className={styles["floating-badge-2"]}>
                                <span>10k+</span>
                                <span>Tuyển dụng mới mỗi ngày</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className={styles["topcv-stats"]}>
                <div className={styles["stats-container"]}>
                    <div className={styles["stat-item"]}>
                        <h4>5.000.000+</h4>
                        <p>Ứng viên chất lượng cao sẵn sàng nhận việc</p>
                    </div>
                    <div className={styles["stat-item"]}>
                        <h4>120.000+</h4>
                        <p>Doanh nghiệp hàng đầu tin tưởng sử dụng</p>
                    </div>
                    <div className={styles["stat-item"]}>
                        <h4>300.000+</h4>
                        <p>Tin đăng tuyển dụng được tạo mới mỗi tháng</p>
                    </div>
                    <div className={styles["stat-item"]}>
                        <h4>95%</h4>
                        <p>Doanh nghiệp tìm được nhân tài phù hợp</p>
                    </div>
                </div>
            </section>

            {/* SOLUTIONS/FEATURES SECTION */}
            <section className={styles["topcv-features"]}>
                <div className={styles["section-header"]}>
                    <h2>Hệ Sinh Thái Tuyển Dụng Toàn Diện</h2>
                    <p>Cung cấp giải pháp tối ưu từng bước trong quy trình săn đón nhân tài của doanh nghiệp</p>
                </div>
                <div className={styles["features-grid"]}>
                    <div className={styles["feature-card"]}>
                        <div className={styles["icon-wrapper"]}>
                            <RocketOutlined />
                        </div>
                        <h3>Đăng Tin Tuyển Dụng</h3>
                        <p>Tiếp cận nhanh chóng hàng ngàn hồ sơ ứng viên chất lượng cao chỉ sau vài phút khởi tạo chiến dịch.</p>
                    </div>
                    <div className={styles["feature-card"]}>
                        <div className={styles["icon-wrapper"]}>
                            <SearchOutlined />
                        </div>
                        <h3>Săn Hồ Sơ Chủ Động</h3>
                        <p>Tiếp cận trực tiếp kho CV tuyển dụng khổng lồ, lọc chính xác theo kĩ năng, ngôn ngữ và thâm niên.</p>
                    </div>
                    <div className={styles["feature-card"]}>
                        <div className={styles["icon-wrapper"]}>
                            <LineChartOutlined />
                        </div>
                        <h3>Quản Trị Chiến Dịch</h3>
                        <p>Quản lý phễu ứng tuyển, đánh giá trực tiếp năng lực và đặt lịch hẹn phỏng vấn ứng viên tự động.</p>
                    </div>
                    <div className={styles["feature-card"]}>
                        <div className={styles["icon-wrapper"]}>
                            <TeamOutlined />
                        </div>
                        <h3>Quảng Bá Thương Hiệu</h3>
                        <p>Xây dựng trang Doanh nghiệp chuyên nghiệp giúp nâng tầm uy tín thương hiệu tuyển dụng trên thị trường.</p>
                    </div>
                </div>
            </section>

            {/* PARTNERS SECTION */}
            <section className={styles["topcv-partners"]}>
                <div className={styles["partners-container"]}>
                    <p>Đối tác tuyển dụng chiến lược</p>
                    <div className={styles["logos-grid"]}>
                        <div className={styles["logo-item"]}>FPT Group</div>
                        <div className={styles["logo-item"]}>Vingroup</div>
                        <div className={styles["logo-item"]}>Viettel</div>
                        <div className={styles["logo-item"]}>Techcombank</div>
                        <div className={styles["logo-item"]}>Shopee</div>
                        <div className={styles["logo-item"]}>Grab</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
