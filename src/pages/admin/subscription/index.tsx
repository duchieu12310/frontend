import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Spin, notification, Tag, Divider, InputNumber } from 'antd';
import { CheckCircleOutlined, StarOutlined, RocketOutlined } from '@ant-design/icons';
import { ISubscriptionPackage } from '@/types/backend';
import { callFetchPackages, callCreatePaymentOrder, callFetchPurchasedPackages, callCreateCustomPaymentOrder, callFetchCompanyById, callCancelPackage, callFetchPaidOrdersByCompany, callFetchCompany } from '@/config/api';
import { useAppSelector } from '@/redux/hooks';

const { Title, Text, Paragraph } = Typography;

const SubscriptionPage = () => {
    const user = useAppSelector(state => state.account.user);
    const [packages, setPackages] = useState<ISubscriptionPackage[]>([]);
    const [purchasedIds, setPurchasedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [buyingId, setBuyingId] = useState<number | null>(null);

    const [customJobLimit, setCustomJobLimit] = useState<number>(0);
    const [customJobDurationLimit, setCustomJobDurationLimit] = useState<number>(0);
    const [buyingCustom, setBuyingCustom] = useState<boolean>(false);

    const [company, setCompany] = useState<any>(null);
    const [canceling, setCanceling] = useState<boolean>(false);
    const [activePackageId, setActivePackageId] = useState<number | null>(null);

    if (user?.role?.name !== 'EMPLOYER') {
        return <div style={{ padding: '24px' }}>Bạn không có quyền truy cập trang này.</div>;
    }

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const [resPkg, resPurchased] = await Promise.all([
                    callFetchPackages(),
                    callFetchPurchasedPackages()
                ]);
                
                if (resPkg && resPkg.data) {
                    setPackages(resPkg.data);
                } else if (Array.isArray(resPkg)) {
                    setPackages(resPkg as any);
                }

                if (resPurchased && resPurchased.data) {
                    setPurchasedIds(resPurchased.data);
                } else if (Array.isArray(resPurchased)) {
                    setPurchasedIds(resPurchased as any);
                }

                // Fetch company details
                const resComp = await callFetchCompany("page=1&size=1");
                if (resComp && resComp.data && resComp.data.result && resComp.data.result.length > 0) {
                    const comp = resComp.data.result[0];
                    setCompany(comp);

                    // Fetch paid orders to find the active package ID
                    if (comp.id) {
                        const resOrders = await callFetchPaidOrdersByCompany(comp.id);
                        if (resOrders && resOrders.data && Array.isArray(resOrders.data)) {
                            const paidOrders = resOrders.data;
                            const activeOrder = [...paidOrders]
                                .reverse()
                                .find(o => o.subscriptionPackage && o.subscriptionPackage.id);
                            if (activeOrder) {
                                setActivePackageId(activeOrder.subscriptionPackage.id);
                            }
                        }
                    }
                }
            } catch (error) {
                notification.error({
                    message: "Lỗi tải dữ liệu",
                    description: "Không thể lấy danh sách gói cước. Vui lòng thử lại sau."
                });
            }
            setLoading(false);
        };
        fetchPackages();
    }, [user?.company?.id]);

    const handleBuyPackage = async (packageId: number) => {
        setBuyingId(packageId);
        try {
            const res = await callCreatePaymentOrder(packageId);
            if (res && typeof res === 'string') {
                window.location.href = res;
            } else if (res && res.data && typeof res.data === 'string') {
                window.location.href = res.data;
            } else if (res && (res as any).data?.paymentUrl) {
                window.location.href = (res as any).data.paymentUrl;
            } else {
                notification.error({
                    message: "Lỗi hệ thống",
                    description: "Không thể tạo hóa đơn thanh toán lúc này."
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi thanh toán",
                description: error?.response?.data?.message || "Đã xảy ra lỗi khi kết nối với cổng thanh toán."
            });
        }
        setBuyingId(null);
    };

    const handleBuyCustomLimits = async () => {
        setBuyingCustom(true);
        try {
            const res = await callCreateCustomPaymentOrder(customJobLimit, customJobDurationLimit);
            if (res && typeof res === 'string') {
                window.location.href = res;
            } else if (res && res.data && typeof res.data === 'string') {
                window.location.href = res.data;
            } else if (res && (res as any).data?.paymentUrl) {
                window.location.href = (res as any).data.paymentUrl;
            } else {
                notification.error({
                    message: "Lỗi hệ thống",
                    description: "Không thể tạo hóa đơn thanh toán lúc này."
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi thanh toán",
                description: error?.response?.data?.message || "Đã xảy ra lỗi khi kết nối với cổng thanh toán."
            });
        } finally {
            setBuyingCustom(false);
        }
    };

    const handleCancelPackage = async () => {
        setCanceling(true);
        try {
            const res = await callCancelPackage();
            if (res && res.data) {
                notification.success({
                    message: "Hủy gói cước thành công",
                    description: "Hệ thống đã hủy gói cước của bạn và hoàn trả giới hạn tài khoản về mức mặc định."
                });
                setCompany(res.data);
                setPurchasedIds([]);
                setActivePackageId(null);
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hủy gói cước",
                description: error?.response?.data?.message || "Đã xảy ra lỗi khi hủy gói cước."
            });
        } finally {
            setCanceling(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    const hasActivePackage = company?.packageExpireDate && new Date(company.packageExpireDate) > new Date();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <Title level={2}>Nâng Cấp Gói Dịch Vụ</Title>
                <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                    Mở khóa sức mạnh AI để tìm kiếm nhân tài nhanh chóng và hiệu quả hơn
                </Paragraph>
            </div>

            {hasActivePackage && (
                <Card
                    style={{
                        borderRadius: '12px',
                        border: '1px solid #ff4d4f',
                        background: '#fff2f0',
                        marginBottom: '32px',
                        padding: '8px'
                    }}
                >
                    <Row gutter={[24, 24]} align="middle" style={{ padding: '12px' }}>
                        <Col xs={24} md={16}>
                            <Title level={4} style={{ margin: 0, color: '#cf1322' }}>
                                Gói Cước Đang Hoạt Động
                            </Title>
                            <Paragraph style={{ margin: '8px 0 0 0', color: '#595959', fontSize: '14px' }}>
                                Doanh nghiệp của bạn đang sử dụng gói dịch vụ có hiệu lực đến ngày:{' '}
                                <strong>{new Date(company.packageExpireDate!).toLocaleDateString('vi-VN')}</strong>.
                                <br />
                                • Giới hạn đăng tin hiện tại: <strong>{company.jobLimit}</strong> bài đăng.
                                <br />
                                • Thời hạn tin đăng tối đa: <strong>{company.jobDurationLimit}</strong> ngày.
                            </Paragraph>
                        </Col>
                        <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                            <Button
                                type="primary"
                                danger
                                onClick={handleCancelPackage}
                                loading={canceling}
                                style={{ borderRadius: '6px', fontWeight: 'bold' }}
                            >
                                Hủy Gói Cước Hiện Tại
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            {!hasActivePackage && company && (
                <Card
                    style={{
                        borderRadius: '12px',
                        border: '1px solid #d9d9d9',
                        background: '#fafafa',
                        marginBottom: '32px',
                        padding: '8px'
                    }}
                >
                    <Row gutter={[24, 24]} align="middle" style={{ padding: '12px' }}>
                        <Col xs={24}>
                            <Title level={4} style={{ margin: 0, color: '#595959' }}>
                                Giới Hạn Tài Khoản Hiện Tại (Mặc định / Mua lẻ)
                            </Title>
                            <Paragraph style={{ margin: '8px 0 0 0', color: '#595959', fontSize: '14px' }}>
                                Bạn chưa đăng ký gói cước nào hoặc gói cước đã hết hạn. Giới hạn đăng tin hiện tại của bạn:
                                <br />
                                • Giới hạn đăng tin: <strong>{company.jobLimit}</strong> bài đăng.
                                <br />
                                • Thời hạn tin đăng tối đa: <strong>{company.jobDurationLimit}</strong> ngày.
                            </Paragraph>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Custom package section */}
            <Card
                style={{
                    borderRadius: '12px',
                    border: '1px dashed #1677ff',
                    background: '#f0f5ff',
                    marginBottom: '32px',
                    padding: '8px'
                }}
            >
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={10}>
                        <Title level={4} style={{ margin: 0, color: '#0958d9' }}>
                            <RocketOutlined style={{ marginRight: '8px' }} />
                            Mua Giới Hạn Tự Chọn (Tính Phí Theo Số Lượng)
                        </Title>
                        <Paragraph style={{ margin: '8px 0 0 0', color: '#595959' }}>
                            Tự thiết lập số lượng bài tuyển dụng và số ngày hiển thị tối đa mong muốn.
                            Hệ thống sẽ tính phí dựa trên số lượng thực tế bạn chọn:
                            <br />
                            • <strong>50.000 VNĐ</strong> / bài đăng tuyển dụng
                            <br />
                            • <strong>10.000 VNĐ</strong> / ngày hiển thị tối đa
                        </Paragraph>
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#595959' }}>Số lượng bài tuyển dụng:</span>
                            <InputNumber
                                min={0}
                                value={customJobLimit}
                                onChange={(val) => setCustomJobLimit(val ?? 0)}
                                style={{ width: '100%' }}
                                placeholder="Nhập số bài"
                            />
                        </div>
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#595959' }}>Số ngày hiển thị tối đa:</span>
                            <InputNumber
                                min={0}
                                value={customJobDurationLimit}
                                onChange={(val) => setCustomJobDurationLimit(val ?? 0)}
                                style={{ width: '100%' }}
                                placeholder="Nhập số ngày"
                            />
                        </div>
                    </Col>
                    <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontSize: '13px', color: '#595959' }}>Thành tiền:</span>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#cf1322' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        customJobLimit * 50000 + customJobDurationLimit * 10000
                                    )}
                                </div>
                            </div>
                            <Button
                                type="primary"
                                onClick={handleBuyCustomLimits}
                                loading={buyingCustom}
                                disabled={customJobLimit === 0 && customJobDurationLimit === 0}
                                style={{ borderRadius: '6px', fontWeight: 'bold', width: '80%' }}
                            >
                                Thanh Toán Ngay
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[24, 24]} justify="center">
                {packages.map((pkg) => (
                    <Col xs={24} sm={12} md={8} key={pkg.id}>
                        <Card
                            hoverable
                            style={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                borderRadius: '12px',
                                border: (pkg.hasAiSuggestCandidates || pkg.hasAiEvaluateResume || pkg.hasAiEvaluateCv) ? '2px solid #1677ff' : '1px solid #f0f0f0',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            bodyStyle={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '24px' }}
                        >
                            {(pkg.hasAiSuggestCandidates || pkg.hasAiEvaluateResume || pkg.hasAiEvaluateCv) && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 16, 
                                    right: -32, 
                                    background: '#1677ff', 
                                    color: 'white', 
                                    padding: '4px 32px',
                                    transform: 'rotate(45deg)',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    RECOMMENDED
                                </div>
                            )}

                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                {(pkg.hasAiSuggestCandidates || pkg.hasAiEvaluateResume || pkg.hasAiEvaluateCv) ? (
                                    <RocketOutlined style={{ fontSize: '48px', color: '#1677ff', marginBottom: '16px' }} />
                                ) : (
                                    <StarOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
                                )}
                                <Title level={3} style={{ margin: 0 }}>{pkg.name}</Title>
                                <div style={{ marginTop: '16px' }}>
                                    <Text style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                    </Text>
                                    <Text type="secondary"> / {pkg.durationDays} ngày</Text>
                                </div>
                            </div>

                            <Paragraph type="secondary" style={{ textAlign: 'center', minHeight: '44px' }}>
                                {pkg.description}
                            </Paragraph>

                            <Divider />

                            <div style={{ flex: 1 }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                                        <span>Đăng tối đa <strong>{pkg.jobLimit}</strong> công việc</span>
                                    </li>
                                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                                        <span>Thời hạn mỗi tin: <strong>{pkg.jobDurationLimit}</strong> ngày</span>
                                    </li>
                                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleOutlined style={{ color: pkg.hasAiSuggestCandidates ? '#52c41a' : '#d9d9d9', marginRight: '8px' }} />
                                        <span style={{ color: pkg.hasAiSuggestCandidates ? 'inherit' : '#bfbfbf', textDecoration: pkg.hasAiSuggestCandidates ? 'none' : 'line-through' }}>
                                            AI: Gợi ý Ứng viên (/suggest-candidates)
                                        </span>
                                    </li>
                                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleOutlined style={{ color: pkg.hasAiEvaluateResume ? '#52c41a' : '#d9d9d9', marginRight: '8px' }} />
                                        <span style={{ color: pkg.hasAiEvaluateResume ? 'inherit' : '#bfbfbf', textDecoration: pkg.hasAiEvaluateResume ? 'none' : 'line-through' }}>
                                            AI: Đánh giá Resume (/evaluate-resume)
                                        </span>
                                    </li>
                                    <li style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                                        <CheckCircleOutlined style={{ color: pkg.hasAiEvaluateCv ? '#52c41a' : '#d9d9d9', marginRight: '8px' }} />
                                        <span style={{ color: pkg.hasAiEvaluateCv ? 'inherit' : '#bfbfbf', textDecoration: pkg.hasAiEvaluateCv ? 'none' : 'line-through' }}>
                                            AI: Đánh giá CV (/evaluate-cv)
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <Button 
                                type={activePackageId === pkg.id ? "primary" : ((pkg.hasAiSuggestCandidates || pkg.hasAiEvaluateResume || pkg.hasAiEvaluateCv) ? "primary" : "default")}
                                danger={activePackageId === pkg.id}
                                size="large" 
                                block 
                                style={{ marginTop: '24px', borderRadius: '6px', fontWeight: 'bold' }}
                                loading={activePackageId === pkg.id ? canceling : buyingId === pkg.id}
                                onClick={() => activePackageId === pkg.id ? handleCancelPackage() : handleBuyPackage(pkg.id)}
                                disabled={hasActivePackage && activePackageId !== pkg.id}
                            >
                                {activePackageId === pkg.id 
                                    ? "Hủy Gói Cước" 
                                    : (hasActivePackage ? "Đang Hoạt Động Gói Khác" : "Mua Gói")}
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>

            {packages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Text type="secondary">Chưa có gói cước nào được tạo trong hệ thống.</Text>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
