import { useEffect } from 'react';
import { Result, Button, Typography, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { fetchAccount } from '@/redux/slice/accountSlide';

const { Paragraph, Text } = Typography;

const PaymentResultPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    
    // Parse query params
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');

    useEffect(() => {
        // Refresh account info so the header/permissions get updated
        if (status === 'success') {
            dispatch(fetchAccount());
        }
    }, [status, dispatch]);

    const isSuccess = status === 'success';

    return (
        <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
            <Card style={{ maxWidth: 600, width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Result
                    status={isSuccess ? "success" : "error"}
                    title={isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
                    subTitle={isSuccess 
                        ? "Cảm ơn bạn đã nâng cấp gói dịch vụ. Các quyền lợi đã được kích hoạt ngay lập tức trên hệ thống."
                        : "Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình xử lý từ phía ngân hàng."
                    }
                    extra={[
                        <Button 
                            type="primary" 
                            key="dashboard" 
                            onClick={() => navigate('/admin')}
                            size="large"
                        >
                            Về Bảng Điều Khiển
                        </Button>,
                        <Button 
                            key="buy" 
                            onClick={() => navigate('/admin/subscription')}
                            size="large"
                        >
                            Xem Các Gói Khác
                        </Button>,
                    ]}
                >
                    {isSuccess ? (
                        <div className="desc">
                            <Paragraph>
                                <Text strong style={{ fontSize: 16 }}>Quyền lợi mới của bạn bao gồm:</Text>
                            </Paragraph>
                            <Paragraph>
                                - Tăng số lượng tin đăng tuyển dụng (Job Limit).
                            </Paragraph>
                            <Paragraph>
                                - Tăng thời gian hiển thị tối đa của mỗi tin tuyển dụng.
                            </Paragraph>
                            <Paragraph>
                                - Mở khóa hệ thống đánh giá tự động bằng AI (nếu gói có hỗ trợ).
                            </Paragraph>
                        </div>
                    ) : (
                        <div className="desc">
                            <Paragraph>
                                <Text strong style={{ fontSize: 16 }}>Vui lòng kiểm tra lại:</Text>
                            </Paragraph>
                            <Paragraph>
                                - Số dư trong tài khoản / thẻ của bạn.
                            </Paragraph>
                            <Paragraph>
                                - Kết nối mạng trong lúc thanh toán.
                            </Paragraph>
                            <Paragraph>
                                - Bạn đã chọn hủy thanh toán chủ động từ trang VNPay.
                            </Paragraph>
                        </div>
                    )}
                </Result>
            </Card>
        </div>
    );
};

export default PaymentResultPage;
