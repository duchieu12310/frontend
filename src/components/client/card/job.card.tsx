import { callFetchAllJob, callSearchJob } from '@/config/api';
import { convertSlug, getLocationName, LOCATION_LIST, SALARY_RANGES, LEVEL_LIST, SKILLS_LIST } from '@/config/utils';
import { IJob } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined, FilterOutlined, DownOutlined, RightOutlined, LeftOutlined, HeartOutlined, ClockCircleOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin, Dropdown, Divider } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import { sfIn, sfLike } from "spring-filter-query-builder";

import JobItem from './job.item';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);


interface IProps {
    showPagination?: boolean;
}

const JobCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayJob, setDisplayJob] = useState<IJob[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

    // 'LOCATION' | 'SALARY' | 'LEVEL' | 'SKILLS'
    const [filterType, setFilterType] = useState<'LOCATION' | 'SALARY' | 'LEVEL' | 'SKILLS'>('LOCATION');

    useEffect(() => {
        fetchJob();
    }, [current, pageSize, filter, sortQuery, location]);

    const fetchJob = async () => {
        setIsLoading(true)
        let query = `page=${current}&size=${pageSize}`;
        if (filter) {
            query += `&${filter}`;
        }
        if (sortQuery) {
            query += `&${sortQuery}`;
        }

        //check query string
        const queryLocation = searchParams.get("location");
        const querySkills = searchParams.get("skills");
        const queryName = searchParams.get("name");

        // New params
        const querySalary = searchParams.get("salary"); // value like '10-15' or 'GT50'
        const queryLevel = searchParams.get("level");

        if (queryLocation || querySkills || queryName || querySalary || queryLevel) {
            let q = "";
            if (queryLocation) q += `&location=${queryLocation}`;
            if (querySkills) q += `&skills=${querySkills}`;
            if (queryName) q += `&keyword=${queryName}`;
            if (queryLevel) q += `&level=${queryLevel}`;

            // Handle Salary Range
            if (querySalary) {
                const range = SALARY_RANGES.find(r => r.value === querySalary);
                if (range) {
                    if (range.max) q += `&salary<=${range.max}`;
                    if (range.min) q += `&salary>=${range.min}`;
                }
            }

            query += q;
        }

        let res;
        // Trigger search if ANY filter is present
        if (queryLocation || querySkills || queryName || querySalary || queryLevel) {
            res = await callSearchJob(query);
        } else {
            res = await callFetchAllJob(query);
        }
        if (res && res.data) {
            setDisplayJob(res.data.result);
            setTotal(res.data.meta.total)
        }
        setIsLoading(false);
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }

    const handleViewDetailJob = (item: IJob) => {
        const slug = convertSlug(item.name);
        navigate(`/job/${slug}?id=${item.id}`)
    }

    const handleFilter = (val: string, extra?: any) => {
        const newParams = new URLSearchParams(searchParams);
        // Reset page
        setCurrent(1);

        if (filterType === 'LOCATION') {
            if (val) newParams.set('location', val);
            else newParams.delete('location');
        } else if (filterType === 'LEVEL') {
            if (val) newParams.set('level', val);
            else newParams.delete('level');
        } else if (filterType === 'SKILLS') {
            if (val) newParams.set('skills', val);
            else newParams.delete('skills');
        } else if (filterType === 'SALARY') {
            if (val) newParams.set('salary', val); // Store symbolic value e.g. '10-15'
            else newParams.delete('salary');
        }

        navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
    }

    const handleScroll = (scrollOffset: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft += scrollOffset;
        }
    };

    return (
        <div className={`${styles["card-job-section"]}`}>
            {/* Header: Việc làm tuyển gấp */}
            <div className={styles["job-header"]}>
                <div className={styles["title"]}>
                    <ThunderboltOutlined style={{ color: "orange" }} />
                    Việc làm tuyển gấp
                </div>
            </div>

            {/* Filter Bar */}
            <div className={styles["location-filter"]}>
                <Dropdown menu={{
                    items: [
                        { label: 'Địa điểm', key: 'LOCATION' },
                        { label: 'Mức lương', key: 'SALARY' },
                        { label: 'Kinh nghiệm', key: 'LEVEL' },
                        { label: 'Ngành nghề', key: 'SKILLS' }
                    ],
                    onClick: (e) => {
                        setFilterType(e.key as any);
                        // Reset other filters to "All" when switching category
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('location');
                        newParams.delete('salary');
                        newParams.delete('level');
                        newParams.delete('skills');
                        setCurrent(1);
                        navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
                    }
                }} trigger={['click']}>
                    <div className={styles["filter-header"]}>
                        <FilterOutlined />
                        Lọc theo: {
                            filterType === 'LOCATION' ? 'Địa điểm' :
                                filterType === 'SALARY' ? 'Mức lương' :
                                    filterType === 'LEVEL' ? 'Kinh nghiệm' :
                                        'Ngành nghề'
                        }
                        <DownOutlined style={{ fontSize: '10px' }} />
                    </div>
                </Dropdown>

                <div className={styles["nav-btn"]} onClick={() => handleScroll(-200)} style={{ marginRight: 10 }}>
                    <LeftOutlined />
                </div>
                <div className={styles["filter-list"]} ref={scrollRef}>
                    <div
                        className={`${styles["filter-pill"]} ${!searchParams.get(
                            filterType === 'LOCATION' ? 'location' :
                                filterType === 'SALARY' ? 'sort' : // Salary uses range logic, but "All" just clears params
                                    filterType === 'LEVEL' ? 'level' :
                                        'skills'
                        ) ? styles["active"] : ""}`}
                        onClick={() => handleFilter("")}
                    >
                        Tất cả
                    </div>
                    {
                        filterType === 'LOCATION' ? LOCATION_LIST.map((item, index) => (
                            <div key={index}
                                className={`${styles["filter-pill"]} ${searchParams.get('location') === item.value ? styles["active"] : ""}`}
                                onClick={() => handleFilter(item.value)}>
                                {item.label}
                            </div>
                        )) :
                            filterType === 'SALARY' ? SALARY_RANGES.map((item, index) => {
                                if (item.value === 'ALL') return null; // Handled by separate "Tat ca"
                                // Check if active: naive check if min match
                                const isActive = searchParams.get('salary') === item.value;
                                return (
                                    <div key={index}
                                        className={`${styles["filter-pill"]} ${isActive ? styles["active"] : ""}`}
                                        onClick={() => handleFilter(item.value, item)}>
                                        {item.label}
                                    </div>
                                )
                            }) :
                                filterType === 'LEVEL' ? LEVEL_LIST.map((item, index) => {
                                    if (item.value === 'ALL') return null;
                                    return (
                                        <div key={index}
                                            className={`${styles["filter-pill"]} ${searchParams.get('level') === item.value ? styles["active"] : ""}`}
                                            onClick={() => handleFilter(item.value)}>
                                            {item.label}
                                        </div>
                                    )
                                }) :
                                    // SKILLS
                                    SKILLS_LIST.map((item, index) => (
                                        <div key={index}
                                            className={`${styles["filter-pill"]} ${searchParams.get('skills') === item.value ? styles["active"] : ""}`}
                                            onClick={() => handleFilter(item.value)}>
                                            {item.label}
                                        </div>
                                    ))
                    }
                </div>
                <div className={styles["nav-btn"]} onClick={() => handleScroll(200)}>
                    <RightOutlined />
                </div>
            </div>

            <div className={`${styles["job-content"]}`}>
                <Spin spinning={isLoading} tip="Loading...">
                    <Row gutter={[20, 20]}>

                        {displayJob?.map(item => {
                            return (
                                <Col span={24} md={8} key={item.id}>
                                    <JobItem item={item} />
                                </Col>
                            )
                        })}


                        {(!displayJob || displayJob && displayJob.length === 0)
                            && !isLoading &&
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        }
                    </Row>
                    {showPagination && <>
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
                    </>}
                </Spin>
            </div>
        </div>
    )
}

export default JobCard;