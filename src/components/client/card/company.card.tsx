import { callAllCompany } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { ICompany } from '@/types/backend';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface IProps {
    showPagination?: boolean;
}

const CompanyCard = (props: IProps) => {
    const { showPagination = false } = props;

    const [displayCompany, setDisplayCompany] = useState<ICompany[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(4);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState("");
    const [sortQuery, setSortQuery] = useState("sort=updatedAt,desc");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompany();
    }, [current, pageSize, filter, sortQuery]);

    const fetchCompany = async () => {
        setIsLoading(true);
        let query = `page=${current}&size=${pageSize}`;
        if (filter) query += `&${filter}`;
        if (sortQuery) query += `&${sortQuery}`;

        const res = await callAllCompany(query);
        if (res && res.data) {
            setDisplayCompany(res.data.result);
            setTotal(res.data.meta.total);
        }
        setIsLoading(false);
    };

    const handleOnchangePage = (page: number) => {
        setCurrent(page);
    };

    const handleViewDetailJob = (item: ICompany) => {
        if (item.name) {
            const slug = convertSlug(item.name);
            navigate(`/company/${slug}?id=${item.id}`);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className={`${styles["company-section"]} py-4`}>
            <div className={`${styles["company-content"]} container`}>

                {isLoading && (
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Tiêu đề luôn căn giữa */}
                <div className="text-center mb-4">
                    <h4 className={`${styles["title"]} mb-0`}>
                        Nhà Tuyển Dụng Hàng Đầu
                    </h4>
                </div>

                {/* Grid các company */}
                <div className="row g-4">
                    {displayCompany && displayCompany.length > 0 ? (
                        displayCompany.slice(0, 4).map(item => (
                            <div className="col-12 col-md-6 col-lg-3" key={item.id}>
                                <div
                                    className="card h-100 shadow-sm d-flex flex-column"
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "12px",
                                        background: "linear-gradient(180deg, #ffffff, #f9f9ff)",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        minHeight: "280px"
                                    }}
                                    onClick={() => handleViewDetailJob(item)}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
                                    }}
                                >
                                    <div className="card-body d-flex flex-column align-items-center justify-content-center">
                                        {/* Logo cố định kích thước */}
                                        <div
                                            style={{
                                                width: "120px",
                                                height: "120px",
                                                marginBottom: "15px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden",
                                                borderRadius: "8px",
                                                backgroundColor: "#fff"
                                            }}
                                        >
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${item?.logo}`}
                                                alt={item.name}
                                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                                            />
                                        </div>
                                        <h5 className="card-title text-primary text-center">{item.name}</h5>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : !isLoading ? (
                        <div className="col-12 text-center py-5">
                            <p className="text-muted">Không có dữ liệu</p>
                        </div>
                    ) : null}
                </div>

                {/* Nút "Xem tất cả" ở dưới cùng */}
                {!showPagination && displayCompany && displayCompany.length > 0 && (
                    <div className="text-center mt-4">
                        <Link to="company" className="btn btn-primary">
                            Xem tất cả
                        </Link>
                    </div>
                )}

                {/* Pagination nếu cần */}
                {showPagination && totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li
                                        key={i}
                                        className={`page-item ${current === i + 1 ? "active" : ""}`}
                                        onClick={() => handleOnchangePage(i + 1)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <span className="page-link">{i + 1}</span>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyCard;
