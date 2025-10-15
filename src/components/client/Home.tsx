import React, { useEffect } from 'react';

import '@/css/bootstrap.min.css';
import '@/css/style.css';
import '@/lib/animate/animate.min.css';
import '@/lib/owlcarousel/assets/owl.carousel.min.css';
const Home: React.FC = () => {
    useEffect(() => {
        // Load các thư viện JS template
        const loadLibs = async () => {
            const WOW = (await import('lib/wow/wow.min.js')).default;
            await import('lib/easing/easing.min.js');
            await import('lib/waypoints/waypoints.min.js');
            await import('lib/owlcarousel/owl.carousel.min.js');

            if (WOW) new WOW().init();
        };
        loadLibs();
    }, []);

    return (
        <div className="container-xxl bg-white p-0">
            {/* Spinner */}
            <div
                id="spinner"
                className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"
            >
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>

            {/* Carousel */}
            <div className="container-fluid p-0">
                <div className="owl-carousel header-carousel position-relative">
                    <div className="owl-carousel-item position-relative">
                        <img className="img-fluid" src="img/carousel-1.jpg" alt="" />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
                            style={{ background: 'rgba(43, 57, 64, .5)' }}
                        >
                            <div className="container">
                                <div className="row justify-content-start">
                                    <div className="col-10 col-lg-8">
                                        <h1 className="display-3 text-white animated slideInDown mb-4">
                                            Find The Perfect Job That You Deserved
                                        </h1>
                                        <p className="fs-5 fw-medium text-white mb-4 pb-2">
                                            Vero elitr justo clita lorem. Ipsum dolor at sed stet sit diam no. Kasd
                                            rebum ipsum et diam justo clita et kasd rebum sea elitr.
                                        </p>
                                        <a
                                            href="#"
                                            className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft"
                                        >
                                            Search A Job
                                        </a>
                                        <a
                                            href="#"
                                            className="btn btn-secondary py-md-3 px-md-5 animated slideInRight"
                                        >
                                            Find A Talent
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="owl-carousel-item position-relative">
                        <img className="img-fluid" src="img/carousel-2.jpg" alt="" />
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
                            style={{ background: 'rgba(43, 57, 64, .5)' }}
                        >
                            <div className="container">
                                <div className="row justify-content-start">
                                    <div className="col-10 col-lg-8">
                                        <h1 className="display-3 text-white animated slideInDown mb-4">
                                            Find The Best Startup Job That Fit You
                                        </h1>
                                        <p className="fs-5 fw-medium text-white mb-4 pb-2">
                                            Vero elitr justo clita lorem. Ipsum dolor at sed stet sit diam no. Kasd
                                            rebum ipsum et diam justo clita et kasd rebum sea elitr.
                                        </p>
                                        <a
                                            href="#"
                                            className="btn btn-primary py-md-3 px-md-5 me-3 animated slideInLeft"
                                        >
                                            Search A Job
                                        </a>
                                        <a
                                            href="#"
                                            className="btn btn-secondary py-md-3 px-md-5 animated slideInRight"
                                        >
                                            Find A Talent
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Top */}
            <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top">
                <i className="bi bi-arrow-up"></i>
            </a>
        </div>
    );
};

export default Home;
