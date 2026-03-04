import { message, notification } from "antd";
import { Link, useLocation } from "react-router-dom";
import { callLogin, callLoginGoogle } from "config/api";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { useAppSelector } from "@/redux/hooks";
import { GoogleLogin } from "@react-oauth/google";
import styles from "styles/auth.module.scss";

const LoginPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);

    const isAuthenticated = useAppSelector(
        (state) => state.account.isAuthenticated
    );

    const params = new URLSearchParams(location.search);
    const callback = params.get("callback");

    useEffect(() => {
        if (isAuthenticated) window.location.href = "/";
    }, [isAuthenticated]);

    // ================= COMMON SUCCESS HANDLER =================
    const handleLoginSuccess = (res: any, isGoogle = false) => {
        localStorage.setItem("access_token", res.data.access_token);
        dispatch(setUserLoginInfo(res.data.user));

        message.success(
            isGoogle ? "Đăng nhập Google thành công!" : "Đăng nhập thành công!"
        );

        window.location.href = callback || "/";
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
        >
            <div className="card p-4 shadow" style={{ width: "380px" }}>
                <h3 className="text-center mb-4 fw-bold">Đăng Nhập</h3>

                {/* LOCAL LOGIN */}
                <form onSubmit={onFinish}>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={isSubmit}
                    >
                        {isSubmit ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="text-center my-3 text-muted">
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
                    <Link to="/" className="btn btn-outline-secondary w-100">
                        ← Trang chủ
                    </Link>
                </div>

                <p className="text-center mt-3">
                    Chưa có tài khoản?
                    <Link to="/register" className="ms-1">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
