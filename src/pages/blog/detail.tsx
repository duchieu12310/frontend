import { Breadcrumb } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { HomeOutlined, FacebookFilled, LinkOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import { useState } from 'react';

const ClientBlogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const guides = [
        {
            id: 1,
            title: "Call Center Là Gì? Phân Biệt A-Z Với Contact Center",
            description: "Tìm hiểu Call Center là gì, khác gì Contact Center, xu hướng phát triển và đâu là lựa chọn phù hợp cho doanh nghiệp. Xem ngay để tối ưu dịch vụ khách...",
            content: `
                <p>Call Center (Trung tâm cuộc gọi) là bộ phận chuyên tiếp nhận và thực hiện các cuộc gọi với khách hàng. Tuy nhiên, trong thời đại số, khái niệm này đã mở rộng thành Contact Center.</p>
                <h3>Call Center là gì?</h3>
                <p>Call Center tập trung chủ yếu vào việc xử lý các cuộc gọi điện thoại (thoại). Nó thường được sử dụng cho hỗ trợ khách hàng, bán hàng qua điện thoại (telesales), hoặc khảo sát.</p>
                <h3>Khác biệt với Contact Center</h3>
                <p>Contact Center đa kênh hơn. Ngoài điện thoại, nó còn tích hợp email, chat trực tuyến, mạng xã hội, v.v. Điều này giúp doanh nghiệp tương tác với khách hàng mọi lúc, mọi nơi.</p>
                <h3>Xu hướng phát triển</h3>
                <p>Ngày nay, AI và tự động hóa đang được áp dụng mạnh mẽ để nâng cao hiệu quả hoạt động của cả Call Center và Contact Center.</p>
            `,
            image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            author: "Thuyen Dang",
            time: "11 tháng trước"
        },
        {
            id: 2,
            title: "Anhedonia là gì? Vì sao bạn làm gì cũng thấy chán?",
            description: "Anhedonia là gì, làm sao để bản thân thoát khỏi hội chứng Anhedonia và tìm lại hạnh phúc? Hãy tìm hiểu ngay trong bài viết!",
            content: `
                 <p>Anhedonia là thuật ngữ y học chỉ tình trạng mất khả năng cảm nhận niềm vui từ những hoạt động mà trước đây bạn từng yêu thích.</p>
                 <h3>Nguyên nhân</h3>
                 <p>Nó thường liên quan đến trầm cảm, các rối loạn lo âu, hoặc căng thẳng kéo dài. Sự mất cân bằng các chất dẫn truyền thần kinh như dopamine cũng đóng vai trò quan trọng.</p>
                 <h3>Cách khắc phục</h3>
                 <p>Điều trị bao gồm liệu pháp tâm lý, thay đổi lối sống, và đôi khi là dùng thuốc. Việc tập thể dục, ngủ đủ giấc và kết nối xã hội cũng giúp cải thiện tình trạng này.</p>
            `,
            image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            author: "Thuyen Dang",
            time: "11 tháng trước"
        },
        {
            id: 3,
            title: "Bí mật của trì hoãn là gì, vì sao bạn luôn mắc bệnh để mai tính?",
            description: "Bạn sẽ dễ bị cuốn vào vòng xoáy của tiêu cực vì tự trách bản thân và bỏ lỡ nhiều cơ hội quan trọng. Vậy rốt cuộc lý do của trì hoãn là gì?",
            content: `
                <p>Trì hoãn không hẳn là do lười biếng. Nó thường là cơ chế đối phó với những cảm xúc tiêu cực liên quan đến công việc đó, như sợ thất bại, sợ khó khăn.</p>
                <h3>Tại sao chúng ta trì hoãn?</h3>
                <p>Bộ não ưu tiên niềm vui tức thì hơn là phần thưởng trong tương lai. Khi đối mặt với nhiệm vụ khó, não bộ muốn tránh né sự khó chịu ngay lập tức.</p>
                <h3>Giải pháp</h3>
                <p>Chia nhỏ công việc, đặt thời hạn ngắn (deadline), và thực hành lòng trắc ẩn với bản thân là những cách hiệu quả để vượt qua sự trì hoãn.</p>
            `,
            image: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            author: "Thuyen Dang",
            time: "11 tháng trước"
        }
    ];

    const blog = guides.find(item => item.id === Number(id));

    if (!blog) {
        return <div style={{ padding: 20 }}>Không tìm thấy bài viết!</div>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Breadcrumb
                    items={[
                        {
                            title: 'Trang Chủ',
                            onClick: () => navigate('/'),
                            className: 'cursor-pointer'
                        },
                        {
                            title: 'Cẩm Nang Nghề Nghiệp',
                            onClick: () => navigate('/blog'),
                            className: 'cursor-pointer'
                        },
                        {
                            title: 'La Bàn Sự Nghiệp',
                        }
                    ]}
                    style={{ marginBottom: '20px', color: '#6938c6' }}
                />

                <div className={styles["blog-detail"]} style={{ paddingBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '10px',
                        lineHeight: '1.4'
                    }}>
                        {blog.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        color: '#666',
                        fontSize: '14px',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '20px'
                    }}>
                        <div>
                            Bởi <span style={{ color: '#6938c6', fontWeight: 600 }}>{blog.author}</span> • {blog.time}
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <span>Chia sẻ bài viết này</span>
                            <LinkOutlined style={{ fontSize: '18px', cursor: 'pointer', color: '#6938c6' }} />
                            <FacebookFilled style={{ fontSize: '18px', cursor: 'pointer', color: '#6938c6' }} />
                            <div style={{
                                width: '24px',
                                height: '24px',
                                background: '#0068ff',
                                borderRadius: '50%',
                                color: '#fff',
                                fontSize: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>Z</div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: '12px', marginBottom: '30px' }}>
                        <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                        style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClientBlogDetailPage;
