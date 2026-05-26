import { useAppSelector } from "@/redux/hooks";
import { IJob, IFormatCV } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { Button, Col, ConfigProvider, Divider, Modal, Row, Upload, message, notification, Radio, Select } from "antd";
import { useNavigate, Link } from "react-router-dom";
import enUS from 'antd/lib/locale/en_US';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { callCreateResume, callUploadSingleFile, callFetchFormatCVs } from "@/config/api";
import { useState, useEffect } from 'react';
import dayjs from "dayjs";

interface IProps {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
    const { isModalOpen, setIsModalOpen, jobDetail } = props;
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [urlCV, setUrlCV] = useState<string>("");

    const [applyType, setApplyType] = useState<"upload" | "created">("upload");
    const [selectedCvId, setSelectedCvId] = useState<number | undefined>(undefined);
    const [listCV, setListCV] = useState<IFormatCV[]>([]);
    const [loadingCVs, setLoadingCVs] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchCVs = async () => {
            if (isAuthenticated && isModalOpen) {
                setLoadingCVs(true);
                try {
                    const res = await callFetchFormatCVs("page=1&size=100&sort=updatedAt,desc");
                    if (res && res.data) {
                        setListCV(res.data.result || []);
                    }
                } catch (error) {
                    console.error("Lỗi fetch CV: ", error);
                } finally {
                    setLoadingCVs(false);
                }
            }
        };
        fetchCVs();
    }, [isAuthenticated, isModalOpen]);

    const handleOkButton = async () => {
        if (applyType === "upload" && !urlCV && isAuthenticated) {
            message.error("Vui lòng upload CV!");
            return;
        }

        if (applyType === "created" && !selectedCvId && isAuthenticated) {
            message.error("Vui lòng chọn CV thiết kế!");
            return;
        }

        if (!isAuthenticated) {
            setIsModalOpen(false);
            navigate(`/login?callback=${window.location.href}`)
        }
        else {
            if (jobDetail) {
                const cvUrl = applyType === "upload" ? urlCV : "";
                const formatCvId = applyType === "created" ? selectedCvId : undefined;
                const res = await callCreateResume(cvUrl, jobDetail?.id, user.email, user.id, formatCvId);
                if (res.data) {
                    message.success("Rải CV thành công!");
                    setIsModalOpen(false);
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    });
                }
            }
        }
    }

    const propsUpload: UploadProps = {
        maxCount: 1,
        multiple: false,
        accept: "application/pdf,application/msword, .doc, .docx, .pdf",
        async customRequest({ file, onSuccess, onError }: any) {
            const res = await callUploadSingleFile(file, "resume");
            if (res && res.data) {
                setUrlCV(res.data.fileName);
                if (onSuccess) onSuccess('ok')
            } else {
                if (onError) {
                    setUrlCV("");
                    const error = new Error(res.message);
                    onError({ event: error });
                }
            }
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
            }
        },
    };


    return (
        <>
            <Modal title="Ứng Tuyển Job"
                open={isModalOpen}
                onOk={() => handleOkButton()}
                onCancel={() => setIsModalOpen(false)}
                maskClosable={false}
                okText={isAuthenticated ? "Rải CV Nào " : "Đăng Nhập Nhanh"}
                cancelButtonProps={
                    { style: { display: "none" } }
                }
                destroyOnClose={true}
            >
                <Divider />
                {isAuthenticated ?
                    <div>
                        <ConfigProvider locale={enUS}>
                            <ProForm
                                submitter={{
                                    render: () => <></>
                                }}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <div>
                                            Bạn đang ứng tuyển công việc <b>{jobDetail?.name} </b>tại  <b>{jobDetail?.company?.name}</b>
                                        </div>
                                    </Col>
                                    <Col span={24}>
                                        <ProFormText
                                            fieldProps={{
                                                type: "email"
                                            }}
                                            label="Email"
                                            name={"email"}
                                            labelAlign="right"
                                            disabled
                                            initialValue={user?.email}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <div style={{ marginBottom: 15 }}>
                                            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Hình thức nộp CV</label>
                                            <Radio.Group
                                                value={applyType}
                                                onChange={(e) => setApplyType(e.target.value)}
                                                optionType="button"
                                                buttonStyle="solid"
                                            >
                                                <Radio value="upload">Tải lên file CV mới</Radio>
                                                <Radio value="created">Chọn CV đã thiết kế</Radio>
                                            </Radio.Group>
                                        </div>
                                    </Col>
                                    {applyType === "upload" ? (
                                        <Col span={24}>
                                            <div style={{ marginBottom: 15 }}>
                                                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Tải lên file CV mới</label>
                                                <Upload {...propsUpload}>
                                                    <Button icon={<UploadOutlined />} style={{ width: "100%", textAlign: "left" }}>Tải lên CV của bạn ( Hỗ trợ *.doc, *.docx, *.pdf, and &lt; 5MB )</Button>
                                                </Upload>
                                            </div>
                                        </Col>
                                    ) : (
                                        <Col span={24}>
                                            <div style={{ marginBottom: 15 }}>
                                                <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Chọn bản CV đã thiết kế</label>
                                                {listCV.length > 0 ? (
                                                    <Select
                                                        placeholder="Chọn bản CV thiết kế đã lưu"
                                                        style={{ width: "100%" }}
                                                        value={selectedCvId}
                                                        onChange={(val) => setSelectedCvId(val)}
                                                        loading={loadingCVs}
                                                    >
                                                        {listCV.map((cv) => (
                                                            <Select.Option key={cv.id} value={cv.id}>
                                                                {cv.title} (Cập nhật: {cv.updatedAt ? dayjs(cv.updatedAt).format("DD-MM-YYYY HH:mm") : dayjs(cv.createdAt).format("DD-MM-YYYY HH:mm")})
                                                            </Select.Option>
                                                        ))}
                                                    </Select>
                                                ) : (
                                                    <div style={{ color: "#ff4d4f", fontSize: "14px" }}>
                                                        Bạn chưa tạo bản thiết kế CV nào. <Link to="/cv" onClick={() => setIsModalOpen(false)}>Bấm vào đây để tạo CV ngay!</Link>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                    )}
                                </Row>

                            </ProForm>
                        </ConfigProvider>
                    </div>
                    :
                    <div>
                        Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể "Rải CV" bạn nhé -.-
                    </div>
                }
                <Divider />
            </Modal>
        </>
    )
}
export default ApplyModal;
