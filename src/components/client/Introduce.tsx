import React from "react";

const Introduce: React.FC = () => {
    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="row g-5 align-items-center">
                    {/* Cột hình ảnh */}
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                        <div className="row g-0 about-bg rounded overflow-hidden">
                            <div className="col-6 text-start">
                                <img
                                    className="img-fluid w-100"
                                    src="/img/about-1.jpg"
                                    alt="đội ngũ 1"
                                />
                            </div>
                            <div className="col-6 text-start">
                                <img
                                    className="img-fluid"
                                    src="/img/about-2.jpg"
                                    alt="đội ngũ 2"
                                    style={{ width: "85%", marginTop: "15%" }}
                                />
                            </div>
                            <div className="col-6 text-end">
                                <img
                                    className="img-fluid"
                                    src="/img/about-3.jpg"
                                    alt="đội ngũ 3"
                                    style={{ width: "85%" }}
                                />
                            </div>
                            <div className="col-6 text-end">
                                <img
                                    className="img-fluid w-100"
                                    src="/img/about-4.jpg"
                                    alt="đội ngũ 4"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cột nội dung */}
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                        <h1 className="mb-4">
                            Chúng Tôi Giúp Bạn Tìm Việc Tốt Nhất Và Tìm Kiếm Nhân Tài
                        </h1>
                        <p className="mb-4">
                            Chúng tôi mang đến trải nghiệm thoải mái và dễ chịu. Dù có những khó khăn nhỏ, nhưng mọi thứ vẫn diễn ra thuận lợi. Một số điều vừa phải và vừa đủ để mang lại hiệu quả tốt nhất. Sự kết hợp này giúp bạn cảm thấy vừa vặn, đẹp mắt và đem lại trải nghiệm thú vị.
                        </p>
                        <p>
                            <i className="fa fa-check text-primary me-3"></i>
                            Mang đến trải nghiệm thoải mái và dễ chịu
                        </p>
                        <p>
                            <i className="fa fa-check text-primary me-3"></i>
                            Những giải pháp vừa đủ và hiệu quả
                        </p>
                        <p>
                            <i className="fa fa-check text-primary me-3"></i>
                            Tạo cảm giác hài hòa và thú vị
                        </p>
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
