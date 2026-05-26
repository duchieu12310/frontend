import { Button, Divider, Form, Input, Select, message, notification } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
            // endpoints return void, Axios wraps in an object. Success is indicated by no exception (200 OK)
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
        <div className={styles["register-page"]} >
            <main className={styles.main} >
                <div className={styles.container} >
                    <section className={styles.wrapper} >
                        {step === 'form' ? (
                            <>
                                <div className={styles.heading} >
                                    <h2 className={`${styles.text} ${styles["text-large"]}`}> Đăng Ký Tài Khoản </h2>
                                    < Divider />
                                </div>
                                < Form
                                    form={form}
                                    name="basic"
                                    onFinish={onFinish}
                                    autoComplete="off"
                                >
                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Họ tên"
                                        name="name"
                                        rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Email"
                                        name="email"
                                        rules={[{ required: true, message: 'Email không được để trống!' }]}
                                    >
                                        <Input type='email' />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Tuổi"
                                        name="age"
                                        rules={[{ required: true, message: 'Tuổi không được để trống!' }]}
                                    >
                                        <Input type='number' />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        name="gender"
                                        label="Giới tính"
                                        rules={[{ required: true, message: 'Giới tính không được để trống!' }]}
                                    >
                                        <Select allowClear>
                                            <Option value="MALE">Nam</Option>
                                            <Option value="FEMALE">Nữ</Option>
                                            <Option value="OTHER">Khác</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Tỉnh/Thành phố"
                                        name="provinceId"
                                        rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố!' }]}
                                    >
                                        <Select
                                            placeholder="Chọn Tỉnh/Thành phố"
                                            onChange={handleProvinceChange}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={provinces.map(p => ({ label: p.name, value: p.id }))}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Quận/Huyện"
                                        name="districtId"
                                        rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện!' }]}
                                    >
                                        <Select
                                            placeholder="Chọn Quận/Huyện"
                                            onChange={handleDistrictChange}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={districts.map(d => ({ label: d.name, value: d.id }))}
                                            disabled={!districts.length}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Phường/Xã"
                                        name="wardId"
                                        rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã!' }]}
                                    >
                                        <Select
                                            placeholder="Chọn Phường/Xã"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={wards.map(w => ({ label: w.name, value: w.id }))}
                                            disabled={!wards.length}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Địa chỉ cụ thể (Số nhà, đường...)"
                                        name="detailAddress"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                                    >
                                        <Input placeholder="Nhập số nhà, tên đường..." />
                                    </Form.Item>

                                    <Form.Item
                                        labelCol={{ span: 24 }}
                                        label="Vai trò"
                                        name="roleName"
                                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                                    >
                                        <Select>
                                            <Option value="USER">Ứng viên</Option>
                                            <Option value="EMPLOYER">Nhà tuyển dụng (Đăng ký doanh nghiệp, đăng tin & duyệt hồ sơ)</Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={isSubmit} block style={{ borderRadius: '2rem' }}>
                                            Đăng ký
                                        </Button>
                                    </Form.Item>
                                    <Divider> Or </Divider>
                                    <p className="text text-normal" style={{ textAlign: 'center' }}> Đã có tài khoản ?
                                        <span>
                                            <Link to='/login' style={{ marginLeft: '6px' }}> Đăng Nhập </Link>
                                        </span>
                                    </p>
                                </Form>
                            </>
                        ) : (
                            <div className={styles["otp-wrapper"]}>
                                <div className={styles.heading} >
                                    <h2 className={`${styles.text} ${styles["text-large"]}`}> Xác Thực OTP </h2>
                                    <Divider />
                                </div>
                                <p className={styles.text} style={{ fontSize: '1rem', color: '#595959' }}>Mã xác thực gồm 6 chữ số đã được gửi tới email:</p>
                                <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0.5rem 0', color: '#1a73e8', wordBreak: 'break-all' }}>{email}</p>

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

                                <div className={styles["timer-text"]}>
                                    {timer > 0 ? (
                                        <>Mã OTP hết hiệu lực sau: <strong>{formatTime(timer)}</strong></>
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
                                    style={{ marginTop: '1.5rem', borderRadius: '2rem' }}
                                >
                                    Xác nhận
                                </Button>

                                <div className={styles["action-links"]}>
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={isResending || timer > 270}
                                        style={{
                                            fontWeight: 500,
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
                                                style={{ borderRadius: '1rem' }}
                                            />
                                            <Button
                                                type="dashed"
                                                onClick={handleChangeEmail}
                                                loading={isChangingEmail}
                                                style={{ borderRadius: '1rem' }}
                                            >
                                                Cập nhật
                                            </Button>
                                            <Button
                                                type="text"
                                                onClick={() => setShowChangeEmailInput(false)}
                                                style={{ borderRadius: '1rem' }}
                                            >
                                                Hủy
                                            </Button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setShowChangeEmailInput(true); setNewEmail(email); }}>
                                            Thay đổi email nhận mã
                                        </button>
                                    )}

                                    <Divider style={{ margin: '12px 0' }} />

                                    <button onClick={handleCancelRegistration} className={styles["btn-cancel"]} style={{ fontWeight: 500 }}>
                                        Hủy đăng ký tài khoản này
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;