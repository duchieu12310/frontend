import { message, notification } from "antd";
import { Link, useLocation } from "react-router-dom";
import { callLogin, callLoginGoogle } from "config/api";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { useAppSelector } from "@/redux/hooks";
import { GoogleLogin } from "@react-oauth/google";
import { RiseOutlined } from "@ant-design/icons";
import styles from "styles/auth.module.scss";

const LoginPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);

    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );
    const user = useAppSelector(
        (state) => state.account.user
    );

    const params = new URLSearchParams(location.search);
    const callback = params.get("callback");

    useEffect(() => {
        if (isAuthenticated) {
            if (user?.role?.id) {
                window.location.href = "http://localhost:3000/admin";
            } else {
                window.location.href = callback || "/";
            }
        }
    }, [isAuthenticated, user, callback]);

    // ================= COMMON SUCCESS HANDLER =================
    const handleLoginSuccess = (res: any, isGoogle = false) => {
        localStorage.setItem("access_token", res.data.access_token);
        dispatch(setUserLoginInfo(res.data.user));

        message.success(
            isGoogle ? "Đăng nhập Google thành công!" : "Đăng nhập thành công!"
        );

        if (res?.data?.user?.role) {
            window.location.href = "http://localhost:3000/admin";
        } else {
            window.location.href = callback || "/";
        }
    };

    // ================= LOCAL LOGIN =================
    const onFinish = async (e: any) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        setIsSubmit(true);
        try {
            const res = await callLogin(username, password);
            handleLoginSuccess(res);
        } catch (error: any) {
            notification.error({
                message: "Đăng nhập thất bại",
                description:
                    error?.response?.data?.message || "Có lỗi xảy ra"
            });
        } finally {
            setIsSubmit(false);
        }
    };

    // ================= GOOGLE LOGIN =================
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const idToken = credentialResponse.credential;
            const res = await callLoginGoogle(idToken);
            handleLoginSuccess(res, true);
        } catch (error: any) {
            notification.error({
                message: "Google Login thất bại",
                description:
                    error?.response?.data?.message || "Xác thực Google lỗi"
            });
        }
    };

    return (
        <div
            className={`${styles["login-page"]} d-flex justify-content-center align-items-center vh-100`}
            style={{
                background: "linear-gradient(135deg, #e6f0ec 0%, #ffffff 50%, #fef8f0 100%)",
                padding: "20px"
            }}
        >
            <div className={styles["auth-card"]}>
                {/* FORM SIDE */}
                <div className={styles["auth-form-side"]}>
                    <div className={styles["heading"]}>
                        <h2>Đăng Nhập</h2>
                        <div className="text-muted text-sm mt-1">Chào mừng bạn trở lại với JobEntry!</div>
                    </div>

                    {/* LOCAL LOGIN */}
                    <form onSubmit={onFinish}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-muted text-sm" style={{ fontSize: "14px" }}>Email / Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                placeholder="Nhập email hoặc tên tài khoản của bạn"
                                required
                                style={{ borderRadius: "8px", padding: "10px 14px", fontSize: "14px" }}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold text-muted text-sm" style={{ fontSize: "14px" }}>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                style={{ borderRadius: "8px", padding: "10px 14px", fontSize: "14px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2.5 fw-bold"
                            disabled={isSubmit}
                            style={{
                                borderRadius: "8px",
                                backgroundColor: "#14372f",
                                borderColor: "#14372f",
                                boxShadow: "0 4px 12px rgba(20, 55, 47, 0.15)",
                                fontSize: "15px"
                            }}
                        >
                            {isSubmit ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                    </form>

                    <div className="text-center my-3 text-muted text-sm" style={{ fontSize: "13px" }}>
                        —— Hoặc ——
                    </div>

                    {/* GOOGLE LOGIN */}
                    <div className="d-flex justify-content-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() =>
                                notification.error({
                                    message: "Google Login thất bại"
                                })
                            }
                        />
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/" className="btn btn-outline-secondary w-100 py-2" style={{ borderRadius: "8px", fontSize: "14px" }}>
                            ← Trở về trang chủ
                        </Link>
                    </div>

                    <div className="text-center mt-3 text-sm text-muted" style={{ fontSize: "13px" }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="fw-bold" style={{ color: "#14372f", textDecoration: "none" }}>
                            Đăng ký ngay
                        </Link>
                    </div>
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
                            Nhanh hơn. Dễ dàng hơn. Kết nối bạn với hàng ngàn cơ hội việc làm tốt nhất từ các doanh nghiệp hàng đầu.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
