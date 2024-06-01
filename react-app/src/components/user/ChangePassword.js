import React, { useState } from "react";
import { Card, Button, Input, Form, Divider, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserService from "../../services/UserService";
import { catchError, removeToken } from "../../services/DaoService";
import { useUserContext } from "../../providers/UserProvider";
export default function ChangePassword() {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const navigate = useNavigate();
    const {setCurrentUser} = useUserContext();

    const onFinish = (values) => {
        setLoading(true);
        setData(values);
        UserService.getInstance()
            .changePassword(values)
            .then(response => {
                nextStep();
            })
            .catch(error => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    };
    const onFinishCodeVerification = (values) => {
        const data_confirm = {
            otp: values.otp,
            old_password: data.old_password,
            password: data.password,
            password_confirmation: data.password_confirmation
        };
        setLoading(true);
        UserService.getInstance()
            .confirmChangePassword(data_confirm)
            .then(() => {
                setCurrentUser(null);
                removeToken();
                navigate('/login');
            })
            .catch(error => {
                catchError(error);
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };
    return (
        <div>
            <Divider plain><Card.Meta title={`Changement de mot de passe`} /></Divider>
            {/* <Steps current={currentStep}>
                <Step title="Change" />
                <Step title="Vérification du code de confirmation" />
            </Steps> */}
            {currentStep === 0 && (
                <Card>
                    <Form
                        form={form}
                        name="change_password"
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="old_password"
                            label="Ancien mot de passe"
                            rules={[{ required: true, message: 'Veuillez entrer votre ancien mot de passe!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Ancien mot de passe" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Nouveau mot de passe"
                            rules={[
                                { required: true, message: 'Veuillez entrer votre nouveau mot de passe!' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" />
                        </Form.Item>

                        <Form.Item
                            name="password_confirmation"
                            label="Confirmer le nouveau mot de passe"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Veuillez confirmer votre nouveau mot de passe!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Les deux mots de passe ne correspondent pas!'));
                                    }
                                })
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le nouveau mot de passe" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Changer le mot de passe
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            )}

            {currentStep === 1 && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinishCodeVerification}
                >
                    <Form.Item
                        label="Code de confirmation" help="Veuillez saisir le code de confirmation envoyé sur votre adresse e-mail."
                        name="otp"
                        rules={[
                            { required: true, message: 'Veuillez saisir le code de confirmation' },
                            { min: 6, message: 'Le code de confirmation doit contenir au moins 6 caractères' },
                            { max: 6, message: 'Le code de confirmation doit contenir au plus 6 caractères' },
                            // numerique
                            { pattern: /^[0-9]*$/, message: 'Le code de confirmation doit être numérique' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Space className="mt-3">
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Vérifier le code de confirmation
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
}