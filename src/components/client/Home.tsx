import React, { useState, useEffect } from 'react';
import styles from '@/styles/home.module.scss';
import { EnvironmentOutlined, DollarOutlined } from '@ant-design/icons';
import Introduce from './Introduce';
import ClientsSay from './ClientsSay';
import SearchClient from './search.client';
import JobItem from './card/job.item';
import { callFetchCompany, callFetchJob } from '@/config/api';
import { JOB_CATEGORIES } from '@/config/utils';
import { ICompany, IJob } from '@/types/backend';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import htmlParser from 'html-react-parser';
import { Pagination, Row } from 'antd';

dayjs.extend(relativeTime);



const Home: React.FC = () => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [total, setTotal] = useState(0);

    const [featuredJobs, setFeaturedJobs] = useState<IJob[]>([]);
    const [topCompanies, setTopCompanies] = useState<ICompany[]>([]);
    const navigate = useNavigate();

    const HERO_SLIDES = [
        {
            id: 1,
            image: 'img/carousel-1.jpg',
        },
        {
            id: 2,
            image: 'img/carousel-2.jpg',
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchJob();
    }, [current]); // Reload when page changes

    const fetchJob = async () => {
        const resJob = await callFetchJob(`page=${current}&size=${pageSize}&sort=updatedAt,desc`);
        if (resJob?.data?.result) {
            setFeaturedJobs(resJob.data.result);
            setTotal(resJob.data.meta.total);
        }
    }

    // Fetch Top Companies (Static)
    useEffect(() => {
        const fetchCompany = async () => {
            const resComp = await callFetchCompany("page=1&size=8");
            if (resComp?.data?.result) setTopCompanies(resComp.data.result);
        };
        fetchCompany();
    }, []);

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
    }

    return (
        <div className="bg-white p-0">
            {/* HERO SECTION WITH SEARCH OVERLAY */}
            <div className={styles['hero-section']}>
                {HERO_SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`${styles['hero-slide']} ${index === currentSlide ? styles.active : ''}`}
                    >
                        <img className={styles['hero-img']} src={slide.image} alt="Hero Slide" />
                    </div>
                ))}


            </div>

            {/* JOB CATEGORIES */}
            <div className={styles['section-container']}>
                <div className={styles['section-header']}>
                    <h2>{t('home.categories.title')}</h2>
                    <span className={styles['view-all']} onClick={() => navigate('/job')}>{t('home.categories.view_all')}</span>
                </div>
                <div className={styles['job-categories-section']}>
                    <div className={styles['category-grid']}>
                        {JOB_CATEGORIES.map((cat, idx) => (
                            <div key={idx} className={styles['category-card']} onClick={() => navigate(`/job?keyword=${cat.name}`)}>
                                <div className={styles['icon']}>{cat.icon}</div>
                                <h3>{cat.name}</h3>
                                <p>{cat.count} vị trí</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FEATURED JOBS (Vieclam24h Grid Layout) */}
            <div className={styles['section-container']} style={{ backgroundColor: '#f8fafc' }}>
                <div className={styles['section-header']}>
                    <h2>{t('home.featured_jobs.title')}</h2>
                    <span className={styles['view-all']} onClick={() => navigate('/job')}>{t('home.featured_jobs.view_all')}</span>
                </div>
                <div className={styles['featured-jobs-section']}>
                    <div className={styles['job-grid']}>
                        {featuredJobs.map(job => (
                            <div key={job.id} style={{ height: '100%' }}>
                                <JobItem item={job} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 30 }}></div>
                    <Row style={{ display: "flex", justifyContent: "center" }}>
                        <Pagination
                            current={current}
                            total={total}
                            pageSize={pageSize}
                            responsive
                            onChange={(p: number, s: number) => handleOnchangePage({ current: p, pageSize: s })}
                        />
                    </Row>
                </div>
            </div>

            {/* TOP EMPLOYERS */}
            <div className={styles['section-container']}>
                <div className={styles['section-header']}>
                    <h2>{t('home.top_employers.title')}</h2>
                    <span className={styles['view-all']} onClick={() => navigate('/company')}>{t('home.top_employers.view_all')}</span>
                </div>
                <div className={styles['top-employers-section']}>
                    <div className={styles['employer-grid']}>
                        {topCompanies.map(comp => (
                            <div key={comp.id} className={styles['employer-card']} onClick={() => navigate(`/company/${comp.id}`)}>
                                <img
                                    src={comp.logo ? `${import.meta.env.VITE_BACKEND_URL}/images/company/${comp.logo}` : "/img/company-default.png"}
                                    alt={comp.name}
                                    onError={(e: any) => e.target.src = "/img/company-default.png"}
                                />
                                <h4>{comp.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTIONS: About & Testimonals */}
            <Introduce />
            <ClientsSay />

            {/* Back to Top */}
            <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 99 }}>
                <i className="bi bi-arrow-up"></i>
            </a>
        </div>
    );
};

export default Home;
