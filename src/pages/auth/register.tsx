import { Button, Divider, Form, Input, Select, message, notification } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RiseOutlined } from '@ant-design/icons';
import {
    callRegister,
    callRegisterConfirm,
    callRegisterResend,
    callRegisterChangeEmail,
    callRegisterCancel,
    callFetchProvinces,
    callFetchDistricts,
    callFetchWards
} from 'config/api';
import styles from 'styles/auth.module.scss';
import { IProvince, IDistrict, IWard, IAddress } from '@/types/backend';
const { Option } = Select;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get('role');
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const [provinces, setProvinces] = useState<IProvince[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);
    const [wards, setWards] = useState<IWard[]>([]);

    // --- OTP State ---
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [userId, setUserId] = useState<number | null>(null);
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState<number>(300); // 5 minutes
    const [isResending, setIsResending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [showChangeEmailInput, setShowChangeEmailInput] = useState(false);
    const [newEmail, setNewEmail] = useState<string>('');

    useEffect(() => {
        const initProvinces = async () => {
            const res = await callFetchProvinces();
            if (res && res.data) {
                setProvinces(res.data);
            }
        };
        initProvinces();
    }, []);

    useEffect(() => {
        if (roleParam === 'employer') {
            form.setFieldsValue({ roleName: 'EMPLOYER' });
        } else {
            form.setFieldsValue({ roleName: 'USER' });
        }
    }, [roleParam, form]);

    // --- OTP Countdown Timer ---
    useEffect(() => {
        let interval: any;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleProvinceChange = async (provinceId: number) => {
        form.setFieldsValue({ districtId: undefined, wardId: undefined });
        setDistricts([]);
        setWards([]);
        const res = await callFetchDistricts(provinceId);
        if (res && res.data) {
            setDistricts(res.data);
        }
    };

    const handleDistrictChange = async (districtId: number) => {
        form.setFieldsValue({ wardId: undefined });
        setWards([]);
        const res = await callFetchWards(districtId);
        if (res && res.data) {
            setWards(res.data);
        }
    };

    // --- Form Submit Handler ---
    const onFinish = async (values: any) => {
        const { name, email, password, age, gender, provinceId, districtId, wardId, detailAddress, roleName } = values;

        const province = provinces.find(p => p.id === provinceId);
        const district = districts.find(d => d.id === districtId);
        const ward = wards.find(w => w.id === wardId);

        const address: IAddress = {
            line: detailAddress,
            province: province ? { id: province.id, name: province.name, code: province.code } : undefined,
            district: district ? { id: district.id, name: district.name, code: district.code } : undefined,
            ward: ward ? { id: ward.id, name: ward.name, code: ward.code } : undefined
        };

        setIsSubmit(true);
        try {
            const res = await callRegister(name, email, password as string, +age, gender, address, roleName);
            setIsSubmit(false);
            if (res?.data?.id) {
                message.success('Đăng ký tài khoản thành công! Vui lòng nhận OTP qua email.');
                setUserId(res.data.id);
                setEmail(email);
                setNewEmail(email);
                setTimer(300);
                setOtp(['', '', '', '', '', '']);
                setStep('otp');
                // Auto focus first OTP digit input
                setTimeout(() => {
                    const firstInput = document.getElementById('otp-0');
                    if (firstInput) firstInput.focus();
                }, 100);
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res.message && Array.isArray(res.message) ? res.message[0] : res.message,
                    duration: 5
                });
            }
        } catch (err: any) {
            setIsSubmit(false);
            notification.error({
                message: "Có lỗi xảy ra",
                description: err?.response?.data?.message || "Đăng ký không thành công. Vui lòng thử lại!"
            });
        }
    };

    // --- OTP Input Auto Focus Flow ---
    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        const value = element.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            if (otp[index] === '' && index > 0) {
                // Focus previous input and clear it
                newOtp[index - 1] = '';
                setOtp(newOtp);
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) {
                    (prevInput as HTMLInputElement).focus();
                }
            } else {
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    // --- OTP Action Handlers ---
    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            message.error('Vui lòng nhập đầy đủ mã OTP 6 chữ số!');
            return;
        }
        setIsVerifying(true);
        try {
            const res = await callRegisterConfirm(userId!, otpCode);
            setIsVerifying(false);
            message.success('Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.');
            navigate('/login');
        } catch (err: any) {
            setIsVerifying(false);
            const errorMsg = err?.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn!';
            notification.error({
                message: 'Lỗi xác thực',
                description: errorMsg
            });
            if (errorMsg.includes('hết hạn') || errorMsg.includes('expire')) {
                setTimer(300);
                setOtp(['', '', '', '', '', '']);
                const firstInput = document.getElementById('otp-0');
                if (firstInput) firstInput.focus();
            }
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        try {
            await callRegisterResend(userId!);
            setIsResending(false);
            message.success('Mã OTP mới đã được gửi lại vào email của bạn.');
            setTimer(300);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                if (firstInput) firstInput.focus();
            }, 100);
        } catch (err: any) {
            setIsResending(false);
            message.error(err?.response?.data?.message || 'Không thể gửi lại mã OTP, vui lòng thử lại!');
        }
    };

    const handleChangeEmail = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            message.error('Vui lòng nhập địa chỉ email hợp lệ!');
            return;
        }
        setIsChangingEmail(true);
        try {
            await callRegisterChangeEmail(userId!, newEmail);
            setIsChangingEmail(false);
            message.success(`Đã cập nhật email thành ${newEmail} và gửi mã OTP mới!`);
            setEmail(newEmail);
            setShowChangeEmailInput(false);
            setTimer(300);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => {
                const firstInput = document.getElementById('otp-0');
                if (firstInput) firstInput.focus();
            }, 100);
        } catch (err: any) {
            setIsChangingEmail(false);
            notification.error({
                message: 'Lỗi cập nhật email',
                description: err?.response?.data?.message || 'Không thể thay đổi email, vui lòng thử lại!'
            });
        }
    };

    const handleCancelRegistration = async () => {
        try {
            await callRegisterCancel(userId!);
            message.info('Đã hủy đăng ký tài khoản.');
            setStep('form');
            setOtp(['', '', '', '', '', '']);
            setUserId(null);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Không thể hủy đăng ký, vui lòng thử lại!');
        }
    };

    return (
        <div
            className={`${styles["register-page"]} d-flex justify-content-center align-items-center`}
            style={{
                background: "linear-gradient(135deg, #e6f0ec 0%, #ffffff 50%, #fef8f0 100%)",
                padding: "40px 20px",
                minHeight: "100vh"
            }}
        >
            <div className={`${styles["auth-card"]} ${styles["register-card"]}`}>
                {/* FORM SIDE */}
                <div className={styles["auth-form-side"]}>
                    {step === 'form' ? (
                        <>
                            <div className={styles.heading} style={{ marginBottom: '1.5rem' }}>
                                <h2>Đăng Ký Tài Khoản</h2>
                                <div className="text-muted text-sm mt-1">Cơ hội việc làm mới đang chờ bạn!</div>
                            </div>
                            <Form
                                form={form}
                                name="basic"
                                onFinish={onFinish}
                                autoComplete="off"
                                layout="vertical"
                            >
                                <Form.Item
                                    label="Họ tên"
                                    name="name"
                                    rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input placeholder="Nhập họ tên của bạn" style={{ borderRadius: '8px', padding: '8px 12px' }} />
                                </Form.Item>

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, message: 'Email không được để trống!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input type='email' placeholder="Nhập địa chỉ email" style={{ borderRadius: '8px', padding: '8px 12px' }} />
                                </Form.Item>

                                <Form.Item
                                    label="Mật khẩu"
                                    name="password"
                                    rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input.Password placeholder="Nhập mật khẩu bảo mật" style={{ borderRadius: '8px', padding: '8px 12px' }} />
                                </Form.Item>

                                <Form.Item
                                    label="Tuổi"
                                    name="age"
                                    rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input type='number' placeholder="Nhập số tuổi" style={{ borderRadius: '8px', padding: '8px 12px' }} />
                                </Form.Item>

                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                    rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Select allowClear placeholder="Chọn giới tính" style={{ height: '40px' }}>
                                        <Option value="MALE">Nam</Option>
                                        <Option value="FEMALE">Nữ</Option>
                                        <Option value="OTHER">Khác</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Tỉnh/Thành phố"
                                    name="provinceId"
                                    rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Select
                                        placeholder="Chọn Tỉnh/Thành phố"
                                        onChange={handleProvinceChange}
                                        showSearch
                                        style={{ height: '40px' }}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={provinces.map(p => ({ label: p.name, value: p.id }))}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Quận/Huyện"
                                    name="districtId"
                                    rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Select
                                        placeholder="Chọn Quận/Huyện"
                                        onChange={handleDistrictChange}
                                        showSearch
                                        style={{ height: '40px' }}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={districts.map(d => ({ label: d.name, value: d.id }))}
                                        disabled={!districts.length}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Phường/Xã"
                                    name="wardId"
                                    rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Select
                                        placeholder="Chọn Phường/Xã"
                                        showSearch
                                        style={{ height: '40px' }}
                                        filterOption={(input, option) =>
                                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                        }
                                        options={wards.map(w => ({ label: w.name, value: w.id }))}
                                        disabled={!wards.length}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Địa chỉ cụ thể (Số nhà, đường...)"
                                    name="detailAddress"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                                    style={{ marginBottom: '12px' }}
                                >
                                    <Input placeholder="Nhập số nhà, tên đường..." style={{ borderRadius: '8px', padding: '8px 12px' }} />
                                </Form.Item>

                                <Form.Item
                                    name="roleName"
                                    hidden
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: '16px' }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={isSubmit}
                                        block
                                        style={{
                                            borderRadius: '8px',
                                            height: '44px',
                                            fontWeight: 'bold',
                                            fontSize: '15px',
                                            backgroundColor: '#14372f',
                                            borderColor: '#14372f',
                                            boxShadow: '0 4px 12px rgba(20, 55, 47, 0.15)'
                                        }}
                                    >
                                        Đăng ký
                                    </Button>
                                </Form.Item>

                                <Divider style={{ margin: '16px 0' }}>Hoặc</Divider>

                                <p className="text text-normal text-center text-muted text-sm" style={{ fontSize: '13px', margin: 0 }}>
                                    Đã có tài khoản ?
                                    <Link to='/login' style={{ marginLeft: '6px', fontWeight: 'bold', color: '#14372f', textDecoration: 'none' }}>
                                        Đăng Nhập
                                    </Link>
                                </p>
                            </Form>
                        </>
                    ) : (
                        <div className={styles["otp-wrapper"]}>
                            <div className={styles.heading} style={{ marginBottom: '1.5rem' }}>
                                <h2>Xác Thực OTP</h2>
                                <div className="text-muted text-sm mt-1">Mã xác thực gồm 6 chữ số đã được gửi tới email:</div>
                            </div>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.5rem 0', color: '#14372f', wordBreak: 'break-all', textAlign: 'center' }}>{email}</p>

                            <div className={styles["otp-inputs"]}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target, index)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                        className={styles["otp-digit"]}
                                    />
                                ))}
                            </div>

                            <div className={styles["timer-text"]} style={{ textAlign: 'center', marginBottom: '20px' }}>
                                {timer > 0 ? (
                                    <>Mã OTP hết hiệu lực sau: <strong style={{ color: '#14372f' }}>{formatTime(timer)}</strong></>
                                ) : (
                                    <span style={{ color: '#f44336', fontWeight: 'bold' }}>Mã OTP đã hết hạn! Vui lòng bấm gửi lại mã mới.</span>
                                )}
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleVerifyOtp}
                                loading={isVerifying}
                                disabled={otp.join('').length < 6}
                                style={{
                                    borderRadius: '8px',
                                    height: '44px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#14372f',
                                    borderColor: '#14372f',
                                    boxShadow: '0 4px 12px rgba(20, 55, 47, 0.15)'
                                }}
                            >
                                Xác nhận
                            </Button>

                            <div className={styles["action-links"]}>
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResending || timer > 270}
                                    style={{
                                        fontWeight: 600,
                                        color: '#14372f',
                                        opacity: (isResending || timer > 270) ? 0.5 : 1,
                                        cursor: (isResending || timer > 270) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                                </button>

                                {showChangeEmailInput ? (
                                    <div style={{ marginTop: '0.5rem', width: '100%', display: 'flex', gap: '8px' }}>
                                        <Input
                                            placeholder="Nhập email mới"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            style={{ borderRadius: '8px' }}
                                        />
                                        <Button
                                            type="dashed"
                                            onClick={handleChangeEmail}
                                            loading={isChangingEmail}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Cập nhật
                                        </Button>
                                        <Button
                                            type="text"
                                            onClick={() => setShowChangeEmailInput(false)}
                                            style={{ borderRadius: '8px' }}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                ) : (
                                    <button onClick={() => { setShowChangeEmailInput(true); setNewEmail(email); }} style={{ color: '#14372f' }}>
                                        Thay đổi email nhận mã
                                    </button>
                                )}

                                <Divider style={{ margin: '16px 0' }} />

                                <button onClick={handleCancelRegistration} className={styles["btn-cancel"]} style={{ fontWeight: 500 }}>
                                    Hủy đăng ký tài khoản này
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* DECORATIVE SIDE */}
                <div className={styles["auth-decor-side"]}>
                    <div className={styles["decor-bg"]}></div>
                    <div className={styles["decor-bg-2"]}></div>
                    <div className={styles["decor-content"]}>
                        <div className={styles["decor-icon"]}>
                            <RiseOutlined />
                        </div>
                        <h3>JobEntry</h3>
                        <p>
                            Gia nhập cộng đồng tuyển dụng chất lượng cao. Tạo hồ sơ chuyên nghiệp và tiếp cận cơ hội việc làm nhanh chóng.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;