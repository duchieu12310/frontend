import { Divider } from 'antd';
import styles from 'styles/client.module.scss';

import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';
import Introduce from '@/components/client/Introduce';
import GuideCard from '@/components/client/card/guide.card';
import SuggestJobCard from '@/components/client/card/suggest.job.card';

const HomePage = () => {
    return (
        <div className={`${styles["container-fluid"]} ${styles["home-section"]}`}>
            {/* ✅ Phần HERO Section (banner đầu trang) */}


            {/* Ô tìm kiếm */}
            <div className="search-content">
                <SearchClient />
            </div>
            {/* ✅ Phần giới thiệu cuối trang */}

            {/* Danh sách việc làm */}
            <JobCard
                showPagination={true}
            />

            <div className="company-section-wrapper" style={{ marginTop: 0 }}>
                <CompanyCard />
            </div>
            <SuggestJobCard />


            <GuideCard />


        </div>
    );
};

export default HomePage;
