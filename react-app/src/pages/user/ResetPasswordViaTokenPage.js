import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingPlaceholder from "../../components/utils/LoadingPlaceholder";
import { Button, Col, Form, Input, Layout, Result, Row, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import UserService from "../../services/UserService";
import Toast from "../../helpers/Toast";
import { catchError, removeToken } from "../../services/DaoService";

const { Content } = Layout;
const { Title } = Typography;

export default function ResetPasswordViaTokenPage() {
    const [verifying, setVerifying] = React.useState(true);
    const [verified, setVerified] = React.useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [uid, setUid] = React.useState(null);
    const [verificationErrorMsg, setVerificationErrorMsg] = React.useState(null);

    const onFinish = (values) => {
        values.uid = uid;
        setLoading(true);
        UserService.getInstance()
            .resetPassword(token, values)
            .then((response) => {
                Toast.success(response.message);
                removeToken();
                navigate('/login');
            }).catch((error) => {
                catchError(error);
            }).finally(() => {
                setLoading(false);
            });
        };
        
        const onFinishFailed = (errorInfo) => {
            console.log('Failed:', errorInfo);
        };
        
        React.useEffect(() => {
            if (!token) {
                return;
            }
            UserService.getInstance()
            .verifyEmail(token)
            .then((response) => {
                Toast.success(response.message);
                setUid(response.data.uid);
                setVerifying(false);
                setVerified(true);
            }).catch((error) => {
                setVerificationErrorMsg(error?.response?.data?.message);
                setVerified(false);
                catchError(error);
            }).finally(() => {
                setVerifying(false);
            });
        }, [token]);
        
        return (
        <Layout className="layout-default layout-signin">
            <Content className="signin">
                <Row gutter={[24, 0]} justify="space-around">
                    <Col
                        xs={{ span: 24, offset: 0 }}
                        lg={{ span: 6, offset: 2 }}
                        md={{ span: 12 }}
                    >
                        {verifying ? <Result extra={<LoadingPlaceholder rows={1} />}
                         status="info" icon={<LoadingOutlined />} title="Verification en cours"
                          subTitle="Veuillez patienter pendant que nous verifions le lien de réinitialisation..." /> : (
                            <>
                            {
                                verified ? (
                                    <>
                                <Title className="mb-15">Changement de mot de passe</Title>
                                <Title className="font-regular text-muted" level={5}>
                                    Veuillez saisir votre nouveau mot de passe et confirmer le changement.
                                </Title>
                                <Form className="row-col"
                                    form={form}
                                    name="changePasswordForm"
                                    layout="vertical"
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                >
                                    <Form.Item
                                        label="Nouveau mot de passe"
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Veuillez saisir votre nouveau mot de passe.',
                                            },
                                            {
                                                min: 6,
                                                message: 'Le mot de passe doit contenir au moins 6 caractères.',
                                            },
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        label="Confirmer le nouveau mot de passe"
                                        name="password_confirmation"
                                        dependencies={['password']}
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Veuillez confirmer votre nouveau mot de passe.',
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject('Les deux mots de passe ne correspondent pas.');
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button loading={loading} type="primary" htmlType="submit">
                                            Changer le mot de passe
                                        </Button>
                                    </Form.Item>
                                </Form>
                                    </>
                                ) : <Result status="error" title="Erreur de vérification" subTitle={verificationErrorMsg} />
                            }
                            </>
                        )}
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}