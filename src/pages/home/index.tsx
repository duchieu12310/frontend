import { Divider } from 'antd';
import styles from 'styles/client.module.scss';
import Section from '@/components/client/Section'; // ✅ thêm dòng này
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import Introduce from '@/components/client/Introduce';

const HomePage = () => {
    return (
        <div className={`${styles["container"]} ${styles["home-section"]}`}>
            <Divider />
            {/* ✅ Phần HERO Section (banner đầu trang) */}
            <Section />

            {/* Ô tìm kiếm */}
            <div className="search-content" style={{ marginTop: 20 }}>
                <SearchClient />
            </div>
            {/* ✅ Phần giới thiệu cuối trang */}
            <Introduce />
            <Divider />

            {/* Danh sách công ty */}
            <CompanyCard />

            <div style={{ margin: 50 }}></div>

            <Divider />

            {/* Danh sách việc làm */}
            <JobCard />

            <Divider />


        </div>
    );
};

export default HomePage;
