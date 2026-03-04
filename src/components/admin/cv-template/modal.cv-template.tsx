import { Modal, Form, Input, message, notification } from 'antd';
import { useState, useEffect } from 'react';
import { callCreateCVTemplate, callUpdateCVTemplate } from '@/config/api';
import { ICVTemplate } from '@/types/backend';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    reloadTable: () => void;
    dataInit: ICVTemplate | null;
    setDataInit: (v: any) => void;
}

const ModalCVTemplate = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            form.setFieldsValue({
                name: dataInit.name,
                thumbnailUrl: dataInit.thumbnailUrl,
                layoutConfig: dataInit.layoutConfig,
            })
        }
    }, [dataInit]);

    const handleOk = async (values: any) => {
        const { name, thumbnailUrl, layoutConfig } = values;
        setIsSubmit(true);
        if (dataInit?.id) {
            //update
            const res = await callUpdateCVTemplate({
                id: dataInit.id,
                name,
                thumbnailUrl,
                layoutConfig
            });
            if (res && res.data) {
                message.success('Cập nhật template thành công');
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const res = await callCreateCVTemplate({ name, thumbnailUrl, layoutConfig });
            if (res && res.data) {
                message.success('Thêm mới template thành công');
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
        setIsSubmit(false);
    };

    const handleReset = () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <Modal
            title={dataInit?.id ? "Cập nhật CV Template" : "Tạo mới CV Template"}
            open={openModal}
            onOk={() => form.submit()}
            onCancel={() => handleReset()}
            confirmLoading={isSubmit}
            width={600}
        >
            <Form
                name="basic"
                form={form}
                layout="vertical"
                onFinish={handleOk}
                autoComplete="off"
            >
                <Form.Item
                    label="Tên Template"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên template!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Ảnh Thumbnail (URL)"
                    name="thumbnailUrl"
                    rules={[{ required: true, message: 'Vui lòng nhập URL ảnh!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Cấu hình Layout (JSON/HTML)"
                    name="layoutConfig"
                >
                    <Input.TextArea rows={10} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ModalCVTemplate;
