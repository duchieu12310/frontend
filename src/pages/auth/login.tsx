import { message, notification } from "antd";
import { Link, useLocation } from "react-router-dom";
import { callLogin } from "config/api";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLoginInfo } from "@/redux/slice/accountSlide";
import { useAppSelector } from "@/redux/hooks";
import styles from "styles/auth.module.scss";

const LoginPage = () => {
    const navigate = useLocation();
    const dispatch = useDispatch();
    const [isSubmit, setIsSubmit] = useState(false);
    const isAuthenticated = useAppSelector((state) => state.account.isAuthenticated);

    const params = new URLSearchParams(navigate.search);
    const callback = params.get("callback");

    useEffect(() => {
        if (isAuthenticated) window.location.href = "/";
    }, [isAuthenticated]);

    const onFinish = async (e: any) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        setIsSubmit(true);
        const res = await callLogin(username, password);
        setIsSubmit(false);

        if (res?.data) {
            localStorage.setItem("access_token", res.data.access_token);
            dispatch(setUserLoginInfo(res.data.user));

            message.success("Đăng nhập thành công!");
            window.location.href = callback || "/";
        } else {
            notification.error({
                message: "Có lỗi xảy ra",
                description:
                    res.message && Array.isArray(res.message)
                        ? res.message[0]
                        : res.message,
                duration: 4,
            });
        }
    };

    const handleLoginGoogle = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className={`${styles["login-page"]} d-flex justify-content-center align-items-center vh-100`}>
            <div className="card p-4 shadow" style={{ width: "380px", borderRadius: "14px" }}>
                <h3 className="text-center mb-4 fw-bold">Đăng Nhập</h3>

                <form onSubmit={onFinish}>
                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder="Nhập email"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-100 mt-2"
                        disabled={isSubmit}
                    >
                        {isSubmit ? "Đang xử lý..." : "Đăng nhập"}
                    </button>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={handleLoginGoogle}
                        className="btn btn-light w-100 mt-3 border d-flex align-items-center justify-content-center"
                        style={{ gap: "8px" }}
                    >
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="google"
                            width="20"
                        />
                        <span>Đăng nhập với Google</span>
                    </button>

                    {/* Divider */}
                    <div className="text-center my-3 text-muted">——  Hoặc  ——</div>

                    {/* Back to Home */}
                    <div className="text-center mb-3">
                        <Link to="/" className="btn btn-outline-secondary w-100">
                            ← Trang chủ
                        </Link>
                    </div>

                    {/* Register */}
                    <p className="text-center mt-2">
                        Chưa có tài khoản?
                        <Link to="/register" className="ms-1">Đăng ký</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
